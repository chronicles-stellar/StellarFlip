#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
    Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum CardError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidDifficulty = 3,
    TokenNotFound = 4,
    Unauthorized = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    BaseUri,
    NextTokenId,
    TotalSupply,
    Owner(u32),
    Metadata(u32),
    Owned(Address),
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CardMetadata {
    pub token_id: u32,
    pub pair_id: u32,
    pub name: String,
    pub glyph: String,
    pub rarity: Symbol,
    pub constellation: Symbol,
}

#[contract]
pub struct StellarFlipCardContract;

#[contractimpl]
impl StellarFlipCardContract {
    pub fn initialize(env: Env, admin: Address, base_uri: String) {
        if env.storage().instance().has(&DataKey::Admin) {
            env.panic_with_error(CardError::AlreadyInitialized);
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::BaseUri, &base_uri);
        env.storage().instance().set(&DataKey::NextTokenId, &1_u32);
        env.storage().instance().set(&DataKey::TotalSupply, &0_u32);
    }

    pub fn mint_starter_pack(env: Env, to: Address, difficulty: Symbol) -> Vec<u32> {
        ensure_initialized(&env);
        to.require_auth();

        let template_ids = starter_pack_templates(&env, difficulty);
        let mut minted = Vec::new(&env);

        for pair_id in template_ids.iter() {
            let token_id = mint_token(&env, to.clone(), pair_id);
            minted.push_back(token_id);
        }

        minted
    }

    pub fn admin_mint(env: Env, to: Address, pair_id: u32) -> u32 {
        ensure_initialized(&env);
        let admin = read_admin(&env);
        admin.require_auth();
        mint_token(&env, to, pair_id)
    }

    pub fn transfer(env: Env, from: Address, to: Address, token_id: u32) {
        ensure_initialized(&env);
        from.require_auth();

        let current_owner = owner_of_internal(&env, token_id);
        if current_owner != from {
            env.panic_with_error(CardError::Unauthorized);
        }

        remove_owned_token(&env, from.clone(), token_id);
        append_owned_token(&env, to.clone(), token_id);
        env.storage().persistent().set(&DataKey::Owner(token_id), &to);
        env.events()
            .publish((symbol_short!("transfer"), from, to), token_id);
    }

    pub fn owner_of(env: Env, token_id: u32) -> Address {
        ensure_initialized(&env);
        owner_of_internal(&env, token_id)
    }

    pub fn get_token(env: Env, token_id: u32) -> CardMetadata {
        ensure_initialized(&env);
        env.storage()
            .persistent()
            .get(&DataKey::Metadata(token_id))
            .unwrap_or_else(|| env.panic_with_error(CardError::TokenNotFound))
    }

    pub fn tokens_of_owner(env: Env, owner: Address) -> Vec<u32> {
        ensure_initialized(&env);
        read_owned_tokens(&env, owner)
    }

    pub fn balance_of(env: Env, owner: Address) -> u32 {
        ensure_initialized(&env);
        read_owned_tokens(&env, owner).len()
    }

    pub fn total_supply(env: Env) -> u32 {
        ensure_initialized(&env);
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }

    pub fn base_uri(env: Env) -> String {
        ensure_initialized(&env);
        env.storage()
            .instance()
            .get(&DataKey::BaseUri)
            .unwrap_or_else(|| env.panic_with_error(CardError::NotInitialized))
    }
}

fn ensure_initialized(env: &Env) {
    if !env.storage().instance().has(&DataKey::Admin) {
        env.panic_with_error(CardError::NotInitialized);
    }
}

fn read_admin(env: &Env) -> Address {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .unwrap_or_else(|| env.panic_with_error(CardError::NotInitialized))
}

fn owner_of_internal(env: &Env, token_id: u32) -> Address {
    env.storage()
        .persistent()
        .get(&DataKey::Owner(token_id))
        .unwrap_or_else(|| env.panic_with_error(CardError::TokenNotFound))
}

