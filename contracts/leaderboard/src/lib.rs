#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String,
    Symbol, Vec,
};

const MAX_ENTRIES: u32 = 10;
/// Maximum allowed byte length for a player display name.
const PLAYER_NAME_MAX_LEN: u32 = 15;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum LeaderboardError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidDifficulty = 3,
    /// The supplied player name is empty, too long, or contains forbidden
    /// characters.  Only ASCII letters (A-Z, a-z), digits (0-9), and the
    /// space character (0x20) are permitted.
    InvalidPlayerName = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    PersonalBest(Address, Symbol),
    Leaderboard(Symbol),
    DailyLeaderboard(u32, Symbol),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ScoreEntry {
    pub player: Address,
    /// Sanitized display name provided by the player at submission time.
    pub player_name: String,
    pub difficulty: Symbol,
    pub score: u32,
    pub moves: u32,
    pub elapsed_secs: u32,
    pub submitted_at: u64,
}

#[contract]
pub struct StellarFlipLeaderboardContract;

#[contractimpl]
impl StellarFlipLeaderboardContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            env.panic_with_error(LeaderboardError::AlreadyInitialized);
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn submit_score(
        env: Env,
        player: Address,
        player_name: String,
        difficulty: Symbol,
        score: u32,
        moves: u32,
        elapsed_secs: u32,
        challenge_day: u32,
    ) -> ScoreEntry {
        ensure_initialized(&env);
        validate_difficulty(&env, &difficulty);
        validate_player_name(&env, &player_name);
        player.require_auth();

        let entry = ScoreEntry {
            player: player.clone(),
            player_name,
            difficulty: difficulty.clone(),
            score,
            moves,
            elapsed_secs,
            submitted_at: env.ledger().timestamp(),
        };

        update_personal_best(&env, player.clone(), difficulty.clone(), entry.clone());
        update_board(&env, DataKey::Leaderboard(difficulty.clone()), entry.clone());

        if challenge_day > 0 {
            update_board(
                &env,
                DataKey::DailyLeaderboard(challenge_day, difficulty.clone()),
                entry.clone(),
            );
        }

        env.events().publish((symbol_short!("score"), difficulty), score);
        entry
    }

    pub fn get_top_scores(env: Env, difficulty: Symbol) -> Vec<ScoreEntry> {
        ensure_initialized(&env);
        validate_difficulty(&env, &difficulty);
        read_board(&env, DataKey::Leaderboard(difficulty))
    }

    pub fn get_daily_top_scores(env: Env, difficulty: Symbol, challenge_day: u32) -> Vec<ScoreEntry> {
        ensure_initialized(&env);
        validate_difficulty(&env, &difficulty);
        read_board(&env, DataKey::DailyLeaderboard(challenge_day, difficulty))
    }

    pub fn get_personal_best(env: Env, player: Address, difficulty: Symbol) -> Option<ScoreEntry> {
        ensure_initialized(&env);
        validate_difficulty(&env, &difficulty);
        env.storage()
            .persistent()
            .get(&DataKey::PersonalBest(player, difficulty))
    }
}

fn ensure_initialized(env: &Env) {
    if !env.storage().instance().has(&DataKey::Admin) {
        env.panic_with_error(LeaderboardError::NotInitialized);
    }
}

fn validate_difficulty(env: &Env, difficulty: &Symbol) {
    if *difficulty != symbol_short!("easy") && *difficulty != symbol_short!("medium") {
        env.panic_with_error(LeaderboardError::InvalidDifficulty);
    }
}

/// Validate the player display name.
///
/// Rules (mirrors `sanitizePlayerName` in the frontend):
/// - Length must be between 1 and [`PLAYER_NAME_MAX_LEN`] bytes (inclusive).
/// - Every byte must be an ASCII letter (A–Z / a–z), ASCII digit (0–9), or
///   the ASCII space character (0x20).
///
/// Soroban `String` is UTF-8, but we only permit the strict ASCII subset, so
/// iterating over raw bytes is both correct and cheap.
fn validate_player_name(env: &Env, name: &String) {
    let len = name.len();

    if len == 0 || len > PLAYER_NAME_MAX_LEN {
        env.panic_with_error(LeaderboardError::InvalidPlayerName);
    }

    // Copy the bytes into a fixed-size stack buffer for inspection.
    // PLAYER_NAME_MAX_LEN is 15, so we never allocate on the heap here.
    let mut buf = [0u8; 15];
    name.copy_into_slice(&mut buf[..len as usize]);

    for i in 0..len as usize {
        let byte = buf[i];
        let allowed = byte.is_ascii_alphanumeric() || byte == b' ';
        if !allowed {
            env.panic_with_error(LeaderboardError::InvalidPlayerName);
        }
    }
}

fn update_personal_best(env: &Env, player: Address, difficulty: Symbol, entry: ScoreEntry) {
    let key = DataKey::PersonalBest(player, difficulty);
    let current: Option<ScoreEntry> = env.storage().persistent().get(&key);

    match current {
        Some(existing) if !ranks_before(&entry, &existing) => {}
        _ => env.storage().persistent().set(&key, &entry),
    }
}

