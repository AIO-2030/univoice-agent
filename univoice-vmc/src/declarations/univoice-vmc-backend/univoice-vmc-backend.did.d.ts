import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface Approve {
  'fee' : [] | [bigint],
  'from' : Account,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
  'expected_allowance' : [] | [bigint],
  'expires_at' : [] | [bigint],
  'spender' : Account,
}
export type BlockIndex = bigint;
export interface Burn {
  'from' : Account,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
  'spender' : [] | [Account],
}
export interface ChakraItem {
  'pricipalid_txt' : string,
  'cnt1' : bigint,
  'cnt2' : bigint,
  'cnt3' : bigint,
  'cnt4' : bigint,
  'cnt5' : bigint,
  'cnt6' : bigint,
  'cnt7' : bigint,
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
export interface Event0301008 {
  'topic' : string,
  'payload' : WorkLoadLedgerItem,
}
export interface GetAccountTransactionsArgs {
  'max_results' : bigint,
  'start' : [] | [BlockIndex],
  'account' : Account,
}
export interface GetTransactions {
  'balance' : Tokens,
  'transactions' : Array<TransactionWithId>,
  'oldest_tx_id' : [] | [BlockIndex],
}
export interface GetTransactionsErr { 'message' : string }
export type GetTransactionsResult = { 'Ok' : GetTransactions } |
  { 'Err' : GetTransactionsErr };
export interface MainSiteSummary {
  'token_pool_balance' : NumTokens,
  'listener_count' : bigint,
  'token_per_block' : NumTokens,
  'aigcblock_created_number' : BlockIndex,
}
export interface MinerJnlPageniaze {
  'total_log' : bigint,
  'ledgers' : Array<UnvMinnerLedgerRecord>,
}
export type MinerTxState = { 'Claimed' : string } |
  { 'Prepared' : string };
export interface MinerWaitClaimBalance {
  'pricipalid_txt' : string,
  'tokens' : NumTokens,
}
export interface Mint {
  'to' : Account,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export interface NftUnivoicePricipal { 'owners' : Array<string> }
export type NumTokens = bigint;
export type Result = { 'Ok' : bigint } |
  { 'Err' : string };
export interface Subscriber { 'topic' : string }
export type Timestamp = bigint;
export type Tokens = bigint;
export interface Transaction {
  'burn' : [] | [Burn],
  'kind' : string,
  'mint' : [] | [Mint],
  'approve' : [] | [Approve],
  'timestamp' : bigint,
  'transfer' : [] | [Transfer],
}
export interface TransactionWithId {
  'id' : BlockIndex,
  'transaction' : Transaction,
}
export interface Transfer {
  'to' : Account,
  'fee' : [] | [bigint],
  'from' : Account,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
  'spender' : [] | [Account],
}
export interface TransferArgs { 'to_account' : Account, 'amount' : bigint }
export type TransferTxState = { 'Claimed' : null } |
  { 'WaitClaim' : null };
export type TxIndex = bigint;
export interface UnvMinnerLedgerRecord {
  'block_index' : [] | [BlockIndex],
  'meta_workload' : WorkLoadLedgerItem,
  'gmt_claim_time' : Timestamp,
  'minner_principalid' : string,
  'trans_tx_index' : [] | [TxIndex],
  'biz_state' : TransferTxState,
  'tokens' : NumTokens,
  'gmt_datetime' : Timestamp,
}
export interface UserIdentityInfo {
  'user_nick' : string,
  'user_id' : string,
  'principalid_txt' : string,
}
export interface WorkLoadLedgerItem {
  'mining_status' : MinerTxState,
  'work_load' : ComfyUIPayload,
  'block_tokens' : NumTokens,
  'nft_pool' : string,
  'token_pool' : string,
  'wkload_id' : BlockIndex,
}
export interface _SERVICE {
  'call_unvoice_for_ext_nft' : ActorMethod<[NftUnivoicePricipal], Result>,
  'claim_to_account_by_principal' : ActorMethod<[string], Result>,
  'claim_to_account_from_index' : ActorMethod<[BlockIndex], Result>,
  'gener_nft_owner_wait_claims' : ActorMethod<[string], MinerWaitClaimBalance>,
  'get_account_transactions' : ActorMethod<
    [GetAccountTransactionsArgs],
    GetTransactionsResult
  >,
  'get_all_miner_jnl' : ActorMethod<[], [] | [Array<UnvMinnerLedgerRecord>]>,
  'get_all_miner_jnl_with_principalid' : ActorMethod<
    [string, bigint, bigint],
    MinerJnlPageniaze
  >,
  'get_main_site_summary' : ActorMethod<[], MainSiteSummary>,
  'get_miner_license' : ActorMethod<[string], Array<bigint>>,
  'get_total_listener' : ActorMethod<[], [] | [bigint]>,
  'get_user_balance' : ActorMethod<[Principal], Result>,
  'greet' : ActorMethod<[string], string>,
  'publish_0301008' : ActorMethod<[Event0301008], Result>,
  'query_chakra_data' : ActorMethod<[string], ChakraItem>,
  'query_poll_balance' : ActorMethod<[], Result>,
  'setup_subscribe' : ActorMethod<[Principal, string], undefined>,
  'sum_claimed_mint_ledger' : ActorMethod<[string], NumTokens>,
  'sum_unclaimed_mint_ledger_onceday' : ActorMethod<[string], bigint>,
  'sync_userinfo_identity' : ActorMethod<[Array<UserIdentityInfo>], Result>,
  'transfer' : ActorMethod<[TransferArgs], Result>,
  'update_chakra' : ActorMethod<[ChakraItem], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
