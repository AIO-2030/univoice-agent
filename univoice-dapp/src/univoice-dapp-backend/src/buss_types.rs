use std::borrow::{Borrow, BorrowMut};
use candid::{CandidType, Deserialize};
use serde::Serialize;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, Storable, StableBTreeMap, StableVec, storable::Bound};
use std::cell::RefCell;

use rand::Rng;
use crate::constants::INVITE_REWARD;
use std::option::Option;
use std::collections::HashMap;

type Memory = VirtualMemory<DefaultMemoryImpl>;
// Define TokenAmount as a numeric type for storing token amounts
type TokenAmount = u64;


#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct CommonInfoCfg {
    pub key: String,
    // Unique identifier for the common info configuration
    pub content: String,
    pub version: String,
    pub isvalid: bool,
}

impl Storable for CommonInfoCfg {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let serialized = candid::encode_one(self).expect("Failed to serialize CommonInfoCfg");
        std::borrow::Cow::Owned(serialized)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).expect("Failed to deserialize CommonInfoCfg")
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 4096,
        is_fixed_size: false,
    };
}

impl CommonInfoCfg {
    pub fn create_info(key: String, content: String) -> Self {
        CommonInfoCfg {
            key,
            content,
            version: "1.0.0".to_string(), // Start with initial version
            isvalid: true,
        }
    }

    pub fn check_validity(&self) -> bool {
        self.isvalid
    }


    pub fn get_info_version(&self) -> &str {
        &self.version
    }

    pub fn get_info_content(&self) -> &str {
        &self.content
    }

    pub fn update_info(&mut self, content: String) {
        self.content = content;
        // Increment version (assuming semantic versioning)
        let mut version_parts: Vec<u32> = self
            .version
            .split('.')
            .map(|s| s.parse().unwrap_or(0))
            .collect();
        version_parts[2] += 1; // Increment patch version
        self.version = version_parts
            .iter()
            .map(|n| n.to_string())
            .collect::<Vec<String>>()
            .join(".");
    }

    pub fn mark_as_invalid(&mut self) {
        self.isvalid = false;
    }

    // Compare versions (helper function)
    fn compare_versions(v1: &str, v2: &str) -> std::cmp::Ordering {
        let v1_parts: Vec<u32> = v1.split('.').map(|s| s.parse().unwrap_or(0)).collect();
        let v2_parts: Vec<u32> = v2.split('.').map(|s| s.parse().unwrap_or(0)).collect();
        v1_parts.cmp(&v2_parts)
    }
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct CustomInfo {
    pub dapp_principal: String,
    pub wallet_principal: String,
    pub nick_name: String,
    pub logo: String,
    pub is_invite_code_filled: bool,
    pub invite_code: String,
    pub used_invite_code: Option<String>,
    pub total_rewards: TokenAmount,
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct Quest {
    pub quest_id: u64,
    pub quest_name: String,
    pub reward_amount: u64,
    pub redirect_url: String,
    pub is_completed: bool,
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct InvitedUser {
    pub dapp_principal: String,
    pub wallet_principal: String,
    pub nick_name: String,
    pub logo: String,
    pub reward_amount: u64,
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct InvitedUserResponse {
    pub total_invited: u64,
    pub users: Vec<InvitedUser>,
}

impl Storable for CustomInfo {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let serialized = candid::encode_one(self).expect("Failed to serialize CustomInfo");
        std::borrow::Cow::Owned(serialized)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).expect("Failed to deserialize CustomInfo")
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 4096,
        is_fixed_size: false,
    };
}

impl CustomInfo {
    pub fn create_custominfo(dapp_principal: String, wallet_principal: String, nick_name: String, logo: String) -> Self {
        CustomInfo {
            dapp_principal,
            wallet_principal,
            nick_name,
            logo,
            is_invite_code_filled: false,
            invite_code: "".to_string(),
            used_invite_code: None,
            total_rewards: 0,
        }
    }

    pub fn update_custominfo(&mut self, nick_name: String, logo: String) {
        self.nick_name = nick_name;
        self.logo = logo;
    }
}


thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = 
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    
    static COMMON_INFO_MAP: RefCell<StableBTreeMap<String, CommonInfoCfg, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );

