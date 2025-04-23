use std::borrow::Cow;
use std::default;

use candid::{CandidType, Decode, Deserialize, Encode, Nat, Principal};
use ic_stable_structures::{storable::Bound, Storable};
use icrc_ledger_types::icrc1::account::{Account, Subaccount, DEFAULT_SUBACCOUNT};
use icrc_ledger_types::icrc1::transfer::{BlockIndex, NumTokens};
use serde::Serialize;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone)]
pub enum MinerTxState {
    Prepared(String),
    Claimed(String),
}

impl Default for MinerTxState {
    fn default() -> Self {
        MinerTxState::Prepared(String::from("prepared"))
    }
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct WorkLoadInitParam {
    pub poll_account: String,
    pub nft_collection_id: String,
    pub token_block: NumTokens,
}
impl Storable for WorkLoadInitParam {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 1024,
        is_fixed_size: false,
    };
}

pub type Timestamp = u64;

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct ComfyUIPayload {
    pub promt_id: String,
    pub client_id: String,
    pub ai_node: String,
    pub app_info: String,
    pub wk_id: String,
    pub voice_key: String,
    pub deduce_asset_key: String,
    pub status: String,
    //Not the time of AI node, but the time on chain
    pub gmt_datatime: Timestamp,
}
#[derive(Clone, Default, CandidType, Deserialize)]
pub struct WorkLoadLedgerItem {
    pub wkload_id: BlockIndex,
    pub work_load: ComfyUIPayload,
    pub block_tokens: NumTokens,
    pub token_pool: String,
    pub nft_pool: String,
    pub mining_status: MinerTxState,
}

#[derive(Clone, Default, CandidType, Deserialize)]
pub struct WorkLoadLedger {
    pub work_load_record: Vec<WorkLoadLedgerItem>,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize, Serialize)]
pub struct PromtsVecParams {
    pub client_id: String,
    pub param_name: String,
    pub param_val: String,
    pub related_wk_node: String, //Related to workflow node's params for inputing
}

#[derive(Clone, Debug, Default, CandidType, Deserialize, Serialize)]
pub struct ComfyUINode {
    pub node_id: u32,
    pub ori_url: String,
    pub ws_url: String,
    pub weight: i32,
}

#[derive(Default, CandidType, Deserialize, Clone)]
pub struct MixComfy {
    pub comfy_node: Vec<ComfyUINode>,
    pub workload_records: WorkLoadLedger,
    pub miner_ledger: MinerRecordLedger,
}

//Smart contract related
#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct GenaiProposal {
    pub id: u64,
    pub timestamp: u64,
    pub proposer: Principal,
    pub payload: ComfyUIPayload,
    pub state: String,
}

#[derive(CandidType)]
pub enum MixComfyErr {
    NoneNodeVaild(String),
    RuntimeErr(String),
    NoneContract(String),
}
pub type OrderId = u32;
pub type WorkloadPlacementReceipt = Result<BlockIndex, MixComfyErr>;
#[derive(CandidType)]
pub enum OrderPlacementErr {
    InvalidOrder,
    OrderBookFull,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct MinerRecordItem {
    pub minner_claim_id: BlockIndex,
    pub minner: Principal,
    pub wkload_id: BlockIndex,
    pub client_id: String,
    pub tokens: NumTokens,
    pub gmt_create: u64,
    pub agi_result: AGIAssetresult,
    pub state: MinerTxState,
}

#[derive(Default, CandidType, Deserialize, Clone)]
pub struct MinerRecordLedger {
    record: Vec<MinerRecordItem>,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct AGIWkFlowNode {
    pub agi_id: String,
    pub wk_flow: String,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct AGIAssetresult {
    pub res_code: String,
    pub asset_key: String,       // prompt and file input
    pub prc_dataset_key: String, //Training data
    pub aigc_asset_key: String,  //AI Gen result S3 key
    pub res_message: String,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize, Serialize)]
pub struct ComfyUIWorkflow {
    pub workflow_id: String,
    pub nodes: Vec<ComfyUINode>,
}

#[derive(Clone, Debug, Default, CandidType, Deserialize, Serialize)]
pub struct WorkflowLedgerItem {
    pub principal_id: String,
    pub client_id: String,
    pub workflow_id: String,
    pub timestamp: Timestamp,
    pub identity_timestamp: Timestamp,
    pub token_reward: NumTokens,
    pub status: WorkflowLedgerStatus,
}
#[derive(Clone, Debug, CandidType, Deserialize, Serialize, Default, PartialEq)]
pub enum WorkflowLedgerStatus {
    #[default]
    WAIT_IDENTITY,
    IDENTITY_SUCCESS,
    IDENTITY_FAIL,
    WAIT_CLAIM,
}

#[derive(Clone, Default, CandidType, Deserialize, Serialize)]
pub struct WorkflowLedger {
    pub records: Vec<WorkflowLedgerItem>,
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct ClientPromptStore(pub String, pub String);

impl Default for ClientPromptStore {
    fn default() -> Self {
        Self(String::new(), String::new())
    }
}

impl Storable for ClientPromptStore {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 1024 * 1024 * 10,
        is_fixed_size: false,
    };
}

impl Storable for WorkflowLedgerItem {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 5120,
        is_fixed_size: false,
    };
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct UploaderPow {
    pub principal_id: String,
    pub workflow_id: String,
    pub upload_timestamp: u64,
    pub token_reward: Nat,
    pub claimed: bool,
    pub claim_timestamp: Option<u64>,
}
#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct UploaderPowContractInput {
    pub sample_output: String, // Dimensional result as vector of unsigned integers
    pub identity_gusserr_limit:f64,
    pub workflow_id: String,
}

#[derive(Clone, Debug,CandidType, Deserialize, Serialize)]
pub struct UploaderPowContract {
    pub sample_output: Vec<u32>, // Dimensional result as vector of unsigned integers
    pub identity_gusserr_limit: f64,
    pub workflow_id: String,
}
impl Storable for UploaderPowContract {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 5120,
        is_fixed_size: false,
    };
}
impl UploaderPowContract {
    pub fn parse_string_to_vec(input: &str) -> Vec<u32> {
        input.chars().map(|c| c as u32).collect()
    }
    pub fn parse_base64_string_to_vec(base64_str: &str) -> Vec<u32> {
        match base64::decode(base64_str) {
            Ok(bytes) => bytes
                .chunks(4)
                .map(|chunk| {
                    if chunk.len() == 4 {
                        ((chunk[0] as u32) << 24) |
                        ((chunk[1] as u32) << 16) |
                        ((chunk[2] as u32) << 8) |
                        (chunk[3] as u32)
                    } else {
                        0 // Handle incomplete chunks
                    }
                })
                .collect(),
            Err(_) => Vec::new()
        }
    }

