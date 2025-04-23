
use candid::{Nat, Principal};
use ic_cdk_macros::{init, query, update};
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, Memory, StableVec,
};
use icrc_ledger_types::icrc1::transfer::NumTokens;
use serde_json::Number;
use std::cell::RefCell;

use crate::mixcomfy_types::{
    AIWorkPow, ClientPromptStore, ComfyUIPayload, UploaderPow, UploaderPowContract, UploaderPowContractInput, WorkflowLedger,
    WorkflowLedgerItem, WorkflowLedgerStatus, WorkLoadInitParam,
};

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static WORKFLOW_DATA: RefCell<StableVec<ClientPromptStore, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new(
            StableVec::init(
                MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
            ).expect("Failed to initialize WORKFLOW_DATA")
        );

    static WORKFLOW_LEDGER: RefCell<StableVec<WorkflowLedgerItem, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new(
            StableVec::init(
                MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
            ).expect("Failed to initialize WORKFLOW_LEDGER")
        );
    static WORKFLOW_UPLOAD_POW_DATA: RefCell<StableVec<UploaderPow, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new(
        StableVec::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        ).expect("Failed to initialize WORKFLOW_POW_DATA")
        );
    static AI_WORKFLOW_POW_DATA: RefCell<StableVec<AIWorkPow, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new(
        StableVec::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3)))
        ).expect("Failed to initialize AI_WORKFLOW_POW_DATA")
    );
    static UPLOADER_POW_CONTRACT: RefCell<StableVec<UploaderPowContract, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new(
        StableVec::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(4)))
        ).expect("Failed to initialize UPLOADER_POW_CONTRACT")
    );
    static WORKLOAD_INIT_PARAM: RefCell<StableVec<WorkLoadInitParam, VirtualMemory<DefaultMemoryImpl>>> = RefCell::new(
        StableVec::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5)))
        ).expect("Failed to initialize WORKLOAD_INIT_PARAM")
    );
    

}

pub fn store_workflow_data(principal_id: String, prompt_json: String) -> Result<String, String> {
    let store = ClientPromptStore(principal_id.clone(), prompt_json.clone());
    ic_cdk::println!(
        "Storing workflow data for principal_id: {}",
        principal_id );

    WORKFLOW_DATA.with(|data| -> Result<(), String> {
        data.borrow_mut()
            .push(&store)
            .map_err(|e| format!("Failed to store workflow data: {}", e))?;
        Ok(())
    })?;
    let client_id = serde_json::from_str::<serde_json::Value>(&prompt_json)
        .map_err(|e| format!("Failed to parse JSON: {}", e))?
        .get("client_id")
        .and_then(|v| v.as_str())
        .ok_or_else(|| "client_id not found in JSON".to_string())?
        .to_string();

    // After storing the data, record rewards and set status
    record_rewards_and_set_status(&principal_id, client_id)
}

fn record_rewards_and_set_status(
    principal_id: &String,
    client_id: String,
) -> Result<String, String> {
    let timestamp = ic_cdk::api::time();
    let token_reward = Nat::from(10 as u32); // Example token reward, adjust as needed
    let status = WorkflowLedgerStatus::WAIT_IDENTITY;

    let workflow_id = format!("{}-{}", principal_id, timestamp); // Example workflow ID generation
    ic_cdk::println!("Generated workflow_id: {}-{}-{}", principal_id, timestamp,workflow_id);

    let ledger_item = WorkflowLedgerItem {
        principal_id: principal_id.clone(),
        client_id: client_id.clone(),
        workflow_id: workflow_id.clone(),
        timestamp,
        identity_timestamp: 0,
        token_reward,
        status: status.clone(),
    };

    WORKFLOW_LEDGER.with(|ledger| -> Result<(), String> {
        ledger
            .borrow_mut()
            .push(&ledger_item)
            .map_err(|e| format!("Failed to push ledger item: {}", e))?;
        Ok(())
    })?;

    ic_cdk::println!(
        "Rewards recorded and status set to '{:?}' for principal_id: {}, client_id: {}, workflow_id: {}",
        status,
        principal_id,
        client_id,
        workflow_id
    );

    Ok(workflow_id.clone())
}

pub fn fetch_workflow_data(workflow_id: String) -> String {
    let mut matching_client_prompt_store: Option<ClientPromptStore> = None;

    WORKFLOW_LEDGER.with(|ledger| {
        let ledger = ledger.borrow();
        if let Some(ledger_item) = (0..ledger.len())
            .filter_map(|i| ledger.get(i))
            .find(|item| item.workflow_id == workflow_id)
        {
            WORKFLOW_DATA.with(|data| {
                let data = data.borrow();
                matching_client_prompt_store = (0..data.len())
                    .filter_map(|i| data.get(i))
                    .find(|store| store.0 == ledger_item.principal_id);
            });
        }
    });

    if let Some(store) = matching_client_prompt_store {
        return store.1;
    } else {
        "[]".to_string()
    }
}


pub fn export_all_uploader_pow_contracts() -> Vec<UploaderPowContract> {
    UPLOADER_POW_CONTRACT.with(|contracts| {
        let contracts = contracts.borrow();
        (0..contracts.len())
            .filter_map(|i| contracts.get(i))
            .collect()
    })
}