    static CUSTOM_INFO_SET: RefCell<StableVec<CustomInfo, Memory>> = RefCell::new(
        StableVec::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        ).unwrap()
    );

    static QUESTS: RefCell<Vec<Quest>> = RefCell::new(vec![
        Quest {
            quest_id: 1,
            quest_name: "Follow Twitter".to_string(),
            reward_amount: 5000,
            redirect_url: "https://twitter.com/official".to_string(),
            is_completed: false,
        },
        Quest {
            quest_id: 2,
            quest_name: "Join Telegram".to_string(),
            reward_amount: 3000,
            redirect_url: "https://t.me/official".to_string(),
            is_completed: false,
        },
    ]);

    static INVITE_CODE_TO_USER_MAP: std::cell::RefCell<HashMap<String, Vec<String>>>
        = std::cell::RefCell::new(HashMap::new());
    static USER_TASKS_MAP: RefCell<StableBTreeMap<String, UserTasks, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );

    static CANISTER_MAPPINGS: RefCell<StableVec<CanisterMapping, Memory>> = RefCell::new(
        StableVec::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))
        ).unwrap()
    );
}

pub fn add_info_item(key: String, content: String) -> Result<(), String> {
    COMMON_INFO_MAP.with(|store| {
        let mut store = store.borrow_mut();
        let info = CommonInfoCfg::create_info(key.clone(), content);

        // Since COMMON_INFO_MAP is a StableBTreeMap, we can directly use insert
        store.insert(key, info);
        Ok(())
    })
}

#[derive(CandidType, Deserialize, Clone)]
pub struct BatchInfoItem {
    pub key: String,
    pub content: String,
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct TaskData {
    pub task_id: String,
    pub task_url: String,
    pub status: String,
    pub rewards: u64,
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct UserTasks {
    pub principal_id: String,
    pub tasks: Vec<TaskData>,
}

impl Storable for UserTasks {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let serialized = candid::encode_one(self).expect("Failed to serialize UserTasks");
        std::borrow::Cow::Owned(serialized)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).expect("Failed to deserialize UserTasks")
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 8192,
        is_fixed_size: false,
    };
}


fn init_user_tasks(principal_id: String) -> Result<(), String> {
    USER_TASKS_MAP.with(|store| {
        let mut store_ref = store.borrow_mut();
        if store_ref.contains_key(&principal_id) {
            return Ok(());
        }

        // Initialize with default tasks
        let default_tasks = vec![
            TaskData {
                task_id: "Follow_X".to_string(),
                task_url: "https://x.com/UNIVOICE_".to_string(),
                status: "".to_string(),
                rewards: 5000,
            },
            TaskData {
                task_id: "Follow_TG_Community".to_string(),
                task_url: "https://t.me/univoiceofficial".to_string(),
                status: "".to_string(),
                rewards: 5000,
            },
            TaskData {
                task_id: "Follow_TG_Channel".to_string(),
                task_url: "https://t.me/+S3WQWidjW9lkZTU1".to_string(),
                status: "".to_string(),
                rewards: 5000,
            },
            TaskData {
                task_id: "Follow_YouTuBe".to_string(),
                task_url: "https://youtube.com/@univoice-icp?si=v4LRyhzBbW1YZWLJ".to_string(),
                status: "".to_string(),
                rewards: 5000,
            },
        ];

        let user_tasks = UserTasks {
            principal_id: principal_id.clone(),
            tasks: default_tasks,
        };

        // Log that we're initializing tasks for a new user
        ic_cdk::println!("Initializing tasks for new user: {}", principal_id.clone());
        store_ref.insert(principal_id, user_tasks);
        Ok(())
    })
}