fn starter_pack_templates(env: &Env, difficulty: Symbol) -> Vec<u32> {
    let easy = symbol_short!("easy");
    let medium = symbol_short!("medium");
    let mut templates = Vec::new(env);

    if difficulty == easy {
        templates.push_back(0);
        templates.push_back(1);
        templates.push_back(2);
        templates.push_back(3);
        templates.push_back(4);
        templates.push_back(5);
        templates.push_back(6);
        templates.push_back(7);
        return templates;
    }

    if difficulty == medium {
        templates.push_back(0);
        templates.push_back(1);
        templates.push_back(2);
        templates.push_back(3);
        templates.push_back(4);
        templates.push_back(5);
        templates.push_back(6);
        templates.push_back(7);
        templates.push_back(8);
        templates.push_back(9);
        templates.push_back(10);
        templates.push_back(11);
        templates.push_back(12);
        templates.push_back(13);
        templates.push_back(14);
        templates.push_back(15);
        templates.push_back(16);
        templates.push_back(17);
        return templates;
    }

    env.panic_with_error(CardError::InvalidDifficulty)
}

fn mint_token(env: &Env, owner: Address, pair_id: u32) -> u32 {
    let token_id: u32 = env.storage().instance().get(&DataKey::NextTokenId).unwrap_or(1);
    let metadata = build_metadata(env, token_id, pair_id);

    env.storage().persistent().set(&DataKey::Owner(token_id), &owner);
    env.storage()
        .persistent()
        .set(&DataKey::Metadata(token_id), &metadata);
    append_owned_token(env, owner.clone(), token_id);

    let next_token_id = token_id + 1;
    let total_supply: u32 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);

    env.storage().instance().set(&DataKey::NextTokenId, &next_token_id);
    env.storage().instance().set(&DataKey::TotalSupply, &(total_supply + 1));
    env.events().publish((symbol_short!("mint"), owner), token_id);

    token_id
}

fn append_owned_token(env: &Env, owner: Address, token_id: u32) {
    let key = DataKey::Owned(owner);
    let mut owned: Vec<u32> = env.storage().persistent().get(&key).unwrap_or(Vec::new(env));
    owned.push_back(token_id);
    env.storage().persistent().set(&key, &owned);
}

fn remove_owned_token(env: &Env, owner: Address, token_id: u32) {
    let key = DataKey::Owned(owner);
    let current: Vec<u32> = env.storage().persistent().get(&key).unwrap_or(Vec::new(env));
    let mut next = Vec::new(env);

    for existing in current.iter() {
        if existing != token_id {
            next.push_back(existing);
        }
    }

    env.storage().persistent().set(&key, &next);
}

fn read_owned_tokens(env: &Env, owner: Address) -> Vec<u32> {
    env.storage()
        .persistent()
        .get(&DataKey::Owned(owner))
        .unwrap_or(Vec::new(env))
}

