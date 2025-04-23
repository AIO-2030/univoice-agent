use ic_cdk::api::call::call;
use ic_cdk::api::call::call_raw128;
use ic_cdk::api::management_canister::main::CanisterId;
use candid::{CandidType};
use ic_oss_types::cose::Token;
use serde::{Serialize, Deserialize};
use serde_cbor;
use crate::Principal;
use std::time::{SystemTime, UNIX_EPOCH};
use std::string::String;
use ic_cdk::api::time;
use serde_bytes::ByteBuf;
use base64;

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub struct AccessTokenResponse {
    pub access_token: String,
    pub folder: String,
}

pub async fn attach_policies(bucket_id: String, cluster_id: String, principal_id: String, policies: String) -> Result<(), String> {
    ic_cdk::println!("[CHECKPOINT] attach_policies - START | bucket_id: {}, cluster_id: {}, principal_id: {}, policies: {}", 
                    bucket_id, cluster_id, principal_id, policies);
    
    let subject = Principal::from_text(principal_id).map_err(|err| {
        ic_cdk::println!("[CHECKPOINT] attach_policies - ERROR | Failed to parse subject principal: {:?}", err);
        "Invalid subject principal".to_string()
    })?;
    
    let audience = Principal::from_text(bucket_id).map_err(|err| {
        ic_cdk::println!("[CHECKPOINT] attach_policies - ERROR | Failed to parse audience principal: {:?}", err);
        "Invalid audience principal".to_string()
    })?;

    let token = Token { subject, audience, policies, };
    ic_cdk::println!("[CHECKPOINT] attach_policies - Token created | subject: {:?}, audience: {:?}, policies: {}", 
                    token.subject, token.audience, token.policies);

    let cluster_canister_id = Principal::from_text(cluster_id).map_err(|err| {
        ic_cdk::println!("[CHECKPOINT] attach_policies - ERROR | Failed to parse cluster principal: {:?}", err);
        "Invalid cluster principal".to_string()
    })?;
    
    ic_cdk::println!("[CHECKPOINT] attach_policies - Calling admin_attach_policies | cluster_canister_id: {:?}", cluster_canister_id);
    let result: Result<(Result<(), String>,), _> = call(cluster_canister_id, "admin_attach_policies", (token,)).await;
    
    match &result {
        Ok((inner_result,)) => {
            match inner_result {
                Ok(_) => ic_cdk::println!("[CHECKPOINT] attach_policies - SUCCESS"),
                Err(e) => ic_cdk::println!("[CHECKPOINT] attach_policies - Inner error: {}", e),
            }
        },
        Err(err) => ic_cdk::println!("[CHECKPOINT] attach_policies - Call error: {:?}", err),
    }

    let (result,): (Result<(), String>,) = result
        .map_err(|err| {
            let err_msg = format!("Failed to call attach_policies: {:?}", err);
            ic_cdk::println!("[CHECKPOINT] attach_policies - ERROR | {}", err_msg);
            err_msg
        })?;

    ic_cdk::println!("[CHECKPOINT] attach_policies - END | result: {:?}", result);
    result
}

pub async fn detach_policies(bucket_id: String, cluster_id: String, principal_id: String, policies: String) -> Result<(), String> {
    ic_cdk::println!("[CHECKPOINT] detach_policies - START | bucket_id: {}, cluster_id: {}, principal_id: {}, policies: {}", 
                    bucket_id, cluster_id, principal_id, policies);
    
    let subject = Principal::from_text(principal_id).map_err(|err| {
        ic_cdk::println!("[CHECKPOINT] detach_policies - ERROR | Failed to parse subject principal: {:?}", err);
        "Invalid subject principal".to_string()
    })?;
    
    let audience = Principal::from_text(bucket_id).map_err(|err| {
        ic_cdk::println!("[CHECKPOINT] detach_policies - ERROR | Failed to parse audience principal: {:?}", err);
        "Invalid audience principal".to_string()
    })?;

    let token = Token { subject, audience, policies, };
    ic_cdk::println!("[CHECKPOINT] detach_policies - Token created | subject: {:?}, audience: {:?}, policies: {}", 
                   token.subject, token.audience, token.policies);

    let cluster_canister_id = Principal::from_text(cluster_id).map_err(|err| {
        ic_cdk::println!("[CHECKPOINT] detach_policies - ERROR | Failed to parse cluster principal: {:?}", err);
        "Invalid cluster principal".to_string()
    })?;
    
    ic_cdk::println!("[CHECKPOINT] detach_policies - Calling admin_detach_policies | cluster_canister_id: {:?}", cluster_canister_id);
    let result: Result<(Result<(), String>,), _> = call(cluster_canister_id, "admin_detach_policies", (token,)).await;
    
    match &result {
        Ok((inner_result,)) => {
            match inner_result {
                Ok(_) => ic_cdk::println!("[CHECKPOINT] detach_policies - SUCCESS"),
                Err(e) => ic_cdk::println!("[CHECKPOINT] detach_policies - Inner error: {}", e),
            }
        },
        Err(err) => ic_cdk::println!("[CHECKPOINT] detach_policies - Call error: {:?}", err),
    }

    let (result,): (Result<(), String>,) = result
        .map_err(|err| {
            let err_msg = format!("Failed to call detach_policies: {:?}", err);
            ic_cdk::println!("[CHECKPOINT] detach_policies - ERROR | {}", err_msg);
            err_msg
        })?;

    ic_cdk::println!("[CHECKPOINT] detach_policies - END | result: {:?}", result);
    result
}