pub fn get_user_tasks(principal_id: &str) -> Option<Vec<TaskData>> {
    USER_TASKS_MAP.with(|store| {
        let store_ref = store.borrow();
        if !store_ref.contains_key(&principal_id.to_string()) {
            // Drop borrow before calling init
            drop(store_ref);
            // Initialize tasks if they don't exist
            let _ = init_user_tasks(principal_id.to_string());
            // Get the store again after initialization
            ic_cdk::println!("Get the store again after initialization {}",&principal_id.to_string());
            let store_ref_new = store.borrow();
            // Log all keys in store_ref_new for debugging
            ic_cdk::println!("DEBUG: Keys in store after initialization:");
            let keys_after_init: Vec<String> = store_ref_new.iter().map(|(k, _)| k.clone()).collect();
            for key in &keys_after_init {
                ic_cdk::println!("  - Key: {}", key);
            }
            store_ref_new.get(&principal_id.to_string()).map(|user_tasks| user_tasks.tasks)
        } else {
            // Log that we're retrieving tasks for an existing user
            ic_cdk::println!("Retrieving tasks for existing user: {}", &principal_id.to_string().clone());
            store_ref.get(&principal_id.to_string()).map(|user_tasks| user_tasks.tasks)
        }
    })
}

pub fn update_task_status(principal_id: &str, task_id: &str, status: String) -> Result<(), String> {
    USER_TASKS_MAP.with(|store| {
        let mut store_ref = store.borrow_mut();
        let principal_str = principal_id.to_string();

        // Log all data items in the store for debugging
        ic_cdk::println!("DEBUG: Printing all user tasks in store");
        let keys: Vec<String> = store_ref.iter().map(|(k, _)| k.clone()).collect();
        for key in &keys {
            ic_cdk::println!("DEBUG: Found key: {}", key);
        }

        // Check if the user exists in the store before proceeding
        if !store_ref.contains_key(&principal_str) {
            ic_cdk::println!("User with ID {} not found", principal_str);
        
            return Err(format!("User with ID {} not found", principal_str));
        }
        
        if let Some(user_tasks) = store_ref.get(&principal_str.to_string()) {
            let mut updated_tasks = user_tasks.clone();
            let mut task_found = false;
            
            for task in &mut updated_tasks.tasks {
                if task.task_id == task_id {
                    task.status = status.clone();
                    task_found = true;
                    
                    // If the task is completed, add a task reward record
                    if status == "FINISH" {
                        let reward_amount = task.rewards;
                        match crate::activate_types::add_task_reward(
                            task_id.to_string(),
                            principal_id.to_string(),
                            candid::Nat::from(reward_amount),
                        ) {
                            Ok(_) => {
                                ic_cdk::println!("Task reward added for user {} and task {}", principal_id, task_id);
                            },
                            Err(e) => {
                                ic_cdk::println!("Failed to add task reward: {}", e);
                            }
                        }
                    }
                    break;
                }
            }
            
            if task_found {
                store_ref.insert(principal_str.clone(), updated_tasks);
                return Ok(());
            } else {
                return Err(format!("Task with ID {} not found", task_id));
            }
        } 
        Err(format!("Undefine exception "))
    })
}

pub fn batch_add_info_items(items: Vec<BatchInfoItem>) -> Result<(), String> {
    COMMON_INFO_MAP.with(|store| {
        let mut store = store.borrow_mut();
        for item in items {
            let info = CommonInfoCfg::create_info(item.key.clone(), item.content);
            store.insert(item.key, info);
        }
        Ok(())
    })
}

pub fn get_info_by_key(key: &String) -> Option<CommonInfoCfg> {
    COMMON_INFO_MAP.with(|store| {
        let store = store.borrow();
        store.get(key)
            .filter(|info| info.check_validity())
    })
}

