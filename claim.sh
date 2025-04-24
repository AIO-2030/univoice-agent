dfx identity use alice
ALICE_PRINCIPAL=$(dfx identity get-principal)

dfx identity use univoicerun
ADMIN_PRINCIPAL=$(dfx identity get-principal)

echo "============ claim index {1} {2}"
dfx canister call  univoice-vmc-backend claim_to_account_from_index "(10)"

dfx canister call  univoice-vmc-backend claim_to_account_from_index "(11)"

dfx canister call  univoice-vmc-backend claim_to_account_from_index "(12)"

echo "============balance-end ========="
dfx canister call voice_ledger_canister icrc1_balance_of "(record {
  owner = principal \"$ADMIN_PRINCIPAL\";
})"


echo "===========icrc2_claim_query after claimed ========="
dfx canister call univoice-vmc-backend get_all_miner_jnl

echo "===========icrc2_call balance of miner========="
dfx canister call voice_ledger_canister icrc1_balance_of "(record {
  owner = principal \"$ALICE_PRINCIPAL\";
})"
