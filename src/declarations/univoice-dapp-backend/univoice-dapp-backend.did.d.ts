import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface Account__3 {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface BatchInfoItem { 'key' : string, 'content' : string }
export type BlockIndex = bigint;
export interface CanisterMapping { 'key' : string, 'canister_id' : string }
export interface CommonInfoCfg {
  'key' : string,
  'content' : string,
  'isvalid' : boolean,
  'version' : string,
}
export interface CustomInfo {
  'dapp_principal' : string,
  'is_invite_code_filled' : boolean,
  'total_rewards' : bigint,
  'logo' : string,
  'invite_code' : string,
  'wallet_principal' : string,
  'used_invite_code' : [] | [string],
  'nick_name' : string,
}
export interface FileChunk {
  'chunk_index' : number,
  'content' : Uint8Array | number[],
}
export interface FileInfo {
  'id' : number,
  'status' : number,
  'updated_at' : bigint,
  'name' : string,
  'size' : bigint,
  'content_type' : string,
  'created_at' : bigint,
  'filled' : bigint,
  'chunks' : number,
  'parent' : number,
}
export interface FolderInfo {
  'id' : number,
  'files' : Uint32Array | number[],
  'status' : number,
  'updated_at' : bigint,
  'name' : string,
  'folders' : Uint32Array | number[],
  'created_at' : bigint,
  'parent' : number,
}
export interface InviteRewardRecord {
  'id' : string,
  'claimed_at' : [] | [bigint],
  'token_amount' : bigint,
  'is_claimed' : boolean,
  'invite_code' : string,
  'created_at' : bigint,
  'new_user' : string,
  'code_owner' : string,
}
export interface InvitedUser {
  'dapp_principal' : string,
  'logo' : string,
  'reward_amount' : bigint,
  'wallet_principal' : string,
  'nick_name' : string,
}
export interface InvitedUserResponse {
  'users' : Array<InvitedUser>,
  'total_invited' : bigint,
}
export type LicenseFetchResult = {
    'Ok' : [Array<UserLicenseRecord>, NFTCollection]
  } |
  { 'Err' : string };
export interface ListVoiceOssParams {
  'prev' : [] | [bigint],
  'take' : [] | [number],
  'principal_id' : [] | [Principal],
  'folder_id' : [] | [number],
}
export type MetadataValue = { 'Int' : bigint } |
  { 'Nat' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Text' : string };
export interface NFTCollection {
  'supply_cap' : [] | [bigint],
  'owner' : Principal,
  'allowed_transfers' : boolean,
  'logo' : [] | [string],
  'name' : string,
  'description' : [] | [string],
  'expired_at' : [] | [bigint],
  'total_supply' : bigint,
  'symbol' : string,
}
export type PolicyResult = { 'Ok' : null } |
  { 'Err' : string };
export interface Quest {
  'quest_id' : bigint,
  'redirect_url' : string,
  'reward_amount' : bigint,
  'is_completed' : boolean,
  'quest_name' : string,
}
export interface TaskData {
  'status' : string,
  'task_id' : string,
  'task_url' : string,
  'rewards' : bigint,
}
export interface Token {
  'subject' : Principal,
  'audience' : Principal,
  'policies' : string,
}
export interface TransferFromArgs {
  'to' : Account,
  'fee' : [] | [bigint],
  'spender_subaccount' : [] | [Uint8Array | number[]],
  'from' : Account,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export type TransferFromError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'InsufficientAllowance' : { 'allowance' : bigint } } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export interface UserLicenseRecord {
  'token_id' : bigint,
  'owner' : string,
  'nft_collection_id' : string,
  'purchase_time' : bigint,
  'license_name' : string,
  'expired_at' : [] | [bigint],
}
export interface UserNFTHolding {
  'nft_colletion_id' : string,
  'owner' : Principal,
  'token_ids' : Array<bigint>,
  'expired_at' : [] | [bigint],
}
export interface UserNFTsRequest {
  'user' : string,
  'license_ids' : Array<string>,
}
export interface UserNFTsResponse { 'holdings' : Array<UserNFTHolding> }
export interface UserTasks {
  'tasks' : Array<TaskData>,
  'principal_id' : string,
}
export interface User_tasks {
  'tasks' : Array<TaskData>,
  'principal_id' : string,
}
export interface VoiceAssetData {
  'status' : number,
  'updated_at' : [] | [bigint],
  'custom' : [] | [Array<[string, MetadataValue]>],
  'created_at' : bigint,
  'principal_id' : Principal,
  'folder_id' : number,
  'file_id' : number,
}
export interface VoiceOssInfo {
  'status' : number,
  'updated_at' : [] | [bigint],
  'custom' : [] | [Array<[string, MetadataValue]>],
  'created_at' : bigint,
  'file_id' : number,
}
export interface _SERVICE {
  'add_canister_mapping' : ActorMethod<
    [string, string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'add_custom_info' : ActorMethod<
    [CustomInfo],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'add_info_item' : ActorMethod<
    [string, string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'attach_policies' : ActorMethod<
    [string, string, string, string],
    PolicyResult
  >,
  'batch_add_info_items' : ActorMethod<
    [Array<BatchInfoItem>],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'batch_get_info' : ActorMethod<[Array<string>], Array<[] | [CommonInfoCfg]>>,
  'buy_nft_license' : ActorMethod<[string, string, bigint], LicenseFetchResult>,
  'claim_reward' : ActorMethod<[[] | [string], [] | [string], bigint], boolean>,
  'claim_tokens' : ActorMethod<
    [string],
    { 'Ok' : bigint } |
      { 'Err' : string }
  >,
  'delete_voice_file' : ActorMethod<
    [string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'detach_policies' : ActorMethod<
    [string, string, string, string],
    PolicyResult
  >,
  'get_access_token' : ActorMethod<
    [string],
    { 'Ok' : { 'access_token' : string, 'folder' : string } } |
      { 'Err' : string }
  >,
  'get_all_canister_mappings' : ActorMethod<[], Array<CanisterMapping>>,
  'get_bucket_canister' : ActorMethod<[], [] | [string]>,
  'get_canister_id' : ActorMethod<[string], [] | [string]>,
  'get_cluster_canister' : ActorMethod<[], [] | [string]>,
  'get_custom_info' : ActorMethod<
    [[] | [string], [] | [string]],
    [] | [CustomInfo]
  >,
  'get_friend_infos' : ActorMethod<[string], Array<[CustomInfo, bigint]>>,
  'get_frontend_canister' : ActorMethod<[], [] | [string]>,
  'get_info_by_key' : ActorMethod<[string], [] | [CommonInfoCfg]>,
  'get_invited_users' : ActorMethod<
    [[] | [string], [] | [string]],
    InvitedUserResponse
  >,
  'get_mugc_canister' : ActorMethod<[], [] | [string]>,
  'get_nft_collection' : ActorMethod<
    [string],
    { 'Ok' : NFTCollection } |
      { 'Err' : string }
  >,
  'get_unclaimed_rewards' : ActorMethod<[string], bigint>,
  'get_user_nfts' : ActorMethod<
    [UserNFTsRequest],
    { 'Ok' : UserNFTsResponse } |
      { 'Err' : string }
  >,
  'get_user_rewards' : ActorMethod<[string], Array<InviteRewardRecord>>,
  'get_user_tasks' : ActorMethod<[string], [] | [Array<TaskData>]>,
  'get_vmc_canister' : ActorMethod<[], [] | [string]>,
  'get_voice_file' : ActorMethod<[bigint], [] | [VoiceAssetData]>,
  'initialize_default_canisters' : ActorMethod<
    [],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'list_custom_info' : ActorMethod<[bigint, bigint], Array<CustomInfo>>,
  'list_voice_files' : ActorMethod<
    [[] | [Principal], [] | [string], [] | [number], [] | [number]],
    Array<VoiceOssInfo>
  >,
  'set_bucket_canister' : ActorMethod<
    [string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'set_cluster_canister' : ActorMethod<
    [string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'set_frontend_canister' : ActorMethod<
    [string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'set_mugc_canister' : ActorMethod<
    [string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'set_vmc_canister' : ActorMethod<
    [string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'transfer_tokens_to_user' : ActorMethod<
    [string, bigint],
    { 'Ok' : bigint } |
      { 'Err' : string }
  >,
  'update_custom_info' : ActorMethod<
    [[] | [string], [] | [string], string, string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'update_info_item' : ActorMethod<
    [string, string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'update_task_status' : ActorMethod<
    [string, string, string],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'upload_voice_file' : ActorMethod<
    [
      Principal,
      string,
      string,
      Uint8Array | number[],
      [] | [Array<[string, string]>],
    ],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'use_invite_code' : ActorMethod<
    [string, string],
    { 'Ok' : InviteRewardRecord } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
