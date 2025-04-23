use candid::{CandidType, Principal,Deserialize};
use std::ops::{Add, AddAssign, Mul, SubAssign};
use icrc_ledger_types::icrc1::account::{Account,Subaccount,DEFAULT_SUBACCOUNT};
use icrc_ledger_types::icrc1::transfer::{BlockIndex, NumTokens, TransferArg, TransferError};
use std::collections::HashMap;

//NFT miner
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct NFTDetail {
    pub owner:Principal,
    pub tokenid:u64,
    pub contract:ContractInfo
}
#[derive(Clone, Debug, CandidType,Default, Deserialize)]
pub struct UserIdentityInfo {
    pub user_id:String,
    pub principalid_txt:String,
    pub user_nick:String
}


#[derive(Clone, Debug, CandidType,Default, Deserialize)]
pub struct NftUnivoicePricipal {
    pub owners:Vec<String>
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct  ContractInfo {
    pub constractid:String,
    pub poll_account:Principal,
    pub token_block:u64
}

#[derive(CandidType, Deserialize, PartialEq)]
enum MetadataPurpose {
    Preview,
    Rendered,
}
#[allow(clippy::enum_variant_names)]
#[derive(CandidType, Deserialize)]
enum MetadataVal {
    TextContent(String),
    BlobContent(Vec<u8>),
    NatContent(u128),
    Nat8Content(u8),
    Nat16Content(u16),
    Nat32Content(u32),
    Nat64Content(u64),
}
#[derive( CandidType, Deserialize)]
pub struct MetadataPart {
    purpose: MetadataPurpose,
    key_val_data: HashMap<String, MetadataVal>,
    data: Vec<u8>,
}




