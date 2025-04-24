dfx stop
cd icrc_nft.mo
dfx start --background --clean
dfx stop
cd ..

set -e
dfx start --background --clean
dfx identity use univoicerun

dfx deploy  univoice-vmc-backend 
dfx deploy  univoice-vmc-frontend 

##Can't build on top dir on replica network
export UNIVOICE_VMC_BACKEND_ID=$(dfx canister id univoice-vmc-backend)

echo "========  MUGC-AGC  ========" 
dfx deploy mugc-agc-backend
dfx deploy mugc-agc-frontend


echo "===========SETUP tokens========="
#dfx start --background
dfx identity use minter
MINT_ACCOUNT=$(dfx identity get-principal)
dfx identity use univoicerun
GOV_ACCOUNT=$(dfx identity get-principal)
ADMIN_PRINCIPAL=$(dfx identity get-principal)


MINER_ACCOUNT="jzpwm-zsjcq-ugkzp-nr7au-bydmm-c7rqk-tzp2r-gtode-fws2v-ehkfl-cqe"




echo "===========Prepared Univoice Tokens===================="
dfx deploy voice_ledger_canister --argument "(variant {
  Init = record {
    token_symbol = \"UVC\";
    token_name = \"UNIVOICE\";
    minting_account = record {
      owner = principal \"$MINT_ACCOUNT\"
    };
    transfer_fee = 20;
    metadata = vec {
       record {
            \"icrc1:logo\";
             variant {
                  Text = \"data:image/png;base64,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\"
             };
       };
    };
    initial_balances = vec {
      record {
        record {
          owner = principal \"$GOV_ACCOUNT\";
        };
        210_000_000_000_000_000;
      };
    };
    archive_options = record {
      num_blocks_to_archive = 1000;
      trigger_threshold = 2000;
      controller_id = principal \"$GOV_ACCOUNT\";
    };
    feature_flags = opt record {
      icrc2 = true;
    };
  }
})"

export ICRC1_CANISTER_ID=$(dfx canister id voice_ledger_canister)

dfx deploy voice_index_canister --argument "(opt variant { Init = record { ledger_id = principal \"$ICRC1_CANISTER_ID\"} })"

echo "===========balance of GOV_ACCOUNT========="
dfx canister call voice_ledger_canister icrc1_balance_of "(record {
  owner = principal \"$GOV_ACCOUNT\";
})"

echo "===========SETUP DONE========="





# approve the token_transfer_from_backend canister to spend 100 tokens
echo "===========icrc2_approve========="

dfx canister call  voice_ledger_canister icrc2_approve "(
  record {
    spender= record {
      owner = principal \"$UNIVOICE_VMC_BACKEND_ID\";
   };
    amount = 1_365_000_000_000_000: nat;
  }
)"
echo "===========icrc2_approve_end========="

echo "===========balance approve==========="

dfx canister call voice_ledger_canister icrc1_balance_of "(record {
  owner = principal \"$UNIVOICE_VMC_BACKEND_ID\"
})"

echo "==============Mint NFT===================="
./nft-mint.sh

./init-env.sh




echo "========update contract======"
dfx canister call mugc-agc-backend update_minting_contract "(
   record {
      poll_account=\"6nimk-xpves-34bk3-zf7dp-nykqv-h3ady-iu3ze-xplot-vm4uy-ptbel-3qe\";
      nft_collection_id=\"br5f7-7uaaa-aaaaa-qaaca-cai\";
      token_block=2_625_000
   }
)"

dfx canister call univoice-vmc-backend query_poll_balance






#echo "==============TOKEN TRANSFER=================="

#dfx canister call  univoice-vmc-backend transfer "(record {
#   amount = 6_500_000_000;
#   to_account = record {
#  owner = principal \"$ADMIN_PRINCIPAL\";  };
#})"


export MUGC_ID=$(dfx canister id mugc-agc-backend)

echo "=========subscribe=================="
dfx canister call univoice-vmc-backend setup_subscribe "(
     principal \"by6od-j4aaa-aaaaa-qaadq-cai\",
     \"0301008\"
)"

#echo "=========record_work_load========"
# dfx canister call mugc-agc-backend push_workload_record "(
#     record {
#       promt_id = \"086daeb4-3795-486a-8d20-725866f4ded9\";
#       client_id = \"1982027079\";
#       ai_node = \"http://127.0.0.1:8188/prompt\";
#      app_info = \"muse_talk\";
#       wk_id = \"univoice-wk-local.json\";
#       voice_key = \"2f4018e2-ed5e-4821-97ba-4873b431586f/tmp/tmprh7jbr_7.wav\";
#       deduce_asset_key = \"AIGC_output_video_final_00116.mp4\";
#       status = \"executed\" ;
#       gmt_datatime=1731837234   
#     })"


#echo "==========query_curr_workload======="
#dfx canister call mugc-agc-backend query_curr_workload

echo "===========icrc2_claim_query ========="
dfx canister call univoice-vmc-backend get_all_miner_jnl



#echo "===========icrc2_claim ... ========="

#echo "============balance-admin ========="
#dfx canister call icrc1_ledger_canister icrc1_balance_of "(record {
#  owner = principal \"$ADMIN_PRINCIPAL\";
#})"
#echo "============canister balance before====================="
#dfx canister call icrc1_ledger_canister icrc1_balance_of "(record {
#  owner = principal \"$(dfx canister id univoice-vmc-backend)\"
#})"

# echo "============ claim index {1} {2}"
# dfx canister call  univoice-vmc-backend claim_to_account_from_index "(1)"

# dfx canister call  univoice-vmc-backend claim_to_account_from_index "(2)"

# dfx canister call  univoice-vmc-backend claim_to_account_from_index "(3)"

# dfx canister call  univoice-vmc-backend claim_to_account_from_index "(4)"

# dfx canister call  univoice-vmc-backend claim_to_account_from_index "(5)"



echo "============balance-end ========="
dfx canister call voice_ledger_canister icrc1_balance_of "(record {
  owner = principal \"$ADMIN_PRINCIPAL\";
})"
echo "============pool balance====================="
dfx canister call voice_ledger_canister icrc1_balance_of "(record {
  owner = principal \"$(dfx canister id univoice-vmc-backend)\"
})"


echo "===========icrc2_claim_query after claimed ========="
dfx canister call univoice-vmc-backend get_all_miner_jnl

dfx canister call univoice-vmc-backend get_all_miner_jnl_with_principalid "(\"jzpwm-zsjcq-ugkzp-nr7au-bydmm-c7rqk-tzp2r-gtode-fws2v-ehkfl-cqe\",0,5)"








