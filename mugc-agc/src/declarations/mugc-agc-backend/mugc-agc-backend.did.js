export const idlFactory = ({ IDL }) => {
  const UploaderPowContract = IDL.Record({
    'workflow_id' : IDL.Text,
    'sample_output' : IDL.Vec(IDL.Nat32),
    'identity_gusserr_limit' : IDL.Float64,
  });
  const WorkLoadInitParam = IDL.Record({
    'token_block' : IDL.Nat,
    'poll_account' : IDL.Text,
    'nft_collection_id' : IDL.Text,
  });
  const ComfyUINode = IDL.Record({
    'weight' : IDL.Int,
    'ws_url' : IDL.Text,
    'node_id' : IDL.Opt(IDL.Nat),
    'ori_url' : IDL.Text,
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
  const MinerTxState = IDL.Variant({
    'Claimed' : IDL.Text,
    'Prepared' : IDL.Text,
  });
  const NumTokens = IDL.Nat;
  const BlockIndex = IDL.Nat;
  const WorkLoadLedgerItem = IDL.Record({
    'mining_status' : MinerTxState,
    'work_load' : ComfyUIPayload,
    'block_tokens' : NumTokens,
    'nft_pool' : IDL.Text,
    'token_pool' : IDL.Text,
    'wkload_id' : BlockIndex,
  });
  const MixComfyErr = IDL.Variant({
    'RuntimeErr' : IDL.Text,
    'NoneNodeVaild' : IDL.Text,
  });
  const WorkLoadReceipt = IDL.Variant({
    'Ok' : WorkLoadLedgerItem,
    'Err' : MixComfyErr,
  });
  const WorkflowLedgerStatus = IDL.Variant({
    'IDENTITY_SUCCESS' : IDL.Null,
    'IDENTITY_FAIL' : IDL.Null,
    'WAIT_IDENTITY' : IDL.Null,
    'WAIT_CLAIM' : IDL.Null,
  });
  const WorkflowLedgerItem = IDL.Record({
    'status' : WorkflowLedgerStatus,
    'workflow_id' : IDL.Text,
    'token_reward' : NumTokens,
    'timestamp' : Timestamp,
    'principal_id' : IDL.Text,
    'client_id' : IDL.Text,
    'identity_timestamp' : Timestamp,
  });
  const UploaderPowContractInput = IDL.Record({
    'workflow_id' : IDL.Text,
    'sample_output' : IDL.Text,
    'identity_gusserr_limit' : IDL.Float64,
  });
  const Subscriber = IDL.Record({ 'topic' : IDL.Text });
  return IDL.Service({
    'export_all_uploader_pow_contracts' : IDL.Func(
        [],
        [IDL.Vec(UploaderPowContract)],
        ['query'],
      ),
    'export_minting_contract' : IDL.Func([], [IDL.Opt(WorkLoadInitParam)], []),
    'fetch_workflow_data' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'gen_ai_node_router' : IDL.Func([], [IDL.Opt(ComfyUINode)], []),
    'get_voice_data' : IDL.Func(
        [],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'status' : IDL.Int8,
              'updated_at' : IDL.Nat64,
              'content' : IDL.Opt(IDL.Text),
              'custom' : IDL.Opt(
                IDL.Vec(
                  IDL.Tuple(
                    IDL.Text,
                    IDL.Variant({
                      'Int' : IDL.Int64,
                      'Nat' : IDL.Nat64,
                      'Blob' : IDL.Vec(IDL.Nat8),
                      'Text' : IDL.Text,
                    }),
                  )
                )
              ),
              'created_at' : IDL.Nat64,
              'principal_id' : IDL.Principal,
              'folder_id' : IDL.Nat32,
              'file_id' : IDL.Nat32,
            }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'push_workload_record' : IDL.Func([ComfyUIPayload], [WorkLoadReceipt], []),
    'query_comfy_nodes' : IDL.Func([], [IDL.Opt(IDL.Vec(ComfyUINode))], []),
    'query_curr_workload' : IDL.Func(
        [],
        [IDL.Opt(IDL.Vec(WorkLoadLedgerItem))],
        [],
      ),
    'query_wait_identity_workflows' : IDL.Func(
        [],
        [IDL.Vec(IDL.Text)],
        ['query'],
      ),
    'query_wait_training_workflows' : IDL.Func(
        [],
        [IDL.Vec(IDL.Text)],
        ['query'],
      ),
    'query_workflow_ledger_by_principal_id' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Vec(WorkflowLedgerItem), 'Err' : IDL.Text })],
        ['query'],
      ),
    'reg_comfy_nodes' : IDL.Func(
        [IDL.Vec(ComfyUINode)],
        [IDL.Opt(IDL.Vec(ComfyUINode))],
        [],
      ),
    'set_oss_bucket_canister' : IDL.Func([IDL.Principal], [], []),
    'store_uploader_pow_contract' : IDL.Func(
        [UploaderPowContractInput],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'store_workflow_data' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'subscribe' : IDL.Func([Subscriber], [], []),
    'update_minting_contract' : IDL.Func(
        [WorkLoadInitParam],
        [IDL.Opt(WorkLoadInitParam)],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
