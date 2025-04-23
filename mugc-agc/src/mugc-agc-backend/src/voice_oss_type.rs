use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;

use std::result;

pub type Result<T, E = String> = result::Result<T, E>;

/// Voice data structure that stores principal ID, folder ID, and file ID
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct VoiceOssData {
    /// Principal ID of the owner
    pub principal_id: Principal,
    /// Folder ID where the voice data is stored
    pub folder_id: u32,
    /// File ID of the voice data
    pub file_id: u32,
    /// Status flag (similar to status in FileInfo/FolderInfo)
    pub status: i8,
    /// Timestamp when the data was created
    pub created_at: u64,
    /// Timestamp when the data was last updated
    pub updated_at: Option<u64>,
}

/// Request parameters for creating voice data
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct CreateVoiceOssInput {
    /// Principal ID of the owner
    pub principal_id: Principal,
    /// Folder ID where the voice data should be stored
    pub folder_id: u32,
    /// File ID of the voice data
    pub file_id: u32,
    /// Optional custom metadata
    pub custom: Option<Vec<(String, MetadataValue)>>,
}

/// Result of creating voice data
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct CreateVoiceOssOutput {
    /// ID of the created voice data
    pub id: u64,
    /// Timestamp when the data was created
    pub created_at: u64,
}

/// Voice data query result
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct VoiceOssInfo {
    /// Principal ID of the owner
    pub principal_id: Principal,
    /// Folder ID where the voice data is stored
    pub folder_id: u32,
    /// File ID of the voice data
    pub file_id: u32,
    /// Status flag
    pub status: i8,
    /// Timestamp when the data was created
    pub created_at: u64,
    /// Timestamp when the data was last updated
    pub updated_at: u64,
    /// Optional custom metadata
    pub custom: Option<Vec<(String, MetadataValue)>>,
    /// Base64 encoded file content
    pub content: Option<String>,
}

/// Parameters for updating voice data
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct UpdateVoiceOssInput {
    /// ID of the voice data to update
    pub id: u64,
    /// Optional new folder ID
    pub folder_id: Option<u32>,
    /// Optional new file ID
    pub file_id: Option<u32>,
    /// Optional new status
    pub status: Option<i8>,
    /// Optional custom metadata
    pub custom: Option<Vec<(String, MetadataValue)>>,
}

/// Result of updating voice data
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct UpdateVoiceOssOutput {
    /// Timestamp when the data was updated
    pub updated_at: u64,
}

/// Metadata value types, copied from ic-oss
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub enum MetadataValue {
    Int(i64),
    Nat(u64),
    Blob(ByteBuf),
    Text(String),
}


/// Query parameters for listing voice data
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct ListVoiceOssParams {
    /// Principal ID to filter by (optional)
    pub principal_id: Option<Principal>,
    /// Folder ID to filter by (optional)
    pub folder_id: Option<u32>,
    /// Pagination index
    pub prev: Option<u64>,
    /// Number of items to return
    pub take: Option<u32>,
}