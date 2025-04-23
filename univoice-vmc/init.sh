#dfx stop
#set -e
#trap 'dfx stop' EXIT
echo "===========SETUP tokens========="
#dfx start --background --clean


#echo "==========prepare NFT================"
#installing
#npm i -g ic-mops
#vessel
#wget https://github.com/dfinity/vessel/releases/download/v0.6.4/vessel-macos
set -ex

#dfx stop
#dfx start --clean --background
dfx identity use univoicerun

echo "===========Prepared Univoice Tokens===================="

dfx deploy icrc1_ledger_canister --argument "(variant {
  Init = record {
    token_symbol = \"UNIVOICE\";
    token_name = \"L-UNIVOICE\";
    minting_account = record {
      owner = principal \"$(dfx identity --identity anonymous get-principal)\"
    };
    transfer_fee = 10_000;
    metadata = vec {};
    initial_balances = vec {
      record {
        record {
          owner = principal \"$(dfx identity --identity default get-principal)\";
        };
        10_000_000_000;
      };
    };
    archive_options = record {
      num_blocks_to_archive = 1000;
      trigger_threshold = 2000;
      controller_id = principal \"$(dfx identity --identity anonymous get-principal)\";
    };
    feature_flags = opt record {
      icrc2 = true;
    };
  }
})"

dfx deploy icrc1_index_canister --argument '(opt variant { Init = record { ledger_id = principal "mxzaz-hqaaa-aaaar-qaada-cai"} })'

dfx canister call icrc1_ledger_canister icrc1_balance_of "(record {
  owner = principal \"$(dfx identity --identity default get-principal)\";
})"
echo "===========SETUP DONE========="
dfx deploy  univoice-vmc-backend 
dfx deploy  univoice-vmc-frontend 

dfx canister call icrc1_ledger_canister icrc1_balance_of "(record {
  owner = principal \"$(dfx identity --identity default get-principal)\";
})"
# approve the token_transfer_from_backend canister to spend 100 tokens
echo "===========icrc2_approve========="

dfx canister call --identity default icrc1_ledger_canister icrc2_approve "(
  record {
    spender= record {
      owner = principal \"$(dfx canister id univoice-vmc-backend)\";
    };
    amount = 10_000_000_000: nat;
  }
)"
echo "===========icrc2_approve_end========="


dfx canister call --identity default univoice-vmc-backend transfer "(record {
  amount = 100_000_000;
  to_account = record {
   owner = principal \"$(dfx canister id univoice-vmc-backend)\";  };
})"

echo "===========query balance========"

dfx canister call icrc1_ledger_canister icrc1_balance_of "(record {
  owner = principal \"$(dfx canister id univoice-vmc-backend)\";
})"

echo "===========query balance inner========"
dfx canister call univoice-vmc-backend query_poll_balance

