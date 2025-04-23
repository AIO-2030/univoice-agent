
use candid::{CandidType, Principal, Nat};
use serde::{Deserialize, Serialize};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{BlockIndex, NumTokens, TransferArg, TransferError};
use icrc_ledger_types::{
    icrc2::transfer_from::{TransferFromArgs, TransferFromError},
};
use icrc_ledger_types::icrc::generic_metadata_value::MetadataValue;
use crate::buss_types::get_info_by_key;

type TransferResult = Result<Nat, TransferError>;


#[derive(CandidType, Debug, Clone, Deserialize)]
pub struct Account__3 {
    pub owner: Principal,
    pub subaccount: Option<Vec<u8>>,
}

#[derive(CandidType, Debug, Clone, Deserialize)]
pub struct Icrc37_TransferFromArg {
    pub token_id: Nat,
    pub from: Account__3,
    pub to: Account__3,
    pub spender_subaccount: Option<Vec<u8>>,
    pub memo: Option<Vec<u8>>,
    pub created_at_time: Option<u64>,
}

type TransferFromResult = Result<Nat, TransferError>;


#[derive(CandidType,Debug, Clone, Serialize, Deserialize)]
pub struct NFTCollection {
    pub name: String,
    pub symbol: String,
    pub description: Option<String>,
    pub logo: Option<String>,
    pub supply_cap: Option<u128>,
    pub total_supply: u128,
    pub owner: Principal,
    pub allowed_transfers: bool,
    pub expired_at: Option<u64>
}
impl NFTCollection {
    pub async fn init_nft_collection(collection_id: &str) -> Result<Self, String> {
        let principal = Principal::from_text(collection_id)
            .map_err(|e| format!("Invalid collection ID: {}", e))?;

        // Get name
        let name: (String,) = ic_cdk::call(principal, "icrc7_name", ())
            .await
            .map_err(|e| format!("Failed to get name: {:?}", e))?;

        // Get symbol  
        let symbol: (String,) = ic_cdk::call(principal, "icrc7_symbol", ())
            .await
            .map_err(|e| format!("Failed to get symbol: {:?}", e))?;

        // Get description
        let description: (Option<String>,) = ic_cdk::call(principal, "icrc7_description", ())
            .await
            .map_err(|e| format!("Failed to get description: {:?}", e))?;

        // Get logo
        let logo: (Option<String>,) = ic_cdk::call(principal, "icrc7_logo", ())
            .await
            .map_err(|e| format!("Failed to get logo: {:?}", e))?;

        // Get supply cap
        let supply_cap: (Option<Nat>,) = ic_cdk::call(principal, "icrc7_supply_cap", ())
            .await
            .map_err(|e| format!("Failed to get supply cap: {:?}", e))?;

        // Get total supply
        let total_supply: (Nat,) = ic_cdk::call(principal, "icrc7_total_supply", ())
            .await
            .map_err(|e| format!("Failed to get total supply: {:?}", e))?;

        Ok(Self {
            name: name.0,
            symbol: symbol.0,
            description: description.0,
            logo: logo.0,
            supply_cap: supply_cap.0.map(|n| n.0.try_into().unwrap_or(0)),
            total_supply: total_supply.0.0.try_into().unwrap_or(0),
            owner: principal,
            allowed_transfers: true,
            expired_at: None
        })
    }
}


