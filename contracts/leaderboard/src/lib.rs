#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Symbol, Vec,
};

const MAX_ENTRIES: u32 = 10;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum LeaderboardError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidDifficulty = 3,
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
        difficulty: Symbol,
        score: u32,
        moves: u32,
        elapsed_secs: u32,
        challenge_day: u32,
    ) -> ScoreEntry {
        ensure_initialized(&env);
        validate_difficulty(&env, &difficulty);
        player.require_auth();

        let entry = ScoreEntry {
            player: player.clone(),
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
    use soroban_sdk::{testutils::Address as _, Address};

    #[test]
    fn stores_global_and_daily_scores() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(StellarFlipLeaderboardContract, ());
        let client = StellarFlipLeaderboardContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let alice = Address::generate(&env);

        client.initialize(&admin);
        client.submit_score(&alice, &symbol_short!("easy"), &1200, &14, &45, &20260709);

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

        client.initialize(&admin);
        client.submit_score(&alice, &symbol_short!("medium"), &800, &30, &90, &0);
        client.submit_score(&alice, &symbol_short!("medium"), &1400, &24, &70, &0);

        let global = client.get_top_scores(&symbol_short!("medium"));
        assert_eq!(global.len(), 1);
        assert_eq!(global.get(0).unwrap().score, 1400);
    }
}