fn build_metadata(env: &Env, token_id: u32, pair_id: u32) -> CardMetadata {
    let rarity = if pair_id >= 8 {
        symbol_short!("rare")
    } else {
        symbol_short!("core")
    };

    match pair_id {
        0 => make_metadata(env, token_id, pair_id, "Nova Spark", "✦", rarity, symbol_short!("orion")),
        1 => make_metadata(env, token_id, pair_id, "Orbital Bloom", "🪐", rarity, symbol_short!("lyra")),
        2 => make_metadata(env, token_id, pair_id, "Comet Trail", "☄", rarity, symbol_short!("draco")),
        3 => make_metadata(env, token_id, pair_id, "Moon Echo", "☾", rarity, symbol_short!("hydra")),
        4 => make_metadata(env, token_id, pair_id, "Photon Pulse", "✺", rarity, symbol_short!("ursa")),
        5 => make_metadata(env, token_id, pair_id, "Rocket Relay", "🜂", rarity, symbol_short!("vela")),
        6 => make_metadata(env, token_id, pair_id, "Stellar Token", "⬢", rarity, symbol_short!("centa")),
        7 => make_metadata(env, token_id, pair_id, "Soroban Rune", "⌘", rarity, symbol_short!("pavo")),
        8 => make_metadata(env, token_id, pair_id, "Nebula Bloom", "✹", rarity, symbol_short!("cygnu")),
        9 => make_metadata(env, token_id, pair_id, "Aurora Arc", "⚡", rarity, symbol_short!("aquil")),
        10 => make_metadata(env, token_id, pair_id, "Gravity Well", "◉", rarity, symbol_short!("perse")),
        11 => make_metadata(env, token_id, pair_id, "Quasar Crest", "✶", rarity, symbol_short!("tauru")),
        12 => make_metadata(env, token_id, pair_id, "Solar Halo", "☼", rarity, symbol_short!("aries")),
        13 => make_metadata(env, token_id, pair_id, "Meteor Ring", "⟡", rarity, symbol_short!("carin")),
        14 => make_metadata(env, token_id, pair_id, "Astro Lattice", "⌬", rarity, symbol_short!("volan")),
        15 => make_metadata(env, token_id, pair_id, "Zenith Pulse", "✷", rarity, symbol_short!("lupus")),
        16 => make_metadata(env, token_id, pair_id, "Orbit Key", "☍", rarity, symbol_short!("lepus")),
        _ => make_metadata(env, token_id, pair_id, "Celestial Prism", "❖", rarity, symbol_short!("colum")),
    }
}

fn make_metadata(
    env: &Env,
    token_id: u32,
    pair_id: u32,
    name: &str,
    glyph: &str,
    rarity: Symbol,
    constellation: Symbol,
) -> CardMetadata {
    CardMetadata {
        token_id,
        pair_id,
        name: String::from_str(env, name),
        glyph: String::from_str(env, glyph),
        rarity,
        constellation,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address};

    const EASY_PACK_SIZE: u32 = 8;
    const MEDIUM_PACK_SIZE: u32 = 18;

    #[test]
    fn mints_easy_pack() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(StellarFlipCardContract, ());
        let client = StellarFlipCardContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let player = Address::generate(&env);

        client.initialize(&admin, &String::from_str(&env, "ipfs://stellar-flip"));
        let minted = client.mint_starter_pack(&player, &symbol_short!("easy"));

        assert_eq!(minted.len(), EASY_PACK_SIZE);
        assert_eq!(client.balance_of(&player), EASY_PACK_SIZE);
        assert_eq!(client.total_supply(), EASY_PACK_SIZE);
    }

    #[test]
    fn transfers_token_between_players() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(StellarFlipCardContract, ());
        let client = StellarFlipCardContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let alice = Address::generate(&env);
        let bob = Address::generate(&env);

        client.initialize(&admin, &String::from_str(&env, "ipfs://stellar-flip"));
        let minted = client.mint_starter_pack(&alice, &symbol_short!("easy"));
        let token_id = minted.get(0).unwrap();

        client.transfer(&alice, &bob, &token_id);

        assert_eq!(client.owner_of(&token_id), bob);
        assert_eq!(client.balance_of(&alice), EASY_PACK_SIZE - 1);
        assert_eq!(client.balance_of(&bob), 1);
    }

    #[test]
    fn mints_medium_pack() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(StellarFlipCardContract, ());
        let client = StellarFlipCardContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let player = Address::generate(&env);

        client.initialize(&admin, &String::from_str(&env, "ipfs://stellar-flip"));
        let minted = client.mint_starter_pack(&player, &symbol_short!("medium"));

        assert_eq!(minted.len(), MEDIUM_PACK_SIZE);
        let token = client.get_token(&1);
        assert_eq!(token.token_id, 1);
    }
}