#[derive(CandidType,Debug, Clone, Serialize, Deserialize)]
pub struct UserNFTHolding {
    pub owner: Principal,
    pub nft_colletion_id:String,
    pub token_ids: Vec<u128>,
    pub expired_at: Option<u64>,
}
impl UserNFTHolding {
    pub async fn total_nft_supply(nft_collection_id: &String) -> Result<Nat, String> {
        ic_cdk::call::<(), (Nat,)>(
            Principal::from_text(nft_collection_id).expect("Could not decode the principal."),
            "icrc7_total_supply",
            (),
        )
        .await
        .map_err(|e| format!("failed to call ledger: {:?}", e))
        .map(|r| r.0)
    }
}
impl UserNFTHolding {
    async fn init_nft_tokens(nft_collection_id:String) -> Vec<Vec<Nat>> {
        let mut tokens_shard: Vec<Nat> = Vec::new();
        let mut nft_tokens_param: Vec<Vec<Nat>> = Vec::new();
        let max_tokenid: Nat = Self::total_nft_supply(&nft_collection_id).await.expect("Failed to get total NFT supply");
        ic_cdk::println!("Total Nft Supply is {}", &max_tokenid);
    
        let mut i: u128 = 0 as u128;
        let mut i_shard: u128 = 0 as u128;
    
        let glb_shard_size = 50;
        loop {
            tokens_shard.push(Nat::from(i.clone()));
            i += 1;
            i_shard += 1;
    
            if Nat::from(i_shard).eq(&Nat::from(glb_shard_size as u128)) {
                nft_tokens_param.push(tokens_shard.clone());
                tokens_shard.clear();
                i_shard = 0;
                ic_cdk::println!("Init Nft shard to Index of {}", i);
            }
    
            if Nat::from(i) == max_tokenid {
                break;
            }
        }
        if tokens_shard.len() > 0 {
            nft_tokens_param.push(tokens_shard.clone());
            tokens_shard.clear();
        }
        return nft_tokens_param;
    }
}
impl NFTCollection {
    pub async fn get_min_available_token_id(&self, principalid: &str) -> Result<Option<u128>, String> {
        for token_id in 0..self.total_supply {
            let owner: (Vec<Option<Account__3>>,) = ic_cdk::call(
                self.owner,
                "icrc7_owner_of",
                (vec![Nat::from(token_id)],)
            )
            .await
            .map_err(|e| format!("Failed to get owner: {:?}", e))?;
            
            if let Some(account) = owner.0.get(0).and_then(|a| a.as_ref()) {
                if account.owner.to_string() != principalid {
                    return Ok(Some(token_id));
                }
            }
        }
        Ok(None)
    }
}

impl UserNFTHolding {
    pub async fn construct_user_nft_holding(
        owner: Principal,
        nft_canister_key: &str,
    ) -> Result<Self, String> {
        // Get NFT canister id from CommonInfoCfg
        let nft_canister = match get_info_by_key(&nft_canister_key.to_string()) {
            Some(info) => info.content,
            None => return Err("NFT canister configuration not found".to_string()),
        };

        // Call icrc7_owner_of on the NFT canister
        // Get all token IDs from init_nft_tokens
        let token_shards = Self::init_nft_tokens(nft_canister.clone()).await;
        let mut owned_token_ids: Vec<Nat> = Vec::new();
        
        for shard in token_shards {
            let accounts = ic_cdk::call::<(Vec<Nat>,), (Vec<Option<Account>>,)>(
            Principal::from_text(&nft_canister).expect("Could not decode the principal."),
            "icrc7_owner_of",
            (shard.clone(),),
            )
            .await
            .map_err(|e| format!("failed to call ledger: {:?}", e))?
            .0;

            // Check ownership for each token in the shard
            for (token_id, account) in shard.iter().zip(accounts.iter()) {
            if let Some(acc) = account {
                if acc.owner == owner {
                owned_token_ids.push(token_id.clone());
                }
            }
            }
        }

        let token_ids = vec![owned_token_ids];

        let token_ids: Vec<u128> = token_ids.into_iter()
            .flatten()
            .map(|n| n.0.try_into().unwrap())
            .collect();

        Ok(Self {
            owner,
            nft_colletion_id: nft_canister.clone(),
            token_ids,
                        expired_at: get_info_by_key(&format!("{}_nft_expired_at", nft_canister)).map(|info| 
                            info.content.parse::<u64>().unwrap_or(0)
            ),
        })
    }
}