fn update_board(env: &Env, key: DataKey, entry: ScoreEntry) {
    let current = read_board(env, key.clone());
    let mut filtered = Vec::new(env);

    for existing in current.iter() {
        if existing.player != entry.player {
            filtered.push_back(existing);
        }
    }

    let mut next = Vec::new(env);
    let mut inserted = false;

    for existing in filtered.iter() {
        if !inserted && ranks_before(&entry, &existing) {
            next.push_back(entry.clone());
            inserted = true;
        }

        if next.len() < MAX_ENTRIES {
            next.push_back(existing);
        }
    }

    if !inserted && next.len() < MAX_ENTRIES {
        next.push_back(entry);
    }

    env.storage().persistent().set(&key, &next);
}

fn read_board(env: &Env, key: DataKey) -> Vec<ScoreEntry> {
    env.storage().persistent().get(&key).unwrap_or(Vec::new(env))
}

fn ranks_before(a: &ScoreEntry, b: &ScoreEntry) -> bool {
    if a.score != b.score {
        return a.score > b.score;
    }

    if a.elapsed_secs != b.elapsed_secs {
        return a.elapsed_secs < b.elapsed_secs;
    }

    a.moves < b.moves
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, String};

    #[test]
    fn stores_global_and_daily_scores() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(StellarFlipLeaderboardContract, ());
        let client = StellarFlipLeaderboardContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let alice = Address::generate(&env);
        let name = String::from_str(&env, "Alice");

        client.initialize(&admin);
        client.submit_score(&alice, &name, &symbol_short!("easy"), &1200, &14, &45, &20260709);

        let global = client.get_top_scores(&symbol_short!("easy"));
        let daily = client.get_daily_top_scores(&symbol_short!("easy"), &20260709);
        let personal = client.get_personal_best(&alice, &symbol_short!("easy"));

        assert_eq!(global.len(), 1);
        assert_eq!(daily.len(), 1);
        assert_eq!(personal.unwrap().score, 1200);
    }

    #[test]
    fn keeps_best_score_per_player() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(StellarFlipLeaderboardContract, ());
        let client = StellarFlipLeaderboardContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let alice = Address::generate(&env);
        let name = String::from_str(&env, "Alice");

        client.initialize(&admin);
        client.submit_score(&alice, &name, &symbol_short!("medium"), &800, &30, &90, &0);
        client.submit_score(&alice, &name, &symbol_short!("medium"), &1400, &24, &70, &0);

        let global = client.get_top_scores(&symbol_short!("medium"));
        assert_eq!(global.len(), 1);
        assert_eq!(global.get(0).unwrap().score, 1400);
    }

    #[test]
    fn rejects_name_with_html_chars() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(StellarFlipLeaderboardContract, ());
        let client = StellarFlipLeaderboardContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let attacker = Address::generate(&env);

        client.initialize(&admin);

        // Names containing HTML/JS characters must be rejected.
        let bad_names = [
            "<script>",
            "alice&bob",
            "name\"here",
            "test>payload",
            "foo'bar",
        ];

        for bad in bad_names.iter() {
            let name = String::from_str(&env, bad);
            let result = client.try_submit_score(
                &attacker,
                &name,
                &symbol_short!("easy"),
                &100,
                &10,
                &30,
                &0,
            );
            assert!(
                result.is_err(),
                "Expected rejection for name: {bad}"
            );
        }
    }

    #[test]
    fn rejects_name_exceeding_max_length() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(StellarFlipLeaderboardContract, ());
        let client = StellarFlipLeaderboardContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let player = Address::generate(&env);

        client.initialize(&admin);

        // 16 characters — one over the 15-char limit.
        let too_long = String::from_str(&env, "AAAAAAAAAAAAAAAA");
        let result = client.try_submit_score(
            &player,
            &too_long,
            &symbol_short!("easy"),
            &100,
            &10,
            &30,
            &0,
        );
        assert!(result.is_err(), "Expected rejection for name longer than 15 chars");
    }

    #[test]
    fn rejects_empty_name() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(StellarFlipLeaderboardContract, ());
        let client = StellarFlipLeaderboardContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let player = Address::generate(&env);

        client.initialize(&admin);

        let empty = String::from_str(&env, "");
        let result = client.try_submit_score(
            &player,
            &empty,
            &symbol_short!("easy"),
            &100,
            &10,
            &30,
            &0,
        );
        assert!(result.is_err(), "Expected rejection for empty name");
    }

    #[test]
    fn accepts_valid_alphanumeric_name_with_spaces() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(StellarFlipLeaderboardContract, ());
        let client = StellarFlipLeaderboardContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let player = Address::generate(&env);

        client.initialize(&admin);

        // Exactly 15 chars with spaces and mixed case — should succeed.
        let name = String::from_str(&env, "Pilot 9 AlphaX");
        client.submit_score(&player, &name, &symbol_short!("easy"), &500, &20, &60, &0);

        let scores = client.get_top_scores(&symbol_short!("easy"));
        assert_eq!(scores.len(), 1);
    }
}
