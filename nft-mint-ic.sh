cd icrc_nft.mo
dfx stop
set -e
echo "===========SETUP tokens========="
dfx start --background --clean


echo  "========DEPLOY NFT=========="



dfx identity use univoicerun
export ADMIN_PRINCIPAL=$(dfx identity get-principal)

echo "========deplying=========="
dfx deploy univoice-listener --argument 'record {icrc7_args = null; icrc37_args =null; icrc3_args =null;}' --network=ic --with-cycles 2500000000000

export ICRC7_CANISTER=$(dfx canister id univoice-listener)
echo $ICRC7_CANISTER

dfx canister call univoice-listener init --network=ic


dfx canister call univoice-listener icrcX_mint --argument-file '../nftscript.did' --network=ic


#All tokens should be owned by the canister
echo "All tokens should be owned by the canister"
dfx canister call univoice-listener icrc7_tokens_of "(record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;},null,null)" --network=ic

#Should be approved to transfer
echo "Should be approved to transfer"
dfx canister call univoice-listener icrc37_is_approved "(vec{record { spender=record {owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null;}; from_subaccount=null; token_id=0;}})" --network=ic --query


#Check that the owner is spender
echo "Check that the owner is spender"
dfx canister call univoice-listener icrc37_get_collection_approvals "(record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;},null, null)" --query --network=ic

cd ..


dfx canister call univoice-listener icrc37_transfer_from "(vec{record { 
  spender = principal \"6nimk-xpves-34bk3-zf7dp-nykqv-h3ady-iu3ze-xplot-vm4uy-ptbel-3qe\";
  from = record { owner = principal \"3blo3-qqaaa-aaaam-ad3ea-cai\"; subaccount = null}; 
  to = record { owner = principal \"cqsbf-m7dcy-ukhwe-4alqz-syoco-zcdc2-la5gc-xrmwo-xvde2-ghom3-wae\"; subaccount = null};
  token_id =  28 : nat;
  memo = null;
  created_at_time = null;}})" --ic

  dfx canister call univoice-listener icrc37_transfer_from "(vec{record { 
  spender = principal \"6nimk-xpves-34bk3-zf7dp-nykqv-h3ady-iu3ze-xplot-vm4uy-ptbel-3qe\";
  from = record { owner = principal \"3blo3-qqaaa-aaaam-ad3ea-cai\"; subaccount = null}; 
  to = record { owner = principal \"am373-r6c3b-og2v3-l3u7b-bvpfd-t52ni-duu3q-gnx7u-vlx53-olbcw-xae\"; subaccount = null};
  token_id =  3 : nat;
  memo = null;
  created_at_time = null;}})" --ic
