# approve the token_transfer_from_backend canister to spend 100 tokens
echo "===========icrc2_approve========="

dfx canister call  voice_ledger_canister icrc2_approve "(
  record {
    spender= record {
      owner = principal \"$(dfx canister id univoice-vmc-backend)\";
   };
    amount = 1_365_000_000_000_000: nat;
  }
)"
echo "===========icrc2_approve_end========="

export MUGC_CANISTER=$(dfx canister id mugc-agc-backend)
echo "=========subscribe=================="
echo $MUGC_CANISTER
dfx canister call univoice-vmc-backend setup_subscribe "(
     principal \"$MUGC_CANISTER\",
     \"0301008\"
)"


echo "========update contract======"
dfx canister call mugc-agc-backend update_minting_contract "(
   record {
      poll_account=\"6nimk-xpves-34bk3-zf7dp-nykqv-h3ady-iu3ze-xplot-vm4uy-ptbel-3qe\";
      nft_collection_id=\"br5f7-7uaaa-aaaaa-qaaca-cai\";
      token_block=2_625_000
   }
)"
