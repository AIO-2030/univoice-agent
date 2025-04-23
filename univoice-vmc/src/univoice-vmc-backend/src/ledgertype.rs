use std::default;
use std::{borrow::Cow, cell::RefCell};

use ic_stable_structures::{ storable::Bound ,DefaultMemoryImpl, StableBTreeMap, Storable,};
use candid::{CandidType, Principal,Deserialize,Nat,Encode,Decode};
use serde::Serialize;
use icrc_ledger_types::icrc1::account::{Account,Subaccount,DEFAULT_SUBACCOUNT};
use icrc_ledger_types::icrc1::transfer::{BlockIndex, NumTokens};
use icrc_ledger_types::icrc2::approve::ApproveError;

pub type TxIndex = Nat;
pub type Timestamp = u64;

const MAX_VALUE_SIZE: u32 = 5120;


#[derive(CandidType,Deserialize,Clone)]
pub enum MinerTxState {
    Prepared(String),
    Claimed(String)
}
impl Default  for MinerTxState {
    fn default() -> Self {
       MinerTxState::Prepared(String::from("prepared"))
   }
}
#[derive(CandidType,Deserialize,Clone,PartialEq)]

pub enum TransferTxState {
    WaitClaim,
    Claimed
}
impl Default  for TransferTxState {
    fn default() -> Self {
        TransferTxState::WaitClaim
   }
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]

pub struct ComfyUIPayload {
    pub promt_id:String,
    pub client_id:String,
    pub ai_node:String,
    pub app_info:String,
    pub wk_id:String,
    pub voice_key:String,
    pub deduce_asset_key:String,
    pub status:String,
    //Not the time of AI node, but the time on chain
    pub gmt_datatime:Timestamp
}

#[derive(Clone, Default, CandidType, Deserialize)]
pub struct WorkLoadLedgerItem {
    pub wkload_id:BlockIndex,
    pub work_load :ComfyUIPayload,
    pub block_tokens:NumTokens,
    pub token_pool:String,
    pub nft_pool:String,
    pub mining_status:MinerTxState
}

#[derive(CandidType, Deserialize, Clone)]
pub struct UnvMinnerLedgerRecord{
    pub minner_principalid:String,
    pub meta_workload:WorkLoadLedgerItem,
    pub block_index:Option<BlockIndex>,
    pub trans_tx_index:Option<TxIndex>,
    pub tokens:NumTokens,
    pub gmt_datetime:Timestamp,
    pub gmt_claim_time:Timestamp,
    pub biz_state:TransferTxState
}
impl Storable for UnvMinnerLedgerRecord {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

#[derive(CandidType,Deserialize,Clone,Default)]
pub struct MinerJnlPageniaze {
    pub ledgers:Vec<UnvMinnerLedgerRecord>,
    pub total_log:usize
}


#[derive(CandidType,Deserialize,Clone,Default)]
pub struct UnvMinnerLedgerState {
    pub unv_tx_leger:  Vec<UnvMinnerLedgerRecord>,  
}
impl Storable for UnvMinnerLedgerState {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

#[derive(Clone, CandidType, Deserialize)]
pub struct MinerWaitClaimBalance {
    pub pricipalid_txt:String,
    pub tokens:NumTokens
}
#[derive(CandidType, Deserialize,Default, Serialize,Clone)]
pub struct MainSiteSummary {
    pub listener_count:usize,
    pub aigcblock_created_number:BlockIndex,
    pub token_per_block:NumTokens,
    pub token_pool_balance:NumTokens
}


#[derive(CandidType, Deserialize, Serialize)]
pub struct TransferArgs {
    pub amount: NumTokens,
    pub to_account: Account,
}
#[derive(CandidType, Deserialize, Serialize)]
pub enum ApproveResult {
    Ok(BlockIndex),
    Err(ApproveError)  
}

#[derive(CandidType, Deserialize,Default, Serialize,Clone)]
pub struct ChakraItem {
    pub pricipalid_txt:String,
    pub cnt1:Nat,
    pub cnt2:Nat,
    pub cnt3:Nat,
    pub cnt4:Nat,
    pub cnt5:Nat,
    pub cnt6:Nat,
    pub cnt7:Nat
}







