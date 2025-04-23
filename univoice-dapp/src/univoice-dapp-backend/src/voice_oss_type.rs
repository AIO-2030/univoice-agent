use candid::{CandidType, Decode, Encode, Principal};
use serde::{Deserialize, Serialize};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableVec, storable::Bound, Storable,
};
use std::cell::RefCell;
use std::borrow::Cow;
use ic_cdk::api::time;

pub type Result<T, E = String> = std::result::Result<T, E>;

// Memory management setup
thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static VOICE_ASSET_DATA: RefCell<StableVec<VoiceAssetData, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new(
        StableVec::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4)))
        ).expect("Failed to initialize VOICE_ASSET_DATA")
    );
}

/// Voice data structure that stores principal ID, folder ID, and file ID
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub struct VoiceAssetData {
    /// Principal ID of the owner
    pub principal_id: Principal,
    /// Folder ID where the voice data is stored
    pub folder_id: u32,
    /// File ID of the voice data
    pub file_id: u32,
    /// Status flag (0: active, -1: deleted)
    pub status: i32,
    /// Timestamp when the data was created
    pub created_at: u64,
    /// Timestamp when the data was last updated
    pub updated_at: Option<u64>,
    /// Optional custom metadata
    pub custom: Option<Vec<(String, MetadataValue)>>,
}

impl Default for VoiceAssetData {
    fn default() -> Self {
        Self {
            principal_id: Principal::anonymous(),
            folder_id: 0,
            file_id: 0,
            status: 0,
            created_at: 0,
            updated_at: None,
            custom: None,
        }
    }
}

impl Storable for VoiceAssetData {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        match Decode!(bytes.as_ref(), Self) {
            Ok(data) => data,
            Err(e) => {
                ic_cdk::println!("Error decoding VoiceAssetData: {:?}", e);
                Self::default() // Return a default instance on error
            }
        }
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 5120, // 5KB should be sufficient for this struct
        is_fixed_size: false,
    };
}

/// Metadata value types
#[derive(Debug, Clone, CandidType, Deserialize, Serialize)]
pub enum MetadataValue {
    Int(i64),
    Nat(u64),
    Blob(Vec<u8>),
    Text(String),
}

/// Stores a new VoiceAssetData in stable memory
pub fn store_voice_asset_data(data: VoiceAssetData) -> Result<u64, String> {
    VOICE_ASSET_DATA.with(|storage| {
        let storage = storage.borrow_mut();
        let index = storage.len();
        storage.push(&data)
            .map_err(|e| format!("Failed to store voice asset data: {}", e))?;
        Ok(index)
    })
}

/// Retrieves VoiceAssetData by index from stable memory
pub fn get_voice_asset_data(index: u64) -> Option<VoiceAssetData> {
    VOICE_ASSET_DATA.with(|storage| {
        let storage = storage.borrow();
        storage.get(index)
    })
}

/// Updates existing VoiceAssetData in stable memory
pub fn update_voice_asset_data(index: u64, data: VoiceAssetData) -> Result<(), String> {
    VOICE_ASSET_DATA.with(|storage| {
        let mut storage = storage.borrow_mut();
        if index >= storage.len() {
            return Err("Index out of bounds".to_string());
        }
        
        storage.set(index, &data);
        Ok(())
    })
}

/// Lists all VoiceAssetData entries
pub fn list_voice_asset_data() -> Vec<VoiceAssetData> {
    VOICE_ASSET_DATA.with(|storage| {
        let storage = storage.borrow();
        (0..storage.len())
            .filter_map(|i| storage.get(i))
            .collect()
    })
}

/// Deletes VoiceAssetData by index (marks as deleted)
pub fn delete_voice_asset_data(index: u64) -> Result<(), String> {
    VOICE_ASSET_DATA.with(|storage| {
        let mut storage = storage.borrow_mut();
        if index >= storage.len() {
            return Err("Index out of bounds".to_string());
        }
        let mut data = storage.get(index).ok_or("Data not found")?;
        data.status = -1;
        data.updated_at = Some(time());
        
        storage.set(index, &data);
        Ok(())
    })
}

/// Queries VoiceAssetData by principal_id
pub fn query_voice_asset_by_principal(principal_id: Principal) -> Vec<VoiceAssetData> {
    VOICE_ASSET_DATA.with(|storage| {
        let storage = storage.borrow();
        (0..storage.len())
            .filter_map(|i| storage.get(i))
            .filter(|data| data.principal_id == principal_id && data.status != -1)
            .collect()
    })
}

/// Queries VoiceAssetData by folder_id
pub fn query_voice_asset_by_folder(folder_id: u32) -> Vec<VoiceAssetData> {
    VOICE_ASSET_DATA.with(|storage| {
        let storage = storage.borrow();
        (0..storage.len())
            .filter_map(|i| storage.get(i))
            .filter(|data| data.folder_id == folder_id && data.status != -1)
            .collect()
    })
}

#[derive(CandidType, Deserialize, Clone)]
pub struct ListVoiceOssParams {
    pub principal_id: Option<Principal>,
    pub folder_id: Option<u32>,
    pub prev: Option<u64>,
    pub take: Option<u32>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct VoiceOssInfo {
    pub file_id: u32,
    pub status: i32,
    pub created_at: u64,
    pub updated_at: Option<u64>,
    pub custom: Option<Vec<(String, MetadataValue)>>,
}

pub fn list_voice_files(params: ListVoiceOssParams) -> Result<Vec<VoiceOssInfo>, String> {
    let mut results = Vec::new();
    
    VOICE_ASSET_DATA.with(|storage| {
        let storage = storage.borrow();
        let len = storage.len();
        let mut count = 0;
        
        for i in 0..len {
            if let Some(data) = storage.get(i) {
                if data.status == -1 {
                    continue; // Skip deleted entries
                }
                
                if let Some(pid) = params.principal_id {
                    if data.principal_id != pid {
                        continue;
                    }
                }
                
                if let Some(fid) = params.folder_id {
                    if data.folder_id != fid {
                        continue;
                    }
                }
                
                if let Some(prev) = params.prev {
                    if i <= prev {
                        continue;
                    }
                }
                
                if let Some(take) = params.take {
                    if count >= take {
                        break;
                    }
                }
                
                results.push(VoiceOssInfo {
                    file_id: data.file_id,
                    status: data.status,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                    custom: data.custom,
                });
                count += 1;
            }
        }
    });
    
    Ok(results)
}