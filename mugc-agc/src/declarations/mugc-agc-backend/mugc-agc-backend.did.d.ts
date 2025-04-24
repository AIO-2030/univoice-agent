import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AGIAssetresult { 'res_code' : string, 'res_message' : string }
export interface AGIWkFlowNode { 'wk_flow' : string, 'agi_id' : string }
export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export type BlockIndex = bigint;
export interface ComfyUINode {
  'weight' : bigint,
  'ws_url' : string,
  'node_id' : [] | [bigint],
  'ori_url' : string,
}
export interface ComfyUIPayload {
  'status' : string,
  'voice_key' : string,
  'gmt_datatime' : Timestamp,
  'app_info' : string,
  'ai_node' : string,
  'client_id' : string,
  'wk_id' : string,
  'deduce_asset_key' : string,
  'promt_id' : string,
}
export type MinerTxState = { 'Claimed' : string } |
  { 'Prepared' : string };
export type MixComfyErr = { 'RuntimeErr' : string } |
  { 'NoneNodeVaild' : string };
export type NumTokens = bigint;
export type Result = { 'Ok' : bigint } |
  { 'Err' : string };
export interface Subscriber { 'topic' : string }
export type Timestamp = bigint;
export interface TransferArgs { 'to_account' : Account, 'amount' : bigint }
export interface UploaderPowContract {
  'workflow_id' : string,
  'sample_output' : Uint32Array | number[],
  'identity_gusserr_limit' : number,
}
export interface UploaderPowContractInput {
  'workflow_id' : string,
  'sample_output' : string,
  'identity_gusserr_limit' : number,
}
export interface WorkLoadInitParam {
  'token_block' : bigint,
  'poll_account' : string,
  'nft_collection_id' : string,
}
export interface WorkLoadLedgerItem {
  'mining_status' : MinerTxState,
  'work_load' : ComfyUIPayload,
  'block_tokens' : NumTokens,
  'nft_pool' : string,
  'token_pool' : string,
  'wkload_id' : BlockIndex,
}
export type WorkLoadReceipt = { 'Ok' : WorkLoadLedgerItem } |
  { 'Err' : MixComfyErr };
export interface WorkflowLedgerItem {
  'status' : WorkflowLedgerStatus,
  'workflow_id' : string,
  'token_reward' : NumTokens,
  'timestamp' : Timestamp,
  'principal_id' : string,
  'client_id' : string,
  'identity_timestamp' : Timestamp,
}
export type WorkflowLedgerStatus = { 'IDENTITY_SUCCESS' : null } |
  { 'IDENTITY_FAIL' : null } |
  { 'WAIT_IDENTITY' : null } |
  { 'WAIT_CLAIM' : null };
export interface _SERVICE {
  'export_all_uploader_pow_contracts' : ActorMethod<
    [],
    Array<UploaderPowContract>
  >,
  'export_minting_contract' : ActorMethod<[], [] | [WorkLoadInitParam]>,
  'fetch_workflow_data' : ActorMethod<[string], string>,
  'gen_ai_node_router' : ActorMethod<[], [] | [ComfyUINode]>,
  'get_voice_data' : ActorMethod<
    [],
    {
        'Ok' : {
          'status' : number,
          'updated_at' : bigint,
          'content' : [] | [string],
          'custom' : [] | [
            Array<
              [
                string,
                { 'Int' : bigint } |
                  { 'Nat' : bigint } |
                  { 'Blob' : Uint8Array | number[] } |
                  { 'Text' : string },
              ]
            >
          ],
          'created_at' : bigint,
          'principal_id' : Principal,
          'folder_id' : number,
          'file_id' : number,
        }
      } |
      { 'Err' : string }
  >,
  'greet' : ActorMethod<[string], string>,
  'push_workload_record' : ActorMethod<[ComfyUIPayload], WorkLoadReceipt>,
  'query_comfy_nodes' : ActorMethod<[], [] | [Array<ComfyUINode>]>,
  'query_curr_workload' : ActorMethod<[], [] | [Array<WorkLoadLedgerItem>]>,
  'query_wait_identity_workflows' : ActorMethod<[], Array<string>>,
  'query_wait_training_workflows' : ActorMethod<[], Array<string>>,
  'query_workflow_ledger_by_principal_id' : ActorMethod<
    [string],
    { 'Ok' : Array<WorkflowLedgerItem> } |
      { 'Err' : string }
  >,
  'reg_comfy_nodes' : ActorMethod<
    [Array<ComfyUINode>],
    [] | [Array<ComfyUINode>]
  >,
  'set_oss_bucket_canister' : ActorMethod<[Principal], undefined>,
  'store_uploader_pow_contract' : ActorMethod<
    [UploaderPowContractInput],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'store_workflow_data' : ActorMethod<
    [string, string],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'subscribe' : ActorMethod<[Subscriber], undefined>,
  'update_minting_contract' : ActorMethod<
    [WorkLoadInitParam],
    [] | [WorkLoadInitParam]
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
