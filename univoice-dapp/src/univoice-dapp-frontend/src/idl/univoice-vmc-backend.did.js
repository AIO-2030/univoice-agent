export const idlFactory = ({ IDL }) => {
  const NftUnivoicePricipal = IDL.Record({ 'owners' : IDL.Vec(IDL.Text) });
  const Result = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text });
  const BlockIndex = IDL.Nat;
  const NumTokens = IDL.Nat;
  const MinerWaitClaimBalance = IDL.Record({
    'pricipalid_txt' : IDL.Text,
    'tokens' : NumTokens,
  });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const GetAccountTransactionsArgs = IDL.Record({
    'max_results' : IDL.Nat,
    'start' : IDL.Opt(BlockIndex),
    'account' : Account,
  });
  const Tokens = IDL.Nat;
  const Burn = IDL.Record({
    'from' : Account,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
    'spender' : IDL.Opt(Account),
  });
  const Mint = IDL.Record({
    'to' : Account,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
  });
  const Approve = IDL.Record({
    'fee' : IDL.Opt(IDL.Nat),
    'from' : Account,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
    'expected_allowance' : IDL.Opt(IDL.Nat),
    'expires_at' : IDL.Opt(IDL.Nat64),
    'spender' : Account,
  });
  const Transfer = IDL.Record({
    'to' : Account,
    'fee' : IDL.Opt(IDL.Nat),
    'from' : Account,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat64),
    'amount' : IDL.Nat,
    'spender' : IDL.Opt(Account),
  });
  const Transaction = IDL.Record({
    'burn' : IDL.Opt(Burn),
    'kind' : IDL.Text,
    'mint' : IDL.Opt(Mint),
    'approve' : IDL.Opt(Approve),
    'timestamp' : IDL.Nat64,
    'transfer' : IDL.Opt(Transfer),
  });
  const TransactionWithId = IDL.Record({
    'id' : BlockIndex,
    'transaction' : Transaction,
  });
  const GetTransactions = IDL.Record({
    'balance' : Tokens,
    'transactions' : IDL.Vec(TransactionWithId),
    'oldest_tx_id' : IDL.Opt(BlockIndex),
  });
  const GetTransactionsErr = IDL.Record({ 'message' : IDL.Text });
  const GetTransactionsResult = IDL.Variant({
    'Ok' : GetTransactions,
    'Err' : GetTransactionsErr,
  });
  const MinerTxState = IDL.Variant({
    'Claimed' : IDL.Text,
    'Prepared' : IDL.Text,
  });
  const Timestamp = IDL.Nat64;
  const ComfyUIPayload = IDL.Record({
    'status' : IDL.Text,
    'voice_key' : IDL.Text,
    'gmt_datatime' : Timestamp,
    'app_info' : IDL.Text,
    'ai_node' : IDL.Text,
    'client_id' : IDL.Text,
    'wk_id' : IDL.Text,
    'deduce_asset_key' : IDL.Text,
    'promt_id' : IDL.Text,
  });
  const WorkLoadLedgerItem = IDL.Record({
    'mining_status' : MinerTxState,
    'work_load' : ComfyUIPayload,
    'block_tokens' : NumTokens,
    'nft_pool' : IDL.Text,
    'token_pool' : IDL.Text,
    'wkload_id' : BlockIndex,
  });
  const TxIndex = IDL.Nat;
  const TransferTxState = IDL.Variant({
    'Claimed' : IDL.Null,
    'WaitClaim' : IDL.Null,
  });
  const UnvMinnerLedgerRecord = IDL.Record({
    'block_index' : IDL.Opt(BlockIndex),
    'meta_workload' : WorkLoadLedgerItem,
    'gmt_claim_time' : Timestamp,
    'minner_principalid' : IDL.Text,
    'trans_tx_index' : IDL.Opt(TxIndex),
    'biz_state' : TransferTxState,
    'tokens' : NumTokens,
    'gmt_datetime' : Timestamp,
  });
  const MinerJnlPageniaze = IDL.Record({
    'total_log' : IDL.Nat64,
    'ledgers' : IDL.Vec(UnvMinnerLedgerRecord),
  });
  const MainSiteSummary = IDL.Record({
    'token_pool_balance' : NumTokens,
    'listener_count' : IDL.Nat64,
    'token_per_block' : NumTokens,
    'aigcblock_created_number' : BlockIndex,
  });
  const Event0301008 = IDL.Record({
    'topic' : IDL.Text,
    'payload' : WorkLoadLedgerItem,
  });
  const ChakraItem = IDL.Record({
    'pricipalid_txt' : IDL.Text,
    'cnt1' : IDL.Nat,
    'cnt2' : IDL.Nat,
    'cnt3' : IDL.Nat,
    'cnt4' : IDL.Nat,
    'cnt5' : IDL.Nat,
    'cnt6' : IDL.Nat,
    'cnt7' : IDL.Nat,
  });
  const UserIdentityInfo = IDL.Record({
    'user_nick' : IDL.Text,
    'user_id' : IDL.Text,
    'principalid_txt' : IDL.Text,
  });
  const TransferArgs = IDL.Record({
    'to_account' : Account,
    'amount' : IDL.Nat,
  });
  return IDL.Service({
    'call_unvoice_for_ext_nft' : IDL.Func([NftUnivoicePricipal], [Result], []),
    'claim_to_account_by_principal' : IDL.Func([IDL.Text], [Result], []),
    'claim_to_account_from_index' : IDL.Func([BlockIndex], [Result], []),
    'gener_nft_owner_wait_claims' : IDL.Func(
        [IDL.Text],
        [MinerWaitClaimBalance],
        ['query'],
      ),
    'get_account_transactions' : IDL.Func(
        [GetAccountTransactionsArgs],
        [GetTransactionsResult],
        [],
      ),
    'get_all_miner_jnl' : IDL.Func(
        [],
        [IDL.Opt(IDL.Vec(UnvMinnerLedgerRecord))],
        ['query'],
      ),
    'get_all_miner_jnl_with_principalid' : IDL.Func(
        [IDL.Text, IDL.Nat64, IDL.Nat64],
        [MinerJnlPageniaze],
        ['query'],
      ),
    'get_main_site_summary' : IDL.Func([], [MainSiteSummary], []),
    'get_miner_license' : IDL.Func([IDL.Text], [IDL.Vec(IDL.Nat)], []),
    'get_total_listener' : IDL.Func([], [IDL.Opt(IDL.Nat64)], ['query']),
    'get_user_balance' : IDL.Func([IDL.Principal], [Result], []),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'publish_0301008' : IDL.Func([Event0301008], [Result], []),
    'query_chakra_data' : IDL.Func([IDL.Text], [ChakraItem], ['query']),
    'query_poll_balance' : IDL.Func([], [Result], []),
    'setup_subscribe' : IDL.Func([IDL.Principal, IDL.Text], [], []),
    'sum_claimed_mint_ledger' : IDL.Func([IDL.Text], [NumTokens], []),
    'sum_unclaimed_mint_ledger_onceday' : IDL.Func(
        [IDL.Text],
        [IDL.Nat],
        ['query'],
      ),
    'sync_userinfo_identity' : IDL.Func(
        [IDL.Vec(UserIdentityInfo)],
        [Result],
        [],
      ),
    'transfer' : IDL.Func([TransferArgs], [Result], []),
    'update_chakra' : IDL.Func([ChakraItem], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