#[derive(CandidType,Debug, Clone, Serialize, Deserialize)]
pub struct UserLicenseRecord {
    pub owner: String,
    pub nft_collection_id: String,
    pub license_name: String,
    pub token_id: u128,
    pub purchase_time: u64,
    pub expired_at: Option<u64>,
}
impl UserLicenseRecord {
    pub async fn new(
        owner: String,
        nft_collection_id: String,
        license_name: String,
        token_id: u128,
    ) -> Result<Self, String> {
        let now = ic_cdk::api::time();
        let seconds_now = now / 1_000_000_000;


        // Transfer NFT using icrc37_transfer_from
        let transfer_args = Icrc37_TransferFromArg {
            token_id: Nat::from(token_id),
            from: Account__3 {
            owner: Principal::from_text(&nft_collection_id)
                .map_err(|e| format!("Invalid NFT collection principal: {}", e))?,
            subaccount: None,
            },
            to: Account__3 {
            owner: Principal::from_text(&owner)
                .map_err(|e| format!("Invalid owner principal: {}", e))?,
            subaccount: None,
            },
            spender_subaccount: None,
            memo: None,
            created_at_time: None,
        };

        // The candid shows icrc37_transfer_from accepts vec of TransferFromArg and returns vec of opt TransferFromResult
        ic_cdk::call::<(Vec<Icrc37_TransferFromArg>,), (Vec<Option<TransferFromResult>>,)>(
            Principal::from_text(&nft_collection_id)
            .map_err(|e| format!("Invalid NFT collection principal: {}", e))?,
            "icrc37_transfer_from", 
            (vec![transfer_args],),
        )
        .await
        .map_err(|e| format!("Failed to transfer NFT: {:?}", e))?
        .0
        .get(0)
        .ok_or("No transfer result returned")?
        .as_ref()
        .ok_or("Transfer failed")?;


        // Set expiration
        let expired_duration_key = format!("{}_expired_duration", nft_collection_id);
        let expired_duration = get_info_by_key(&expired_duration_key)
            .map(|info| info.content.parse::<u64>().unwrap_or(0))
            .ok_or(format!("License expiration duration not found for {}", nft_collection_id))?;

        let expired_at = Some(seconds_now + expired_duration);

        Ok(Self {
            owner,
            nft_collection_id,
            license_name,
            token_id,
            purchase_time: seconds_now,
            expired_at
        })
    }
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct UserNFTsRequest {
    pub user: String,
    pub license_ids: Vec<String>,
}

#[derive(CandidType, Serialize, Deserialize)]
pub struct UserNFTsResponse {
    pub holdings: Vec<UserNFTHolding>,
}

//nft_key: key-NFTCollection id; value-NFTName
pub async fn get_all_user_nfts(user: Principal, license_ids: Vec<String>) -> Result<Vec<UserNFTHolding>, String> {
    let mut holdings = Vec::new();
    
    // Construct NFT collection keys from license IDs
    let nft_keys: Vec<String> = license_ids.iter()
        .map(|id| format!("nft_{}", id))
        .collect();

    for nft_key in nft_keys {
        if let Some(info) = get_info_by_key(&nft_key) {
            match UserNFTHolding::construct_user_nft_holding(user, nft_key.as_str()).await {
                Ok(holding) => {
                    if !holding.token_ids.is_empty() {
                        holdings.push(holding); 
                    }
                },
                Err(e) => ic_cdk::println!("Error getting holdings for {}: {}", nft_key, e),
            }
        }
    }
    
    // Sort holdings by NFT collection ID for proper grouping
    holdings.sort_by(|a, b| a.nft_colletion_id.cmp(&b.nft_colletion_id));
    
    Ok(holdings)
}

/// Retrieves information about an NFT collection by its collection ID.
///
/// # Arguments
///
/// * `collection_id` - A string slice containing the Principal ID of the NFT collection canister
///
/// # Returns
///
/// * `Result<NFTCollection, String>` - Returns an NFTCollection struct if successful, or an error message if the operation fails
///
/// # Errors
///
/// This function will return an error if:
/// * The collection ID is not a valid Principal
/// * The canister calls to fetch collection information fail
/// * The collection metadata cannot be retrieved
///
/// # Example
///
/// ```
/// let collection = get_nft_collection("rrkah-fqaaa-aaaaa-aaaaq-cai").await?;
/// println!("Collection name: {}", collection.name);
/// ```
pub async fn get_nft_collection(collection_id: &str) -> Result<NFTCollection, String> {
    NFTCollection::init_nft_collection(collection_id).await
}

pub async fn buy_nft_license(
    user_principal: &str,
    nft_collection_id: &str,
    amount: u64 
) -> Result<Vec<UserLicenseRecord>, String> {
    // Initialize NFT collection
    let collection = NFTCollection::init_nft_collection(nft_collection_id).await?;
    
    let mut records = Vec::new();
    
    // Find and process each token
    for _ in 0..amount {
        // Get the next available token ID
        let token_id = collection.get_min_available_token_id(user_principal).await?
            .ok_or("No available tokens left")?;
            
        // Create license record
        let record = UserLicenseRecord::new(
            user_principal.to_string(),
            nft_collection_id.to_string(),
            collection.name.clone(),
            token_id
        ).await?;
        
        records.push(record);
    }
    
    Ok(records)
}