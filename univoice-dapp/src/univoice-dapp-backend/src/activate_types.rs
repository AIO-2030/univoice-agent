use std::borrow::{Borrow, BorrowMut};
use candid::{CandidType, Deserialize, Nat, Principal};
use serde::Serialize;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, Storable, StableBTreeMap, storable::Bound};
use icrc_ledger_types::icrc1::account::Account;
use icrc_ledger_types::icrc1::transfer::{BlockIndex, NumTokens, TransferArg, TransferError};
use icrc_ledger_types::icrc2::approve::{ApproveArgs, ApproveError};
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};

use std::cell::RefCell;
use rand::Rng;
use rand::rngs::StdRng;

// Import from buss_types
use crate::buss_types::{CustomInfo, get_custom_info};

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct InviteRewardRecord {
    pub id: String,
    pub invite_code: String,
    pub code_owner: String,    // Principal ID of invite code owner
    pub new_user: String,      // Principal ID of new user
    pub token_amount: Nat,     // Amount of tokens to reward
    pub created_at: u64,
    pub is_claimed: bool,
    pub claimed_at: Option<u64>,
}

impl Storable for InviteRewardRecord {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let serialized = candid::encode_one(self).expect("Failed to serialize InviteRewardRecord");
        std::borrow::Cow::Owned(serialized)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).expect("Failed to deserialize InviteRewardRecord")
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 2048,
        is_fixed_size: false,
    };
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct TaskRewardRecord {
    pub task_id: String,
    pub task_owner: String,      // Principal ID of task owner
    pub token_amount: Nat,       // Amount of tokens to reward
    pub create_at: u64,
    pub is_claimed: bool,
    pub claimed_at: Option<u64>,
}

impl Storable for TaskRewardRecord {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let serialized = candid::encode_one(self).expect("Failed to serialize TaskRewardRecord");
        std::borrow::Cow::Owned(serialized)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).expect("Failed to deserialize TaskRewardRecord")
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 2048,
        is_fixed_size: false,
    };
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = 
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static REWARD_RECORDS: RefCell<StableBTreeMap<String, InviteRewardRecord, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))
        )
    );
    
    static TASK_REWARD_RECORDS: RefCell<StableBTreeMap<String, TaskRewardRecord, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4)))
        )
    );
}

fn get_timestamp() -> u64 {
    ic_cdk::api::time()
}

pub fn use_invite_code(code: String, new_user: String) -> Result<InviteRewardRecord, String> {
    // Find the invite code owner by checking all CustomInfo entries
    let mut owner_id = None;
    let mut is_used = false;
    let mut used_by = None;

    // Iterate through all CustomInfo entries to find the one with matching code
    // This would need to use a function from buss_types to list all CustomInfo
    // or find by invite code
    if let Some(custom_info) = find_custom_info_by_invite_code(&code) {
        owner_id = Some(custom_info.wallet_principal.clone());
        used_by = custom_info.used_invite_code.clone();
    }

    let owner_id = owner_id.ok_or("Invite code not found")?;

    if owner_id == new_user {   // Cannot use own invite code
        return Err("Cannot use own invite code".to_string());
    }

    // Create reward record
    let reward_id = format!("{}_{}", code, get_timestamp());
    let reward: InviteRewardRecord = InviteRewardRecord {
        id: reward_id.clone(),
        invite_code: code.clone(),
        code_owner: owner_id.clone(),
        new_user: new_user.clone(),
        token_amount: Nat::from(1000 as u64), // Default reward amount
        created_at: get_timestamp(),
        is_claimed: false,
        claimed_at: None,
    };

    // Update CustomInfo to mark code as used
    match crate::buss_types::update_used_invite_code(new_user.clone(), Some(code.clone())) {
        Ok(_) => {
            // Store the reward record
            REWARD_RECORDS.with(|records| {
                let mut records = records.borrow_mut();
                records.insert(reward_id, reward.clone());
                Ok(reward)
            })
        },
        Err(e) => Err(format!("Failed to update invite code usage: {}", e))
    }
}

pub fn get_friend_infos(owner_principal: String) -> Vec<(CustomInfo, Nat)> {
    // First, get all invite records where the given principal is the code owner
    let invited_info = REWARD_RECORDS.with(|records| {
        let records = records.borrow();
        let mut invited_data = Vec::new();
        
        for (_, record) in records.iter() {
            if record.code_owner == owner_principal {
                // Calculate the 30% reward amount for the code owner
                let reward_amount = (record.token_amount.clone() * 30u32) / 100u32;
                invited_data.push((record.new_user.clone(), reward_amount));
            }
        }
        
        invited_data
    });
    
    // Now fetch CustomInfo for each invited user and pair with token amount
    let mut friend_infos = Vec::new();
    
    for (principal, token_amount) in invited_info {
        if let Some(info) = crate::buss_types::get_custom_info(None, Some(principal.clone())) {
            friend_infos.push((info, token_amount));
        } else {
            // Log if we can't find user info
            ic_cdk::println!("Could not find CustomInfo for invited user with principal: {}", principal);
        }
    }
    
    friend_infos
}

