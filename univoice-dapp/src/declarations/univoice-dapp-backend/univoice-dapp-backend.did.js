export const idlFactory = ({ IDL }) => {
  const CustomInfo = IDL.Record({
    'dapp_principal' : IDL.Text,
    'is_invite_code_filled' : IDL.Bool,
    'total_rewards' : IDL.Nat64,
    'logo' : IDL.Text,
    'invite_code' : IDL.Text,
    'wallet_principal' : IDL.Text,
    'used_invite_code' : IDL.Opt(IDL.Text),
    'nick_name' : IDL.Text,
  });
  const PolicyResult = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const BatchInfoItem = IDL.Record({ 'key' : IDL.Text, 'content' : IDL.Text });
  const CommonInfoCfg = IDL.Record({
    'key' : IDL.Text,
    'content' : IDL.Text,
    'isvalid' : IDL.Bool,
    'version' : IDL.Text,
  });
  const UserLicenseRecord = IDL.Record({
    'token_id' : IDL.Nat,
    'owner' : IDL.Text,
    'nft_collection_id' : IDL.Text,
    'purchase_time' : IDL.Nat64,
    'license_name' : IDL.Text,
    'expired_at' : IDL.Opt(IDL.Nat64),
  });
  const NFTCollection = IDL.Record({
    'supply_cap' : IDL.Opt(IDL.Nat),
    'owner' : IDL.Principal,
    'allowed_transfers' : IDL.Bool,
    'logo' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'expired_at' : IDL.Opt(IDL.Nat64),
    'total_supply' : IDL.Nat,
    'symbol' : IDL.Text,
  });
  const LicenseFetchResult = IDL.Variant({
    'Ok' : IDL.Tuple(IDL.Vec(UserLicenseRecord), NFTCollection),
    'Err' : IDL.Text,
  });
  const CanisterMapping = IDL.Record({
    'key' : IDL.Text,
    'canister_id' : IDL.Text,
  });
  const InvitedUser = IDL.Record({
    'dapp_principal' : IDL.Text,
    'logo' : IDL.Text,
    'reward_amount' : IDL.Nat64,
    'wallet_principal' : IDL.Text,
    'nick_name' : IDL.Text,
  });
  const InvitedUserResponse = IDL.Record({
    'users' : IDL.Vec(InvitedUser),
    'total_invited' : IDL.Nat64,
  });
  const UserNFTsRequest = IDL.Record({
    'user' : IDL.Text,
    'license_ids' : IDL.Vec(IDL.Text),
  });
  const UserNFTHolding = IDL.Record({
    'nft_colletion_id' : IDL.Text,
    'owner' : IDL.Principal,
    'token_ids' : IDL.Vec(IDL.Nat),
    'expired_at' : IDL.Opt(IDL.Nat64),
  });
  const UserNFTsResponse = IDL.Record({ 'holdings' : IDL.Vec(UserNFTHolding) });
  const InviteRewardRecord = IDL.Record({
    'id' : IDL.Text,
    'claimed_at' : IDL.Opt(IDL.Nat64),
    'token_amount' : IDL.Nat,
    'is_claimed' : IDL.Bool,
    'invite_code' : IDL.Text,
    'created_at' : IDL.Nat64,
    'new_user' : IDL.Text,
    'code_owner' : IDL.Text,
  });
  const TaskData = IDL.Record({
    'status' : IDL.Text,
    'task_id' : IDL.Text,
    'task_url' : IDL.Text,
    'rewards' : IDL.Nat64,
  });
  const MetadataValue = IDL.Variant({
    'Int' : IDL.Int64,
    'Nat' : IDL.Nat64,
    'Blob' : IDL.Vec(IDL.Nat8),
    'Text' : IDL.Text,
  });
  const VoiceAssetData = IDL.Record({
    'status' : IDL.Int32,
    'updated_at' : IDL.Opt(IDL.Nat64),
    'custom' : IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, MetadataValue))),
    'created_at' : IDL.Nat64,
    'principal_id' : IDL.Principal,
    'folder_id' : IDL.Nat32,
    'file_id' : IDL.Nat32,
  });
  const VoiceOssInfo = IDL.Record({
    'status' : IDL.Int32,
    'updated_at' : IDL.Opt(IDL.Nat64),
    'custom' : IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, MetadataValue))),
    'created_at' : IDL.Nat64,
    'file_id' : IDL.Nat32,
  });
  return IDL.Service({
    'add_canister_mapping' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'add_custom_info' : IDL.Func(
        [CustomInfo],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'add_info_item' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'attach_policies' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [PolicyResult],
        [],
      ),
    'batch_add_info_items' : IDL.Func(
        [IDL.Vec(BatchInfoItem)],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'batch_get_info' : IDL.Func(
        [IDL.Vec(IDL.Text)],
        [IDL.Vec(IDL.Opt(CommonInfoCfg))],
        ['query'],
      ),
    'buy_nft_license' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat64],
        [LicenseFetchResult],
        [],
      ),
    'claim_reward' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Nat64],
        [IDL.Bool],
        [],
      ),
    'claim_tokens' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text })],
        [],
      ),
    'delete_voice_file' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'detach_policies' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [PolicyResult],
        [],
      ),
    'get_access_token' : IDL.Func(
        [IDL.Text],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'access_token' : IDL.Text,
              'folder' : IDL.Text,
            }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'get_all_canister_mappings' : IDL.Func(
        [],
        [IDL.Vec(CanisterMapping)],
        ['query'],
      ),
    'get_bucket_canister' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'get_canister_id' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'get_cluster_canister' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'get_custom_info' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [IDL.Opt(CustomInfo)],
        ['query'],
      ),
    'get_friend_infos' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(IDL.Tuple(CustomInfo, IDL.Nat))],
        ['query'],
      ),
    'get_frontend_canister' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'get_info_by_key' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(CommonInfoCfg)],
        ['query'],
      ),
    'get_invited_users' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text)],
        [InvitedUserResponse],
        ['query'],
      ),
    'get_mugc_canister' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'get_nft_collection' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : NFTCollection, 'Err' : IDL.Text })],
        [],
      ),
    'get_unclaimed_rewards' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'get_user_nfts' : IDL.Func(
        [UserNFTsRequest],
        [IDL.Variant({ 'Ok' : UserNFTsResponse, 'Err' : IDL.Text })],
        [],
      ),
    'get_user_rewards' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(InviteRewardRecord)],
        ['query'],
      ),
    'get_user_tasks' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Vec(TaskData))], []),
    'get_vmc_canister' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'get_voice_file' : IDL.Func(
        [IDL.Nat64],
        [IDL.Opt(VoiceAssetData)],
        ['query'],
      ),
    'initialize_default_canisters' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'list_custom_info' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(CustomInfo)],
        ['query'],
      ),
    'list_voice_files' : IDL.Func(
        [
          IDL.Opt(IDL.Principal),
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Nat32),
          IDL.Opt(IDL.Nat32),
        ],
        [IDL.Vec(VoiceOssInfo)],
        ['query'],
      ),
    'set_bucket_canister' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'set_cluster_canister' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'set_frontend_canister' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'set_mugc_canister' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'set_vmc_canister' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'transfer_tokens_to_user' : IDL.Func(
        [IDL.Text, IDL.Nat],
        [IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text })],
        [],
      ),
    'update_custom_info' : IDL.Func(
        [IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'update_info_item' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'update_task_status' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'upload_voice_file' : IDL.Func(
        [
          IDL.Principal,
          IDL.Text,
          IDL.Text,
          IDL.Vec(IDL.Nat8),
          IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
        ],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'use_invite_code' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : InviteRewardRecord, 'Err' : IDL.Text })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
