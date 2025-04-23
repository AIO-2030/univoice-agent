set -e
dfx stop && dfx start --background --clean
dfx generate mugc-agc-backend
dfx canister create mugc-agc-backend
cargo build --target wasm32-unknown-unknown --release -p mugc-agc-backend --locked
dfx build mugc-agc-backend
dfx canister install mugc-agc-backend
dfx canister call mugc-agc-backend greet "(\"Hello\")"
dfx canister call mugc-agc-backend query_comfy_nodes "()"
dfx canister call mugc-agc-backend reg_comfy_nodes "(vec {record {host=\"198.0.0.1\";url_suffix=\"\";port=\"4000\"}})"
command -v icx-asset