pub fn batch_get_info(keys: Vec<String>) -> Vec<Option<CommonInfoCfg>> {
    COMMON_INFO_MAP.with(|store| {
        let store = store.borrow();
        keys.iter()
            .map(|key| {
                store.get(key)
                    .filter(|info| info.check_validity())
            })
            .collect()
    })
}

pub fn update_info_item(key: String, content: String) -> Result<(), String> {
    COMMON_INFO_MAP.with(|store| {
        let mut store = store.borrow_mut();

        if let Some(mut existing_info) = store.get(&key) {
            if !existing_info.check_validity() {
                return Err("Info item is not valid".to_string());
            }
            existing_info.update_info(content);
            store.insert(key, existing_info);
            Ok(())
        } else {
            Err("Key not found".to_string())
        }
    })
}

/** -------------------------------custom info--------------------------------- */
pub fn find_custom_info_index(dapp_principal: &str, wallet_principal: &str) -> Option<u64> {
    CUSTOM_INFO_SET.with(|store| {
        let store = store.borrow();
        for i in 0..store.len() {
            if let Some(info) = store.get(i) {
                if !wallet_principal.is_empty() && !info.wallet_principal.is_empty() && info.wallet_principal == wallet_principal {
                    return Some(i);
                }

                if !dapp_principal.is_empty() && !info.dapp_principal.is_empty() && info.dapp_principal == dapp_principal {
                    return Some(i);
                }
            }
        }
        None
    })
}

pub fn add_custom_info(info: CustomInfo) -> Result<(), String> {
    // Validate that at least one principal is provided
    if info.dapp_principal.is_empty() && info.wallet_principal.is_empty() {
        return Err("Either dapp_principal or wallet_principal must be provided".to_string());
    }

    // Check if custom already exists
    if let Some(index) = find_custom_info_index(&info.dapp_principal, &info.wallet_principal) {
        // Update existing custom info
        CUSTOM_INFO_SET.with(|store| {
            let mut store = store.borrow_mut();
            let mut existing_info = store.get(index)
                .ok_or("Failed to get existing custom info")?;

            // Update modifiable fields
            if !info.wallet_principal.is_empty() {
                existing_info.wallet_principal = info.wallet_principal;
            }
            if !info.logo.is_empty() {
                existing_info.logo = info.logo;
            }
            if !info.nick_name.is_empty() {
                existing_info.nick_name = info.nick_name;
            }

            if existing_info.invite_code.is_empty() {
                existing_info.invite_code = info.invite_code.clone();
            }

            if let Some(code) = info.used_invite_code.clone() {
                existing_info.used_invite_code = Some(code);
                existing_info.is_invite_code_filled = true;
            }

            if existing_info.total_rewards == 0 {
                existing_info.total_rewards = info.total_rewards;
            }

            store.set(index, &existing_info);
            Ok(())
        })
    } else {
        // Add new custom info
        CUSTOM_INFO_SET.with(|store| {
            let mut store = store.borrow_mut();
            store.push(&info)
                .map_err(|e| format!("Failed to store custom info: {}", e))
        })
    }
}