    pub fn parse_image_bytes_to_vec(image_data: &str) -> Vec<u32> {
        match base64::decode(image_data) {
            Ok(image_bytes) => image_bytes
                .chunks(4)
                .map(|chunk| {
                    if chunk.len() == 4 {
                        // Convert each RGBA pixel bytes into a u32
                        ((chunk[0] as u32) << 24) |  // R
                        ((chunk[1] as u32) << 16) |  // G
                        ((chunk[2] as u32) << 8) |   // B
                        (chunk[3] as u32) // A
                    } else {
                        0 // Handle incomplete chunks
                    }
                })
                .collect(),
            Err(_) => Vec::new(), // Return empty vector if base64 decode fails
        }
    }

    pub fn parse_audio_bytes_to_vec(audio_data: &str) -> Vec<u32> {
        // Remove the erroneous "video_" line
        match base64::decode(audio_data) {
            Ok(audio_bytes) => audio_bytes
                .chunks(4) // Process 4 bytes at a time for typical 32-bit audio samples
                .map(|chunk| {
                    if chunk.len() == 4 {
                        // Convert 4 bytes into a u32 (typical for PCM audio)
                        ((chunk[0] as u32) << 24)
                            | ((chunk[1] as u32) << 16)
                            | ((chunk[2] as u32) << 8)
                            | (chunk[3] as u32)
                    } else {
                        0
                    }
                })
                .collect(),
            Err(_) => Vec::new(),
        }
    }

    pub fn parse_video_frames_to_vec(video_data: &str, frame_size: usize) -> Vec<u32> {
        match base64::decode(video_data) {
            Ok(video_bytes) => video_bytes
                .chunks(frame_size)
                .flat_map(|frame| {
                    let frame_b64 = base64::encode(frame);
                    Self::parse_image_bytes_to_vec(&frame_b64)
                })
                .collect(),
            Err(_) => Vec::new(),
        }
    }

    pub fn calculate_gauss_error(&self, test_output: Vec<u32>) -> f64 {
        let mut test_output_padded = test_output.clone();
        let mut sample_output_padded = self.sample_output.clone();
        ic_cdk::println!("test_output_padded: {:?}\n", test_output_padded);
        ic_cdk::println!("sample_output_padded: {:?}\n", sample_output_padded);
        if self.sample_output.len() != test_output.len() {
            if test_output_padded.len() < sample_output_padded.len() {
                test_output_padded.resize(sample_output_padded.len(), 0);
            } else if sample_output_padded.len() < test_output_padded.len() {
                sample_output_padded.resize(test_output_padded.len(), 0);
            }
            
        }

        let mut sum_squared_diff = 0.0;
        for (expected, actual) in sample_output_padded.iter().zip(test_output_padded.iter()) {
            let diff = *expected as f64 - *actual as f64;
            sum_squared_diff += diff * diff;
        }

        let n = sample_output_padded.len() as f64;
        let mse = sum_squared_diff / n;
        let erf = 1.0 - (-mse / 2.0).exp();
        erf
    }
}

#[derive(Clone, Debug, CandidType, Deserialize, Serialize)]
pub struct AIWorkPow {
    pub principal_id: Principal,
    pub workflow_id: String,
    pub usage_timestamp: u64,
    pub computation_proof: String,
    pub token_reward: Nat,
    pub claimed: bool,
    pub claim_timestamp: Option<u64>,
}

impl Storable for UploaderPow {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 5120,

        is_fixed_size: false,
    };
}

impl Storable for AIWorkPow {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 5120,

        is_fixed_size: false,
    };
}
