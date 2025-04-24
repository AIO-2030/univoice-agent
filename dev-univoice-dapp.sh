#!/bin/bash
set -e
dfx stop
dfx start --background --clean
GOV_IDENTITY=$(dfx identity get-principal)
echo "=========ic_oss========="
dfx deploy ic_oss_bucket --argument "(opt variant {Init =
  record {
    name = \"Univoice Labs\";
    file_id = 0;
    max_file_size = 2048;
    max_folder_depth = 10;
    max_children = 1000;
    visibility = 0;
    max_custom_data_size = 4096;
    enable_hash_index = false;
  }
})"

dfx deploy ic_oss_cluster --argument "(variant {Init =
  record {
    name = \"Univoice\";
    ecdsa_key_name = \"dfx_test_key\";
    schnorr_key_name = \"dfx_test_key\";
    token_expiration = 86400;
    bucket_topup_threshold = 1_000_000_000_000;
    bucket_topup_amount = 5_000_000_000_000;
    governance_canister = null;
  }
})"
#'key_1' for mainet

# Get cluster info
dfx canister call ic_oss_cluster get_cluster_info '()'
# dfx canister call ic_oss_cluster admin_weak_access_token '(
#   record {
#     subject = principal "4zrxi-26rv2-nspv2-vqmus-ouosp-uuvf4-nxrl3-pfoyg-rn33w-pzv3r-dqe";
#     audience = principal "be2us-64aaa-aaaaa-qaabq-cai";
#     policies = "Folder.Read:0 Folder.Write:0";
#   },
#   1672483200,
#   1672569600
# )'
dfx canister call ic_oss_bucket create_folder '(
  record {
    parent = 0;
    name = "0";
  },
  null
)'


./minttokendev.sh
dfx deploy univoice-vmc-backend
dfx deploy univoice-dapp-frontend

DAPP_CANID=${dfx canister id univoice-dapp-backend} 
dfx canister update-settings ic_oss_cluster --add-controller $GOV_IDENTITY