pub fn get_custom_info(dapp_principal: Option<String>, wallet_principal: Option<String>) -> Option<CustomInfo> {
    if dapp_principal.is_none() && wallet_principal.is_none() {
        ic_cdk::println!("get_custom_info called with no principal identifiers");
        return None;
    }

    CUSTOM_INFO_SET.with(|store| {
        let store = store.borrow();
        for i in 0..store.len() {
            if let Some(info) = store.get(i) {
                match (&dapp_principal, &wallet_principal) {
                    (Some(dapp), _) if !info.dapp_principal.is_empty() && info.dapp_principal == *dapp => {
                        return Some(CustomInfo {
                            dapp_principal: info.dapp_principal.clone(),
                            wallet_principal: info.wallet_principal.clone(),
                            nick_name: info.nick_name.clone(),
                            logo: info.logo.clone(),
                            is_invite_code_filled: info.is_invite_code_filled,
                            invite_code: info.invite_code.clone(),
                            used_invite_code: info.used_invite_code.clone(),
                            total_rewards: info.total_rewards,
                        });
                    }
                    (_, Some(wallet)) if !info.wallet_principal.is_empty() && info.wallet_principal == *wallet => {
                        return Some(CustomInfo {
                            dapp_principal: info.dapp_principal.clone(),
                            wallet_principal: info.wallet_principal.clone(),
                            nick_name: info.nick_name.clone(),
                            logo: info.logo.clone(),
                            is_invite_code_filled: info.is_invite_code_filled,
                            invite_code: info.invite_code.clone(),
                            used_invite_code: info.used_invite_code.clone(),
                            total_rewards: info.total_rewards,
                        });
                    }
                    _ => continue,
                }
            }
        }
        // Log that we couldn't find a matching custom info
        if let Some(dapp) = &dapp_principal {
            ic_cdk::println!("No custom info found for dapp principal: {}", dapp);
        }
        if let Some(wallet) = &wallet_principal {
            ic_cdk::println!("No custom info found for wallet principal: {}", wallet);
        }
        None
    })
}

pub fn update_custom_info(dapp_principal: Option<String>, wallet_principal: Option<String>, nick_name: String, logo: String) -> Result<(), String> {
    // Validate that at least one principal is provided
    if dapp_principal.is_none() && wallet_principal.is_none() {
        return Err("Either dapp_principal or wallet_principal must be provided".to_string());
    }

    // Find the index of the custom info
    let index = match (dapp_principal, wallet_principal) {
        (Some(dapp), _) => find_custom_info_index(&dapp, ""),
        (_, Some(wallet)) => find_custom_info_index("", &wallet),
        _ => None,
    };

    // Update the custom info if found
    if let Some(index) = index {
        CUSTOM_INFO_SET.with(|store| {
            let mut store = store.borrow_mut();
            if let Some(mut info) = store.get(index) {
                info.update_custominfo(nick_name, logo);
                store.set(index, &info);
                Ok(())
            } else {
                Err("Custom info not found".to_string())
            }
        })
    } else {
        Err("Custom info not found".to_string())
    }
}

pub fn update_used_invite_code(wallet_principal: String, used_invite_code: Option<String>) -> Result<(), String> {
    if wallet_principal.is_empty() {
        return Err("Wallet principal ID cannot be empty".to_string());
    }

    // Find the index of the custom info
    let index = find_custom_info_index("", &wallet_principal);

    // Update the used_invite_code if found
    if let Some(index) = index {
        CUSTOM_INFO_SET.with(|store| {
            let mut store = store.borrow_mut();
            if let Some(mut info) = store.get(index) {
                info.used_invite_code = used_invite_code;
                store.set(index, &info);
                Ok(())
            } else {
                Err("Failed to retrieve custom info".to_string())
            }
        })
    } else {
        Err(format!("No custom info found for wallet principal: {}", wallet_principal))
    }
}

pub fn list_custom_info(page: u64, page_size: u64) -> Vec<CustomInfo> {
    CUSTOM_INFO_SET.with(|store| {
        let store = store.borrow();
        let start = page * page_size;
        let end = std::cmp::min(start + page_size, store.len());

        // Check if start is within bounds
        if start >= store.len() {
            return Vec::new();
        }

        (start..end)
            .filter_map(|i| store.get(i))
            .collect()
    })
}

