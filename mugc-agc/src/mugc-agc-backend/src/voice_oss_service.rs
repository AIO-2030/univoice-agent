use candid::{CandidType, Principal};
use ic_cdk::api::{call, time};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use std::collections::BTreeMap;
use std::io::Read;
use base64::{Engine as _, engine::general_purpose};

use crate::voice_oss_type::{
    VoiceOssData, VoiceOssInfo, ListVoiceOssParams, Result,
};

/// Represents an authentication token for OSS operations
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
struct Token {
    subject: Principal,
    audience: Principal,
    policies: String,
}

// Store the last processed voice data information
thread_local! {
    static VOICE_DATA_FOLDERID: std::cell::RefCell<BTreeMap<Principal, u32>> = std::cell::RefCell::new(BTreeMap::new());
    static VOICE_DATA_FILEID: std::cell::RefCell<BTreeMap<Principal, u32>> = std::cell::RefCell::new(BTreeMap::new());

}

/// Represents a folder in OSS storage
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
struct FolderInfo {
    id: u32,
    files: Vec<u32>,
    status: i8,
    updated_at: u64,
    name: String,
    folders: Vec<u32>,
    created_at: u64,
    parent: u32,
}

/// Represents a file in OSS storage
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
struct FileInfo {
    id: u32,
    status: i8,
    updated_at: u64,
    name: String,
    size: u64,
    content_type: String,
    created_at: u64,
    filled: u64,
    chunks: u32,
    parent: u32,
}

/// Represents a file chunk in OSS storage
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
struct FileChunk {
    chunk_index: u32,
    content: ByteBuf,
}

// OSS bucket canister ID - should be set during initialization or configuration
static mut OSS_BUCKET_CANISTER_ID: Option<Principal> = None;

/// Sets the OSS bucket canister ID
pub fn set_oss_bucket_canister_id(canister_id: Principal) {
    unsafe {
        OSS_BUCKET_CANISTER_ID = Some(canister_id);
    }
}

/// Gets the OSS bucket canister ID
fn get_oss_bucket_canister_id() -> Result<Principal, String> {
    unsafe {
        OSS_BUCKET_CANISTER_ID
            .ok_or_else(|| "OSS bucket canister ID not configured".to_string())
    }
}

/// Retrieves current voice data for a principal
pub async fn get_current_voice_data(principal_id: Option<Principal>) -> Result<Vec<VoiceOssInfo>, String> {
    let caller = principal_id.unwrap_or_else(ic_cdk::caller);
    
    // Step 1: List all folders
    let folders = list_all_folders().await?;
    
    // Step 2: Roll up all the folders to list all file IDs
    let mut all_files: Vec<FileInfo> = Vec::new();
    for folder in folders {
        let files = list_files_in_folder(folder.id).await?;
        all_files.extend(files);
    }
    
    // Step 3: Save the sequence info in stable storage
    update_voice_data_sequence(&caller, &all_files);
    
    // Step 4: Get file content by chunks and convert to base64
    let mut voice_data_info: Vec<VoiceOssInfo> = Vec::new();
    
    // Get the current folder and file IDs for this caller
    let target_folder_id = VOICE_DATA_FOLDERID.with(|folder_id_map| {
        folder_id_map.borrow().get(&caller).copied().unwrap_or(0)
    });
    
    let target_file_id = VOICE_DATA_FILEID.with(|file_id_map| {
        file_id_map.borrow().get(&caller).copied().unwrap_or(0)
    });
    
    // Filter files based on the stored sequence information
    for file in all_files.iter().filter(|f| {
        // Use either the specific folder_id or file_id to determine which files to process
        f.status >= 0 && // Not deleted
        (f.parent == target_folder_id || f.id == target_file_id)
    }) {
        // Get file content
        let content = get_file_content(file.id, file.chunks).await?;
        
        // Check if the file is a WAV file
        let is_wav = file.name.to_lowercase().ends_with(".wav") || 
                     file.content_type == "audio/wav" || 
                     file.content_type == "audio/x-wav";
        
        // Convert to base64, ensuring correct format for WAV files
        let base64_content = general_purpose::STANDARD.encode(&content);
        
        // Create voice info
        let voice_info = VoiceOssInfo {
            principal_id: caller,
            folder_id: file.parent,
            file_id: file.id,
            status: file.status,
            created_at: file.created_at,
            updated_at: file.updated_at,
            custom: None,
            content: Some(base64_content),
        };
        
        voice_data_info.push(voice_info);
    }
    
    Ok(voice_data_info)
}