pub fn get_user_rewards(user_principal: String) -> Vec<InviteRewardRecord> {
    REWARD_RECORDS.with(|records| {
        let records = records.borrow();
        records.iter()
            .filter(|(_, record)| {
                record.code_owner == user_principal || record.new_user == user_principal
            })
            .map(|(_, record)| {
                let mut modified_record = record.clone();
                if record.code_owner == user_principal {
                    modified_record.token_amount = (record.token_amount * 30u32) / 100u32; // 30% for code owner
                } else {
                    modified_record.token_amount = (record.token_amount * 70u32) / 100u32; // 70% for new user
                }
                modified_record
            })
            .collect()
    })
}

// Helper function to find a CustomInfo by invite code
fn find_custom_info_by_invite_code(code: &str) -> Option<CustomInfo> {
    // We need to import this function from buss_types if it exists
    crate::buss_types::find_custom_info_by_invite_code(code)
}

pub fn add_task_reward(task_id: String, task_owner: String, token_amount: Nat) -> Result<TaskRewardRecord, String> {
    if task_id.is_empty() || task_owner.is_empty() {
        return Err("Task ID and owner cannot be empty".to_string());
    }

    let record_id = format!("{}_{}", task_id, get_timestamp());
    let record = TaskRewardRecord {
        task_id,
        task_owner: task_owner.clone(),
        token_amount,
        create_at: get_timestamp(),
        is_claimed: false,
        claimed_at: None,
    };

    TASK_REWARD_RECORDS.with(|records| {
        let mut records = records.borrow_mut();
        records.insert(record_id, record.clone());
        Ok(record)
    })
}

pub fn get_unclaimed_task_rewards(task_owner: String) -> Nat {
    TASK_REWARD_RECORDS.with(|records| {
        let records = records.borrow();
        let mut total = Nat::from(0u64);
        
        for (_, record) in records.iter() {
            if record.task_owner == task_owner && !record.is_claimed {
                total += record.token_amount.clone();
            }
        }
        
        total
    })
}

pub fn get_unclaimed_invite_rewards(user_principal: String) -> Nat {
    REWARD_RECORDS.with(|records| {
        let records = records.borrow();
        let mut total = Nat::from(0u64);
        
        for (_, record) in records.iter() {
            if !record.is_claimed {
                if record.code_owner == user_principal {
                    // 30% for code owner
                    total += (record.token_amount.clone() * 30u32) / 100u32;
                } else if record.new_user == user_principal {
                    // 70% for new user
                    total += (record.token_amount.clone() * 70u32) / 100u32;
                }
            }
        }
        
        total
    })
}

pub fn mark_rewards_as_claimed(user_principal: String) -> Result<(), String> {
    let now = get_timestamp();
    
    // Mark task rewards as claimed
    TASK_REWARD_RECORDS.with(|records| {
        let mut records = records.borrow_mut();
        let mut updates = Vec::new();
        
        // Collect records to update
        for (id, record) in records.iter() {
            if record.task_owner == user_principal && !record.is_claimed {
                let mut updated_record = record.clone();
                updated_record.is_claimed = true;
                updated_record.claimed_at = Some(now);
                updates.push((id.clone(), updated_record));
                ic_cdk::println!("Marked task reward {} as claimed for user {}", id, user_principal);
            }
        }
        
        // Apply updates
        for (id, updated_record) in updates {
            records.insert(id, updated_record);
        }
    });
    
    // Mark invite rewards as claimed
    REWARD_RECORDS.with(|records| {
        let mut records = records.borrow_mut();
        let mut updates = Vec::new();
        
        // Collect records to update
        for (id, record) in records.iter() {
            if (record.code_owner == user_principal || record.new_user == user_principal) && !record.is_claimed {
                let mut updated_record = record.clone();
                updated_record.is_claimed = true;
                updated_record.claimed_at = Some(now);
                updates.push((id.clone(), updated_record));
                ic_cdk::println!("Marked invite reward {} as claimed for user {}", id, user_principal);
            }
        }
        
        // Apply updates
        for (id, updated_record) in updates {
            records.insert(id, updated_record);
        }
    });
    
    Ok(())
}