pub fn claim_reward(dapp_principal: Option<String>, wallet_principal: Option<String>,
                    quest_id: u64) -> bool {
    if dapp_principal.is_none() && wallet_principal.is_none() {
        ic_cdk::trap("Either dapp_principal or wallet_principal must be provided");
    }

    let caller_principal = ic_cdk::caller().to_string();
    let user_principal = wallet_principal
        .clone()
        .unwrap_or_else(|| dapp_principal.clone().unwrap_or(caller_principal));

    let mut found_quest = false;
    QUESTS.with(|quests| {
        let mut quests = quests.borrow_mut();
        for quest in quests.iter_mut() {
            if quest.quest_id == quest_id {
                if quest.is_completed {
                    ic_cdk::println!("Quest is already completed and cannot be claimed again: {:?}", quest_id);
                    return;
                }
                quest.is_completed = true;
                found_quest = true;
                break;
            }
        }
    });

    if !found_quest {
        ic_cdk::println!("Quest does not exist: {:?}", quest_id);
        return false;
    }

    let reward_amount = QUESTS.with(|quests| {
        quests.borrow().iter().find(|q| q.quest_id == quest_id).map(|q| q.reward_amount)
    });

    if reward_amount.is_none() {
        ic_cdk::println!("Failed to get reward amount for quest {:?}", quest_id);
        return false;
    }

    let reward_amount = reward_amount.unwrap();
    CUSTOM_INFO_SET.with(|store| {
        let mut store = store.borrow_mut();
        let len = store.len();

        for i in 0..len {
            if let Some(mut info) = store.get(i).map(|v| v.clone()) {
                if info.wallet_principal == user_principal || info.dapp_principal == user_principal {
                    info.total_rewards += reward_amount;
                    store.set(i, &info);

                    ic_cdk::println!(
                        "User {:?} claimed quest {:?} reward: {:?}",
                        user_principal, quest_id, reward_amount
                    );
                    return true;
                }
            }
        }

        ic_cdk::println!("User not found, unable to claim the reward: {:?}", user_principal);
        false
    })
}

pub fn get_quest_list(dapp_principal: Option<String>, wallet_principal: Option<String>) -> Vec<Quest> {
    if dapp_principal.is_none() && wallet_principal.is_none() {
        ic_cdk::trap("Either dapp_principal or wallet_principal must be provided");
    }

    QUESTS.with(|quests| quests.borrow().clone())
}
// Function to find a CustomInfo by invite code
// This is needed by the activate_types.rs module
pub fn find_custom_info_by_invite_code(code: &str) -> Option<CustomInfo> {
    if code.is_empty() {
        return None;
    }
    
    CUSTOM_INFO_SET.with(|store| {
        let store = store.borrow();
        for i in 0..store.len() {
            if let Some(info) = store.get(i) {
                if info.invite_code == code {
                    return Some(info);
                }
            }
        }
        None
    })
}

pub fn get_invited_users(dapp_principal: Option<String>, wallet_principal: Option<String>) -> InvitedUserResponse {
    if dapp_principal.is_none() && wallet_principal.is_none() {
        ic_cdk::trap("Either dapp_principal or wallet_principal must be provided");
    }

    let caller_principal = ic_cdk::caller().to_string();
    let user_principal = wallet_principal
        .clone()
        .unwrap_or_else(|| dapp_principal.clone().unwrap_or(caller_principal));

    let mut users = Vec::new();
    let mut total_invited = 0;

    INVITE_CODE_TO_USER_MAP.with(|map| {
        let map = map.borrow();
        for (invite_code, invited_users) in map.iter() {
            if let Some(inviter) = find_inviter_by_invite_code(invite_code) {
                if inviter == user_principal {
                    CUSTOM_INFO_SET.with(|store| {
                        let store = store.borrow();
                        for invited_user_principal in invited_users {
                            if let Some(user_info) = store.iter().find(|info| &info.wallet_principal == invited_user_principal) {
                                users.push(InvitedUser {
                                    dapp_principal: user_info.dapp_principal.clone(),
                                    wallet_principal: user_info.wallet_principal.clone(),
                                    nick_name: user_info.nick_name.clone(),
                                    logo: user_info.logo.clone(),
                                    reward_amount: INVITE_REWARD,
                                });
                                total_invited += 1;
                            }
                        }
                    });
                }
            }
        }
    });

    InvitedUserResponse {
        total_invited,
        users,
    }
}

fn find_inviter_by_invite_code(invite_code: &String) -> Option<String> {
    CUSTOM_INFO_SET.with(|store| {
        let store = store.borrow();
        let result = store.iter().find(|info| info.invite_code == *invite_code).map(|info| info.wallet_principal.clone());
        result
    })
}