pub fn store_uploader_pow(payload: ComfyUIPayload, contract_token:NumTokens) -> Result<NumTokens, String> {
    
    let existing_contract = UPLOADER_POW_CONTRACT.with(|data| {
        let data = data.borrow();
        (0..data.len())
            .filter_map(|i| data.get(i))
            .find(|contract| contract.workflow_id == payload.wk_id)
    });

    if let Some(contract) = existing_contract {
        ic_cdk::println!("Found existing contract: {:?}", contract);
        let test_output = UploaderPowContract::parse_string_to_vec(&payload.voice_key);
        let error = contract.calculate_gauss_error(test_output);
        let tokens: NumTokens = if error > 0.7 {
            contract_token.clone()
        } else {
            NumTokens::from(0 as u64)
        };
        ic_cdk::println!("Calculated error: {}", error);

        WORKFLOW_LEDGER.with(|ledger| {
            let mut ledger = ledger.borrow_mut();
            for i in 0..ledger.len() {
                if let Some(mut item) = ledger.get(i) {
                    if item.workflow_id == payload.wk_id {
                        item.token_reward = tokens.clone();
                        item.status = WorkflowLedgerStatus::WAIT_CLAIM;
                        ledger.set(i, &item);
                        break;
                    }
                }
            }
            
        });
        Ok(tokens)
    } else {
        ic_cdk::println!("No existing contract found for workflow_id: {}", payload.wk_id);
        Err("No existing contract found".to_string())
    }   
}

pub fn store_or_update_uploader_pow_contract(contract_input: UploaderPowContractInput) -> Result<(), String> {
    let contract = UploaderPowContract {
        sample_output: UploaderPowContract::parse_string_to_vec(&contract_input.sample_output),
        identity_gusserr_limit: contract_input.identity_gusserr_limit,
        workflow_id: contract_input.workflow_id.clone(),
    };
    
    UPLOADER_POW_CONTRACT.with(|data| {
        let mut data = data.borrow_mut();
        
        // Find existing contract index
        let existing_index = (0..data.len())
            .find(|&i| {
                if let Some(existing) = data.get(i) {
                    existing.workflow_id == contract.workflow_id
                } else {
                    false
                }
            });

        match existing_index {
            Some(index) => {
                // Update existing contract
                ic_cdk::println!("Updating existing contract at index: {}", index);
                data.set(index, &contract);
                Ok(())
            },
            None => {
                // Store new contract
                ic_cdk::println!("Storing new contract");
                data.push(&contract)
                    .map_err(|e| format!("Failed to store contract: {}", e))
            }
        }
    })
}

pub fn export_minting_contract() -> Option<WorkLoadInitParam> {
    WORKLOAD_INIT_PARAM.with(|params| {
        let params = params.borrow();
        params.get(0)
    })
}

pub fn store_workload_init_param(param: WorkLoadInitParam) -> Result<(), String> {
    WORKLOAD_INIT_PARAM.with(|params| {
        let mut params = params.borrow_mut();
        
        // Clear existing parameters if any
        while params.len() > 0 {
            params.pop();
        }
        
        // Store new parameter
        params.push(&param)
            .map_err(|e| format!("Failed to store workload init param: {}", e))
    })
}

/// Queries the workflow ledger to retrieve all ledger items associated with a specific principal ID
///
/// # Arguments
/// * `principal_id` - A string representing the principal ID to query for
///
/// # Returns
/// * `Result<Vec<WorkflowLedgerItem>, String>` - Returns Ok with a vector of WorkflowLedgerItem if found,
///   or Err with error message if no items found
///
/// # Examples
/// ```
/// let principal_id = "abc123".to_string();
/// match query_workflow_ledger_by_principal(principal_id) {
///     Ok(items) => {
///         for item in items {
///             println!("Found workflow: {}", item.workflow_id);
///         }
///     },
///     Err(e) => println!("Error: {}", e)
/// }
/// ```
pub fn query_workflow_ledger_by_principal(principal_id: String) -> Result<Vec<WorkflowLedgerItem>, String> {
    ic_cdk::println!("Querying workflow ledger for principal_id: {}", principal_id);
    WORKFLOW_LEDGER.with(|ledger| {
        let ledger = ledger.borrow();
        let items: Vec<WorkflowLedgerItem> = (0..ledger.len())
            .filter_map(|i| ledger.get(i))
            .filter(|item| item.principal_id == principal_id)
            .collect();
        
        if items.is_empty() {
            ic_cdk::println!("No workflow ledger items found for principal_id: {}", principal_id);
            Err("No workflow ledger items found for the given principal_id".to_string())
        } else {
            ic_cdk::println!("Found {} workflow ledger items for principal_id: {}", items.len(), principal_id);
            Ok(items)
        }
    })
}

/// Queries the workflow ledger to retrieve all workflow IDs that are in the `WAIT_IDENTITY` status.
///
/// # Returns
/// * `Vec<String>` - A vector of workflow IDs that are currently waiting for identity verification.
///
/// # Examples
pub fn query_wait_identity_workflows() -> Vec<String> {
    WORKFLOW_LEDGER.with(|ledger| {
        let ledger = ledger.borrow();
        (0..ledger.len())
            .filter_map(|i| ledger.get(i))
            .filter(|item| item.status == WorkflowLedgerStatus::WAIT_IDENTITY)
            .map(|item| item.workflow_id)
            .collect()
    })
}

/// Queries the workflow ledger to retrieve all workflow IDs that are not in the `WAIT_IDENTITY` or `IDENTITY_FAIL` status.
///
/// # Returns
/// * `Vec<String>` - A vector of workflow IDs that are currently not waiting for identity verification or have failed identity verification.
///
/// # Examples
pub fn query_wait_training_workflows() -> Vec<String> {
    WORKFLOW_LEDGER.with(|ledger| {
        let ledger = ledger.borrow();
        (0..ledger.len())
            .filter_map(|i| ledger.get(i))
            .filter(|item| item.status != WorkflowLedgerStatus::WAIT_IDENTITY && item.status != WorkflowLedgerStatus::IDENTITY_FAIL)
            .map(|item| item.workflow_id)
            .collect()
    })
}