/// Lists all folders in the OSS bucket
async fn list_all_folders() -> Result<Vec<FolderInfo>, String> {
    let bucket_id = get_oss_bucket_canister_id()?;
    
    // Start with the root folder (ID 0)
    let mut all_folders = Vec::new();
    let mut next_id: Option<u32> = None;
    let limit = 100u32;
    // Paginate through folders until we've retrieved all
    loop {       
        // Get a fresh access token for each iteration
        let access_token = get_access_token(bucket_id).await?;
        
        // List folders in the root folder (ID 0)
        let result: (Vec<FolderInfo>,) = call::call(
            bucket_id,
            "list_folders",
            (0u32, next_id, Some(limit), Some(access_token)),
        )
        .await
        .map_err(|e| format!("Error calling list_folders: {}", e.1))?;
        
        let folders = result.0;
        
        // No more folders to retrieve
        if folders.is_empty() {
            break;
        }
        
        // Add current folders to the result
        all_folders.extend(folders.clone());
        
        // If we got exactly the limit, there might be more folders
        if folders.len() as u32 == limit {
            // Use the last folder's ID for the next page
            next_id = folders.last().map(|f| f.id);
        } else {
            // No more pages
            break;
        }
    }
    
    Ok(all_folders)
}

/// Lists all files in a specific folder
async fn list_files_in_folder(folder_id: u32) -> Result<Vec<FileInfo>, String> {
    let bucket_id = get_oss_bucket_canister_id()?;
    let mut all_files = Vec::new();
    let mut next_id: Option<u32> = None;
    let limit = 100u32;
    
    // Paginate through files until we've retrieved all
    loop {
        // Get a fresh access token for each iteration
        let access_token = get_access_token(bucket_id).await?;
        
        let result: (Vec<FileInfo>,) = call::call(
            bucket_id,
            "list_files",
            (folder_id, next_id, Some(limit), Some(access_token)),
        )
        .await
        .map_err(|e| format!("Error calling list_files: {}", e.1))?;
        
        let files = result.0;
        
        // No more files to retrieve
        if files.is_empty() {
            break;
        }
        
        // Add current files to the result
        all_files.extend(files.clone());
        
        // If we got exactly the limit, there might be more files
        if files.len() as u32 == limit {
            // Use the last file's ID for the next page
            next_id = files.last().map(|f| f.id);
        } else {
            // No more pages
            break;
        }
    }
        
    Ok(all_files)
}
/// Gets the content of a file
async fn get_file_content(file_id: u32, chunks_count: u32) -> Result<Vec<u8>, String> {
    let bucket_id = get_oss_bucket_canister_id()?;
    let mut content = Vec::new();
    
    // Fetch all chunks one by one
    for chunk_index in 0..chunks_count {
        // Get access token for file access
        let access_token = get_access_token(bucket_id).await?;
        
        let result: (Vec<(u32, ByteBuf)>,) = call::call(
            bucket_id,
            "get_file_chunks",
            (file_id, chunk_index, Some(1u32), Some(access_token)),
        )
        .await
        .map_err(|e| format!("Error calling get_file_chunks: {}", e.1))?;
        
        let chunks = result.0;
        
        // Append chunk data to content
        for (_, data) in chunks {
            content.extend(data.into_vec());
        }
    }
    
    Ok(content)
}


/// Updates the sequence information for voice data in stable storage
pub fn update_voice_data_sequence(caller: &Principal, files: &[FileInfo]) {
    // Find the maximum folder ID and file ID
    let max_folder_id = files.iter().map(|file| file.parent).max().unwrap_or(0);
    let max_file_id = files.iter().map(|file| file.id).max().unwrap_or(0);
    
    // Update the folder ID sequence
    VOICE_DATA_FOLDERID.with(|folder_id_map| {
        let mut map = folder_id_map.borrow_mut();
        let current_folder_id = map.get(caller).copied().unwrap_or(0);
        
        // If current folder ID is less than max, increment it, otherwise reset to 0
        let new_folder_id = if current_folder_id < max_folder_id {
            current_folder_id + 1
        } else {
            0
        };
        
        map.insert(*caller, new_folder_id);
    });
    
    // Update the file ID sequence
    VOICE_DATA_FILEID.with(|file_id_map| {
        let mut map = file_id_map.borrow_mut();
        let current_file_id = map.get(caller).copied().unwrap_or(0);
        
        // If current file ID is less than max, increment it, otherwise reset to 0
        let new_file_id = if current_file_id < max_file_id {
            current_file_id + 1
        } else {
            0
        };
        
        map.insert(*caller, new_file_id);
    });
}

/// Gets an access token for interacting with the OSS bucket
async fn get_access_token(audience: Principal) -> Result<ByteBuf, String> {
    // Get the OSS cluster canister ID (this should be set during initialization)
    let oss_cluster_id = get_oss_bucket_canister_id()?;
    
    // Create token request
    let token = Token {
        subject: ic_cdk::caller(),
        audience,
        policies: "File.Read:*".to_string(),
    };
    
    // Current time in seconds
    let now_sec = time() / 1_000_000_000;
    
    // Token valid for 24 hours
    let expiration_sec = now_sec + 86400; // 24 hours in seconds
    
    
    // Call admin_weak_access_token on the OSS cluster canister
    let result: (ByteBuf,) = call::call(
        oss_cluster_id,
        "admin_weak_access_token",
        (token, now_sec, expiration_sec),
    )
    .await
    .map_err(|e| format!("Error calling admin_weak_access_token: {}", e.1))?;
    
    Ok(result.0)
}