pub fn generate_random_nickname() -> String {
    let adjectives = [
        "Happy", "Swift", "Brave", "Clever", "Gentle", "Jolly", "Kind", "Lively", "Mighty", "Nice",
        "Polite", "Quiet", "Rapid", "Smart", "Calm", "Eager", "Tough", "Wise", "Zany", "Proud",
        "Rare", "Bold", "Quick", "Fresh", "Alpha", "Mega", "Ultra", "Super", "Hyper", "Epic",
        "Agile", "Bright", "Crazy", "Daring", "Elite", "Fancy", "Grand", "Harsh", "Icy", "Jumpy",
        "Keen", "Lucky", "Magic", "Noble", "Oval", "Prime", "Royal", "Sleek", "Tiny", "Vast",
        "Wild", "Young", "Zealous", "Amber", "Blue", "Coral", "Deep", "Elated", "Fierce", "Golden",
        "Humble", "Ideal", "Joyful", "Keen", "Loyal", "Majestic", "Nifty", "Optimal", "Perfect", "Radiant",
        "Serene", "Tranquil", "Unique", "Vibrant", "Witty", "Exotic", "Yielding", "Zippy", "Active", "Busy",
        "Cosmic", "Dynamic", "Earnest", "Flying", "Glowing", "Honest", "Intense", "Jubilant", "Kingly", "Luminous",
        "Mystical", "Natural", "Original", "Peaceful", "Quirky", "Robust", "Shining", "Talented", "Upbeat", "Valiant"
    ];
    
    let nouns = [
        "Bear", "Eagle", "Tiger", "Panda", "Shark", "Whale", "Hawk", "Lion", "Wolf", "Fox",
        "Rabbit", "Deer", "Falcon", "Dragon", "Phoenix", "Rocket", "Star", "Moon", "Comet", "Planet",
        "Ocean", "Mountain", "Forest", "River", "Sky", "Thunder", "Knight", "Ninja", "Samurai", "Hero",
        "Wizard", "Pirate", "Giant", "Angel", "Titan", "Demon", "Elf", "Dwarf", "Mage", "Ranger",
        "Rogue", "Warrior", "Bard", "Monk", "Paladin", "Archer", "Hunter", "Scout", "Mystic", "Shaman",
        "Gladiator", "Viking", "Nomad", "Sage", "Oracle", "Prophet", "Guardian", "Sentinel", "Warden", "Keeper",
        "Captain", "Chief", "Emperor", "King", "Queen", "Prince", "Princess", "Duke", "Baron", "Champion",
        "Soldier", "Mariner", "Scholar", "Alchemist", "Inventor", "Explorer", "Pioneer", "Voyager", "Traveler", "Wanderer",
        "Seeker", "Fighter", "Legend", "Titan", "Colossus", "Leviathan", "Kraken", "Hydra", "Griffin", "Unicorn",
        "Pegasus", "Sphinx", "Chimera", "Minotaur", "Centaur", "Cyclops", "Golem", "Gargoyle", "Behemoth", "Phantom"
    ];
    
    let mut rng = rand::thread_rng();
    let adj_idx = rng.gen_range(0..adjectives.len());
    let noun_idx = rng.gen_range(0..nouns.len());
    let number = rng.gen_range(1..1000);
    
    format!("{}{}{}", adjectives[adj_idx], nouns[noun_idx], number)
}

#[derive(Clone, CandidType, Deserialize, Serialize)]
pub struct CanisterMapping {
    pub key: String,
    pub canister_id: String,
}

impl Storable for CanisterMapping {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let serialized = candid::encode_one(self).expect("Failed to serialize CanisterMapping");
        std::borrow::Cow::Owned(serialized)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).expect("Failed to deserialize CanisterMapping")
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 1024,
        is_fixed_size: false,
    };
}

