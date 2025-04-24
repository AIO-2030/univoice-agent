#!/bin/bash
set -e
dfx stop
dfx start --background --clean
dfx identity use univoicerun

UNIVOICERUN_PRINCIPAL=$(dfx identity get-principal)
echo "Univoicerun principal: $UNIVOICERUN_PRINCIPAL"

dfx deploy univoice-dapp-backend
dfx deploy univoice-dapp-frontend
dfx deploy univoice-vmc-backend
dfx deploy univoice-vmc-frontend
dfx deploy mugc-agc-backend
dfx deploy mugc-agc-frontend


# Get frontend canister ID
FRONTEND_CANID=$(dfx canister id univoice-dapp-frontend)
echo "Setting frontend canister ID in backend: $FRONTEND_CANID"
dfx canister call univoice-dapp-backend set_frontend_canister "(\"$FRONTEND_CANID\")"


echo "Deploying ic_oss_bucket"
dfx deploy ic_oss_bucket --argument "(opt variant {Init =
  record {
    name = \"Univoice Labs\";
    file_id = 0;
    max_file_size = 1024000;
    max_folder_depth = 10;
    max_children = 1000;
    visibility = 0;
    max_custom_data_size = 4096;
    enable_hash_index = false;
  }
})"

# Get bulklet canister ID
BULKLET_CANID=$(dfx canister id ic_oss_bucket)
echo "Setting bulklet canister ID in backend: $BULKLET_CANID"
dfx canister call univoice-dapp-backend set_bucket_canister "(\"$BULKLET_CANID\")"

echo "Getting bucket info"
dfx canister call ic_oss_bucket get_bucket_info '(null)'


echo "Deploying ic_oss_cluster"
dfx deploy ic_oss_cluster --argument "(opt variant {Init =
  record {
    name = \"Univoice Labs\";
    ecdsa_key_name = \"dfx_test_key\";
    schnorr_key_name = \"dfx_test_key\";
    token_expiration = 3600;
    bucket_topup_threshold = 1_000_000_000_000;
    bucket_topup_amount = 5_000_000_000_000;
  }
})"

# Get cluster canister ID
CLUSTER_CANID=$(dfx canister id ic_oss_cluster)
echo "Setting cluster canister ID in backend: $CLUSTER_CANID"
dfx canister call univoice-dapp-backend set_cluster_canister "(\"$CLUSTER_CANID\")"


echo "Adding univoicerun as a manager to ic_oss_cluster"
dfx canister call ic_oss_cluster admin_add_managers "(vec {principal \"$UNIVOICERUN_PRINCIPAL\";principal \"pxfqr-x3orr-z5yip-7yzdd-hyxgd-dktgh-3awsk-ohzma-lfjzi-753j7-tae\"})"

dfx canister call ic_oss_bucket admin_add_managers "(vec {principal \"$UNIVOICERUN_PRINCIPAL\";principal \"pxfqr-x3orr-z5yip-7yzdd-hyxgd-dktgh-3awsk-ohzma-lfjzi-753j7-tae\"})"

echo "Generating weak access token for univoicerun"
NOW_SEC=$(date +%s)
# Calculate expiry time (24 hours from now)
EXPIRY_SEC=$((NOW_SEC + 86400))
dfx canister call ic_oss_cluster admin_weak_access_token "(
  record {
    subject = principal \"${UNIVOICERUN_PRINCIPAL}\";
    audience = principal \"mmrxu-fqaaa-aaaap-ahhna-cai\";
    policies = \"Folder.Read:0 Folder.Write:0\";
  },
  ${NOW_SEC},
  ${EXPIRY_SEC}
)"

echo "Adding univoice-dapp-backend as a controller to ic_oss_cluster"
DAPP_CANID=$(dfx canister id univoice-dapp-backend) 
dfx canister update-settings ic_oss_cluster --add-controller "$DAPP_CANID"

# echo "Generating ed25519 access token for univoicerun"
# dfx canister call ic_oss_cluster admin_ed25519_access_token "(record {
#   subject = principal \"${UNIVOICERUN_PRINCIPAL}\";
#   audience = principal \"mmrxu-fqaaa-aaaap-ahhna-cai\";
#   policies = \"Folder.*:1 Bucket.Read.*\";
# })"

echo "Getting cluster info"
dfx canister call ic_oss_cluster get_cluster_info '()'

echo "Creating root folder in ic_oss_bucket"
dfx canister call ic_oss_bucket create_folder '(
  record {
    parent = 0;
    name = "0";
  },
  null
)'

# List contents
dfx canister call ic_oss_bucket list_files '(0, null, null, null)'    # Files
dfx canister call ic_oss_bucket list_folders '(0, null, null, null)'  # Folders