pub async fn get_access_token(wallet_principal: String) -> Result<AccessTokenResponse, String> {
    ic_cdk::println!("[CHECKPOINT] get_access_token - START | wallet_principal: {}", wallet_principal);
    
    let subject = Principal::from_text(wallet_principal).map_err(|err| {
        ic_cdk::println!("[CHECKPOINT] get_access_token - ERROR | Failed to parse subject principal: {:?}", err);
        "Invalid subject principal".to_string()
    })?;
    
    // Fetch bucket_id from canister mappings
    let bucket_id = crate::buss_types::get_canister_id("bulklet");
    ic_cdk::println!("[CHECKPOINT] get_access_token - Fetched bucket_id: {:?}", bucket_id);
    
    let bucket_id = bucket_id.ok_or_else(|| {
        let err_msg = "Bulklet canister ID not configured".to_string();
        ic_cdk::println!("[CHECKPOINT] get_access_token - ERROR | {}", err_msg);
        err_msg
    })?;
    
    let audience = Principal::from_text(bucket_id).map_err(|err| {
        ic_cdk::println!("[CHECKPOINT] get_access_token - ERROR | Failed to parse bucket principal: {:?}", err);
        "Invalid bucket principal".to_string()
    })?;
    
    // Fetch cluster_id from canister mappings
    let cluster_id = crate::buss_types::get_canister_id("cluster");
    ic_cdk::println!("[CHECKPOINT] get_access_token - Fetched cluster_id: {:?}", cluster_id);
    
    let cluster_id = cluster_id.ok_or_else(|| {
        let err_msg = "Cluster canister ID not configured".to_string();
        ic_cdk::println!("[CHECKPOINT] get_access_token - ERROR | {}", err_msg);
        err_msg
    })?;
    
    let cluster_canister = Principal::from_text(cluster_id).map_err(|err| {
        ic_cdk::println!("[CHECKPOINT] get_access_token - ERROR | Failed to parse cluster principal: {:?}", err);
        "Invalid cluster principal".to_string()
    })?;

    let policies = "Folder.Read:0 Folder.Write:0".to_string();
    let now_sec = time() / 1_000_000_000;
    let expiration_sec = now_sec + 3600;
    
    ic_cdk::println!("[CHECKPOINT] get_access_token - Token params | policies: {}, now_sec: {}, expiration_sec: {}", 
                   policies, now_sec, expiration_sec);

    let token = Token {
        subject,
        audience,
        policies,
    };
    ic_cdk::println!("[CHECKPOINT] get_access_token - Token created | subject: {:?}, audience: {:?}, policies: {}", 
                   token.subject, token.audience, token.policies);

    ic_cdk::println!("[CHECKPOINT] get_access_token - Calling admin_weak_access_token | cluster_canister: {:?}", cluster_canister);
    let result: Result<(Result<ByteBuf, String>,), _> = call(
        cluster_canister, 
        "admin_weak_access_token", 
        (token, now_sec, expiration_sec)
    ).await;
    
    match &result {
        Ok((inner_result,)) => {
            match inner_result {
                Ok(buf) => ic_cdk::println!("[CHECKPOINT] get_access_token - Got ByteBuf of size: {}", buf.len()),
                Err(e) => ic_cdk::println!("[CHECKPOINT] get_access_token - Inner error: {}", e),
            }
        },
        Err(err) => ic_cdk::println!("[CHECKPOINT] get_access_token - Call error: {:?}", err),
    }

    let (result,): (Result<ByteBuf, String>,) = result
        .map_err(|err| {
            let err_msg = format!("Failed to call admin_weak_access_token: {:?}", err);
            ic_cdk::println!("[CHECKPOINT] get_access_token - ERROR | {}", err_msg);
            err_msg
        })?;

    match result {
        Ok(access_token) => {
            ic_cdk::println!("[CHECKPOINT] get_access_token - Access token received | byte_length: {}", access_token.len());
            let access_token_str = base64::encode(access_token.as_ref());
            
            let response = AccessTokenResponse {
                access_token: access_token_str.clone(),
                folder: "0/".to_string(),
            };
            
            ic_cdk::println!("[CHECKPOINT] get_access_token - SUCCESS | token_length: {}, folder: {}", 
                          access_token_str.len(), response.folder);
            Ok(response)
        }
        Err(err) => {
            ic_cdk::println!("[CHECKPOINT] get_access_token - ERROR | Inner error: {}", err);
            Err(err)
        }
    }
}