impl CanisterMapping {
    pub fn new(key: String, canister_id: String) -> Self {
        CanisterMapping {
            key,
            canister_id,
        }
    }
}

// Add a new canister mapping
pub fn add_canister_mapping(key: String, canister_id: String) -> Result<(), String> {
    if key.is_empty() || canister_id.is_empty() {
        return Err("Key and canister_id cannot be empty".to_string());
    }

    CANISTER_MAPPINGS.with(|store| {
        let mut store = store.borrow_mut();
        
        // Check if the key already exists - search inline to avoid double borrowing
        let mut existing_index = None;
        for i in 0..store.len() {
            if let Some(mapping) = store.get(i) {
                if mapping.key == key {
                    existing_index = Some(i);
                    break;
                }
            }
        }
        
        if let Some(index) = existing_index {
            // Update existing mapping
            let mapping = CanisterMapping::new(key.clone(), canister_id);
            store.set(index, &mapping);
        } else {
            // Add new mapping
            let mapping = CanisterMapping::new(key.clone(), canister_id);
            store.push(&mapping)
                .map_err(|e| format!("Failed to store canister mapping: {}", e))?;
        }
        
        Ok(())
    })
}

// Find a canister mapping by key
fn find_canister_mapping_index(key: &str) -> Option<u64> {
    CANISTER_MAPPINGS.with(|store| {
        let store = store.borrow();
        for i in 0..store.len() {
            if let Some(mapping) = store.get(i) {
                if mapping.key == key {
                    return Some(i);
                }
            }
        }
        None
    })
}

// Get a canister ID by key
pub fn get_canister_id(key: &str) -> Option<String> {
    if key.is_empty() {
        return None;
    }
    
    CANISTER_MAPPINGS.with(|store| {
        let store = store.borrow();
        for i in 0..store.len() {
            if let Some(mapping) = store.get(i) {
                if mapping.key == key {
                    return Some(mapping.canister_id.clone());
                }
            }
        }
        None
    })
}

// Get all canister mappings
pub fn get_all_canister_mappings() -> Vec<CanisterMapping> {
    CANISTER_MAPPINGS.with(|store| {
        let store = store.borrow();
        (0..store.len())
            .filter_map(|i| store.get(i))
            .collect()
    })
}

// Specific canister type implementations

// Frontend canister
pub fn set_frontend_canister(canister_id: String) -> Result<(), String> {
    add_canister_mapping("frontend".to_string(), canister_id)
}

pub fn get_frontend_canister() -> Option<String> {
    get_canister_id("frontend")
}

// Bulklet canister
pub fn set_bulklet_canister(canister_id: String) -> Result<(), String> {
    add_canister_mapping("bulklet".to_string(), canister_id)
}

pub fn get_bulklet_canister() -> Option<String> {
    get_canister_id("bulklet")
}

// Mugc/Muge canister
pub fn set_mugc_canister(canister_id: String) -> Result<(), String> {
    add_canister_mapping("mugc".to_string(), canister_id)
}

pub fn get_mugc_canister() -> Option<String> {
    get_canister_id("mugc")
}

// Cluster canister
pub fn set_cluster_canister(canister_id: String) -> Result<(), String> {
    add_canister_mapping("cluster".to_string(), canister_id)
}

pub fn get_cluster_canister() -> Option<String> {
    get_canister_id("cluster")
}


// VMC canister
pub fn set_vmc_canister(canister_id: String) -> Result<(), String> {
    add_canister_mapping("vmc".to_string(), canister_id)
}

pub fn get_vmc_canister() -> Option<String> {
    get_canister_id("vmc")
}

// Initialize default canisters with empty IDs
pub fn initialize_default_canisters() -> Result<(), String> {
    set_frontend_canister("".to_string())?;
    set_bulklet_canister("".to_string())?;
    set_mugc_canister("".to_string())?;
    set_cluster_canister("".to_string())?;
    set_vmc_canister("".to_string())?;
    Ok(())
}

