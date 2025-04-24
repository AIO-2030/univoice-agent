
dfx identity use minter
MINT_ACCOUNT=$(dfx identity get-principal)
dfx identity use univoicerun
GOV_ACCOUNT=$(dfx identity get-principal)

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
})" --with-cycles 4000000000000 --no-wallet  --network=ic



echo "===========balance of GOV_ACCOUNT========="

dfx canister call voice_ledger_canister icrc1_balance_of "(record {
  owner = principal \"$GOV_ACCOUNT\";
})" --network=ic

dfx canister call voice_ledger_canister icrc1_balance_of "(record {
  owner = principal \"6nimk-xpves-34bk3-zf7dp-nykqv-h3ady-iu3ze-xplot-vm4uy-ptbel-3qe\";
})" --network=ic

dfx canister call voice_ledger_canister icrc1_transfer "(record {to=record {owner=principal \"mgj5y-hwmdo-g3hoj-lc7pi-qdcmc-6ik2q-hb7qb-nwy35-2kpkp-wwp4h-4ae\"; subaccount=null}; fee=null; memo=null; from_subaccount=null; created_at_time=null; amount=1})" --network=ic


#dfx deploy voice_index_canister --argument '(opt variant { Init = record { ledger_id = principal "jfqe5-daaaa-aaaai-aqwvq-cai"} })' --with-cycles 2000000000000  --network=ic


dfx canister call voice_ledger_canister icrc1_balance_of "(record {
  owner = principal \"jm2jf-hdewh-kh2y4-h742s-tpuys-z7gmu-newhk-s2ss6-eedfj-kqnp5-cae\";
})" --network=ic