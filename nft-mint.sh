cd icrc_nft.mo
#dfx stop
set -e
echo "===========SETUP tokens========="
#dfx start --background --clean


echo  "========DEPLOY NFT=========="

dfx identity use alice
ALICE_PRINCIPAL=$(dfx identity get-principal)

dfx identity use bob
BOB_PRINCIPAL=$(dfx identity get-principal)


dfx identity use univoicerun
ADMIN_PRINCIPAL=$(dfx identity get-principal)

echo "========deplying=========="
dfx deploy univoice-listener --argument 'record {icrc7_args = null; icrc37_args =null; icrc3_args =null;}' --network=local 
#dfx deploy univoice-listener --argument 'record {icrc7_args = null; icrc37_args =null; icrc3_args =null;}' --network=ic --with-cycles 2500000000000 --mode reinstall

ICRC7_CANISTER=$(dfx canister id univoice-listener)
echo $ICRC7_CANISTER

dfx canister call univoice-listener init


dfx canister call univoice-listener icrcX_mint --argument-file '../nftscript.did'


#All tokens should be owned by the canister
echo "All tokens should be owned by the canister"
dfx canister call univoice-listener icrc7_tokens_of "(record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;},null,null)"

#Should be approved to transfer
echo "Should be approved to transfer"
dfx canister call univoice-listener icrc37_is_approved "(vec{record { spender=record {owner = principal \"$ADMIN_PRINCIPAL\"; subaccount = null;}; from_subaccount=null; token_id=0;}})" --query


#Check that the owner is spender
echo "Check that the owner is spender"
dfx canister call univoice-listener icrc37_get_collection_approvals "(record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null;},null, null)" --query

#tranfer from a token to the admin
echo "tranfer from a token to the admin"
dfx canister call univoice-listener icrc37_transfer_from "(vec{record { 
  spender = principal \"$ADMIN_PRINCIPAL\";
  from = record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null}; 
  to = record { owner = principal \"jzpwm-zsjcq-ugkzp-nr7au-bydmm-c7rqk-tzp2r-gtode-fws2v-ehkfl-cqe\"; subaccount = null};
  token_id =  0 : nat;
  memo = null;
  created_at_time = null;}})"

dfx canister call univoice-listener icrc37_transfer_from "(vec{record { 
  spender = principal \"$ADMIN_PRINCIPAL\";
  from = record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null}; 
  to = record { owner = principal \"mavpv-uegot-nsxdf-buehx-6ra72-itrat-tc5ox-m6evr-kqxmy-khd4t-rqe\"; subaccount = null};
  token_id =  2 : nat;
  memo = null;
  created_at_time = null;}})"

dfx canister call univoice-listener icrc37_transfer_from "(vec{record { 
  spender = principal \"$ADMIN_PRINCIPAL\";
  from = record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null}; 
  to = record { owner = principal \"jzpwm-zsjcq-ugkzp-nr7au-bydmm-c7rqk-tzp2r-gtode-fws2v-ehkfl-cqe\"; subaccount = null};
  token_id =  3 : nat;
  memo = null;
  created_at_time = null;}})"
dfx canister call univoice-listener icrc37_transfer_from "(vec{record { 
  spender = principal \"$ADMIN_PRINCIPAL\";
  from = record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null}; 
  to = record { owner = principal \"cqsbf-m7dcy-ukhwe-4alqz-syoco-zcdc2-la5gc-xrmwo-xvde2-ghom3-wae\"; subaccount = null};
  token_id =  4 : nat;
  memo = null;
  created_at_time = null;}})"

dfx canister call univoice-listener icrc37_transfer_from "(vec{record { 
  spender = principal \"$ADMIN_PRINCIPAL\";
  from = record { owner = principal \"$ICRC7_CANISTER\"; subaccount = null}; 
  to = record { owner = principal \"cqsbf-m7dcy-ukhwe-4alqz-syoco-zcdc2-la5gc-xrmwo-xvde2-ghom3-wae\"; subaccount = null};
  token_id =  5 : nat;
  memo = null;
  created_at_time = null;}})"

  # Admin should own two tokens
echo "Admin should own two tokens"

dfx canister call univoice-listener icrc7_tokens_of "(record { owner = principal \"jzpwm-zsjcq-ugkzp-nr7au-bydmm-c7rqk-tzp2r-gtode-fws2v-ehkfl-cqe\"; subaccount = null}, opt 0, opt 50)" --query


echo "List owner of all tokens"
# List owner of all tokens
dfx canister call univoice-listener icrc7_owner_of '(vec {0;1;2;3})' --query

cd ..

#dfx canister call univoice-vmc-backend get_miner_license "(\"jzpwm-zsjcq-ugkzp-nr7au-bydmm-c7rqk-tzp2r-gtode-fws2v-ehkfl-cqe\",null,null)"

#dfx canister call univoice-listener icrc7_tokens "(opt 0, opt 5)"