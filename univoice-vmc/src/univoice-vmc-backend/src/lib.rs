mod ledgertype;
mod types;

use candid::types::principal;
use candid::{candid_method, export_service, CandidType, Deserialize, Encode, Nat, Principal};
use ic_cdk::api::call::call;
use ic_cdk::storage;
use ic_cdk_macros::{query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, GrowFailed, StableVec, Storable};
use std::borrow::{Borrow, BorrowMut};
use std::future::IntoFuture;
use std::mem;

use std::ops::{DerefMut, Index};
use std::str::FromStr;
use std::{borrow::Cow, cell::RefCell, result};

use ic_cdk::api::management_canister::http_request::{
    http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse, TransformArgs,
    TransformContext,
};
use ledgertype::{
    ApproveResult, MainSiteSummary, MinerTxState, MinerWaitClaimBalance, Timestamp, 
    TransferArgs, TransferTxState, TxIndex, UnvMinnerLedgerRecord, 
    UnvMinnerLedgerState, WorkLoadLedgerItem,MinerJnlPageniaze,ChakraItem
};
use serde::Serialize;
use serde_json::{self, Value};
use types::{NftUnivoicePricipal, UserIdentityInfo};

use icrc_ledger_types::icrc1::account::{self, Account, Subaccount};
use icrc_ledger_types::icrc1::transfer::{BlockIndex, NumTokens};
use icrc_ledger_types::icrc2::approve::{ApproveArgs, ApproveError};
use icrc_ledger_types::icrc2::transfer_from::{TransferFromArgs, TransferFromError};

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(Clone, Debug, CandidType, Deserialize)]
struct Subscriber {
    topic: String,
}

#[derive(Clone, CandidType, Deserialize)]
struct Event0301008 {
    topic: String,
    payload: WorkLoadLedgerItem,
}

#[derive(CandidType, Deserialize, Clone, Default)]
pub struct StateHeap {
    unv_nft_owners: Vec<Account>,
    unv_user_infos: Vec<UserIdentityInfo>,
    main_site_summary:MainSiteSummary,
    chakra_colloction:Vec<ChakraItem>
}
#[derive(CandidType, Default, Deserialize, Clone)]
struct StableState {
    state: StateHeap,
}

#[derive(CandidType, Deserialize, Debug)]
struct GetAccountTransactionsArgs {
    account: Account,
    start: Option<Nat>,
    max_results: Nat,
}

#[derive(CandidType, Deserialize, Debug)]
struct GetTransactions {
    balance: Nat,
    // Tokens
    transactions: Vec<TransactionWithId>,
    oldest_tx_id: Option<Nat>, // BlockIndex
}

#[derive(CandidType, Deserialize, Debug)]
struct TransactionWithId {
    id: Nat,
    // BlockIndex
    transaction: Transaction,
}

#[derive(CandidType, Deserialize, Debug)]
struct Transaction {
    burn: Option<Burn>,
    kind: String,
    mint: Option<Mint>,
    approve: Option<Approve>,
    timestamp: u64,
    transfer: Option<Transfer>,
}

#[derive(CandidType, Deserialize, Debug)]
struct Burn {
    from: Account,
    memo: Option<Vec<u8>>,
    created_at_time: Option<u64>,
    amount: Nat,
    spender: Option<Account>,
}

#[derive(CandidType, Deserialize, Debug)]
struct Mint {
    to: Account,
    memo: Option<Vec<u8>>,
    created_at_time: Option<u64>,
    amount: Nat,
}

#[derive(CandidType, Deserialize, Debug)]
struct Approve {
    fee: Option<Nat>,
    from: Account,
    memo: Option<Vec<u8>>,
    created_at_time: Option<u64>,
    amount: Nat,
    expected_allowance: Option<Nat>,
    expires_at: Option<u64>,
    spender: Account,
}

#[derive(CandidType, Deserialize, Debug)]
struct Transfer {
    to: Account,
    fee: Option<Nat>,
    from: Account,
    memo: Option<Vec<u8>>,
    created_at_time: Option<u64>,
    amount: Nat,
    spender: Option<Account>,
}

#[derive(CandidType, Deserialize, Debug)]
struct GetTransactionsErr {
    message: String,
}

#[derive(CandidType, Deserialize, Debug)]
enum GetTransactionsResult {
    Ok(GetTransactions),
    Err(GetTransactionsErr),
}

thread_local! {
    static STATEHEAP: RefCell<StateHeap> = RefCell::new(StateHeap::default());
    //static STATE:RefCell<UnvMinnerLedgerState> = RefCell::new(UnvMinnerLedgerState::default());

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
                 RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    static LEDGER_STATE: RefCell<StableVec<UnvMinnerLedgerRecord, Memory>> = RefCell::new(
        StableVec::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
    ).expect("Init stablemem error"));
}


#[ic_cdk::query]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

fn get_total_minner() -> Result<Vec<Account>, String> {
    STATEHEAP.with(|s| Ok(s.borrow().unv_nft_owners.clone()))
}

#[ic_cdk::update]
async fn call_unvoice_for_ext_nft(nft_owners: NftUnivoicePricipal) -> Result<usize, String> {
    STATEHEAP.with(|s| {
        s.borrow_mut().unv_nft_owners.clear();
        for owner_principal in nft_owners.owners {
            ic_cdk::println!("Current principal id is {}", owner_principal);
            s.borrow_mut().unv_nft_owners.push(
                Account::from_str(owner_principal.as_str()).expect("Error principal refered"),
            );
        }
        Ok(s.borrow_mut().unv_nft_owners.len())
    })
}



#[ic_cdk::update]
async fn query_poll_balance() -> Result<NumTokens, String> {
    ic_cdk::println!("Query balance of mining pool {}", ic_cdk::id(),);

    let pool_account:Account=Account::from_str("6nimk-xpves-34bk3-zf7dp-nykqv-h3ady-iu3ze-xplot-vm4uy-ptbel-3qe")
                                      .expect("pool principal unwarp err");

    let balance = ic_cdk::call::<(Account,), (Nat,)>(
        //todo: dev:mxzaz-hqaaa-aaaar-qaada-cai
        //todo: prod:jfqe5-daaaa-aaaai-aqwvq-cai
        Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai")
            .expect("Could not decode the principal."),
        "icrc1_balance_of",
        (pool_account,),
    )
    .await
    .map_err(|e| format!("fail to call ledger:{:?}", e))?
    .0
    .clone();
    ic_cdk::println!("Mining poll balance {}", balance);
    Ok(balance)
}

#[ic_cdk::update]
async fn transfer(args: TransferArgs) -> Result<BlockIndex, String> {
    ic_cdk::println!(
        "Transferring {} tokens to account {}",
        &args.amount,
        &args.to_account,
    );

    let transfer_from_args = TransferFromArgs {
        // the account we want to transfer tokens from (in this case we assume the caller approved the canister to spend funds on their behalf)
        from: Account::from(ic_cdk::caller()),
        // can be used to distinguish between transactions
        memo: None,
        // the amount we want to transfer
        amount: args.amount,
        // the subaccount we want to spend the tokens from (in this case we assume the default subaccount has been approved)
        spender_subaccount: None,
        // if not specified, the default fee for the canister is used
        fee: None,
        // the account we want to transfer tokens to
        to: args.to_account,
        // a timestamp indicating when the transaction was created by the caller; if it is not specified by the caller then this is set to the current ICP time
        created_at_time: None,
    };

    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    ic_cdk::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
        // 2. Convert a textual representation of a Principal into an actual `Principal` object. The principal is the one we specified in `dfx.json`.
        //    `expect` will panic if the conversion fails, ensuring the code does not proceed with an invalid principal.
        Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai")
            .expect("Could not decode the principal."),
        //ic_cdk::caller(),
        // 3. Specify the method name on the target canister to be called, in this case, "icrc1_transfer".
        "icrc2_transfer_from",
        // 4. Provide the arguments for the call in a tuple, here `transfer_args` is encapsulated as a single-element tuple.
        (transfer_from_args,),
    )
    .await // 5. Await the completion of the asynchronous call, pausing the execution until the future is resolved.
    // 6. Apply `map_err` to transform any network or system errors encountered during the call into a more readable string format.
    //    The `?` operator is then used to propagate errors: if the result is an `Err`, it returns from the function with that error,
    //    otherwise, it unwraps the `Ok` value, allowing the chain to continue.
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    // 7. Access the first element of the tuple, which is the `Result<BlockIndex, TransferError>`, for further processing.
    .0
    // 8. Use `map_err` again to transform any specific ledger transfer errors into a readable string format, facilitating error handling and debugging.
    .map_err(|e: TransferFromError| format!("ledger transfer error {:?}", e))
}

#[ic_cdk::update]
async fn setup_subscribe(publisher_id: Principal, topic: String) {
    let subscriber = Subscriber { topic };
    let _call_result: Result<(), _> = ic_cdk::call(publisher_id, "subscribe", (subscriber,)).await;
}

#[ic_cdk::update]
async fn get_miner_license(user_principal: String) -> Vec<Nat> {
    let account: Account =
        Account::from_str(&user_principal).expect("Could not decode the principal");
    ic_cdk::call::<(Account,), (Vec<Nat>,)>(
        Principal::from_str("br5f7-7uaaa-aaaaa-qaaca-cai")
            .expect("Could not decode the principal."),
        "icrc7_tokens_of",
        (account,),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))
    .unwrap()
    .0
}

#[ic_cdk::update]
async fn publish_0301008(event: Event0301008) -> Result<TxIndex, String> {
    let ledger_item = event.payload;

    ic_cdk::println!("Init Nft owners");
    /*
    TODO: The sharding logic in init_nft_tokens can be optimized for efficiency to minimize
     the number of icrc7_owner_of method calls, thereby reducing cycles consumption.
    */
    let nft_vec_param = init_nft_tokens(&ledger_item).await;
    ic_cdk::println!("Finish init Nft owners");
    let mut miner_acounts: Vec<Account> = Vec::new();

    //Build miner_collection
    for nft_vec in nft_vec_param {
        ic_cdk::println!("Call Nft collection params");
        let nft_query_parm: Vec<Nat> = nft_vec;
        ic_cdk::println!("Lenth :{}", nft_query_parm.clone().len());
        let miners_nft = ic_cdk::call::<(Vec<Nat>,), (Vec<Option<Account>>,)>(
            Principal::from_str(&ledger_item.nft_pool).expect("Could not decode the principal."),
            "icrc7_owner_of",
            (nft_query_parm,),
        )
        .await
        .map_err(|e| format!("failed to call ledger: {:?}", e));

        match miners_nft {
            Ok(accounts_opt) => {
                let accounts = accounts_opt;
                for account in accounts.0 {
                    if let Some(acctwithsub) = account {
                        if acctwithsub
                            .owner
                            .eq(&Principal::from_str(&ledger_item.nft_pool).unwrap())
                        {
                            continue;
                        }
                        ic_cdk::println!("Add nft owner");
                        miner_acounts.push(acctwithsub.clone());
                    }
                }
            }
            Err(e) => ic_cdk::println!("Call NFT err {}", e),
        }
    }
    let sharding_size = miner_acounts.len();
    let block_tokens = ledger_item.clone().block_tokens / sharding_size;

    
    ic_cdk::println!("Per-nft sharing of {} tokens", block_tokens);
    let mut blockindex: Nat = Nat::from(0 as u128);
    for miner in miner_acounts {
        blockindex = produce_unv_miner_ledger(&ledger_item, &miner, &block_tokens);

        ic_cdk::println!(
            "NFT owner is {}, blockindex is {}",
            miner.owner.to_text(),
            blockindex
        );
    }
    STATEHEAP.with(|s|{
        ic_cdk::println!("Update summary info");
        s.borrow_mut().main_site_summary.listener_count = sharding_size.clone();
        s.borrow_mut().main_site_summary.aigcblock_created_number = blockindex.clone();
        s.borrow_mut().main_site_summary.token_per_block = block_tokens.clone();
        ic_cdk::println!("Update summary info {}",s.borrow().main_site_summary.listener_count);
        ic_cdk::println!("Update summary info {}",s.borrow().main_site_summary.aigcblock_created_number);
        ic_cdk::println!("Update summary info {}",s.borrow().main_site_summary.token_per_block);
    });
    Ok(TxIndex::from(blockindex))
}

#[ic_cdk::update]
async fn publish_0301008_EXT(event: Event0301008) -> Result<TxIndex, String> {
    let ledger_item = event.payload;
    let mut blockindex: Nat = Nat::from(0 as u128);

    let mut blockindex_vec: Vec<Nat> = Vec::new();
    let mut tx_index: Nat = Nat::from(0 as u128);

    ic_cdk::println!("Init Nft owners");

    let miner_set = get_total_minner().unwrap();
    let sharding_size = miner_set.len();
    let block_tokens = ledger_item.clone().block_tokens / sharding_size;
    ic_cdk::println!("Per-nft sharing of {} tokens", block_tokens);

    for miner in miner_set {
        blockindex = produce_unv_miner_ledger(&ledger_item, &miner, &block_tokens);
        blockindex_vec.push(blockindex.clone());
        ic_cdk::println!(
            "NFT owner is {}, blockindex is {}",
            miner.owner.to_text(),
            blockindex.clone()
        );
    }
    for idx_ledger in blockindex_vec {
        tx_index = claim_to_account_from_index(idx_ledger.clone())
            .await
            .expect("fail to call claim");
    }

    Ok(TxIndex::from(tx_index))
}

#[ic_cdk::query]
fn get_all_miner_jnl() -> Option<Vec<UnvMinnerLedgerRecord>> {
    LEDGER_STATE.with(|s| {
        let mut res_vec: Vec<UnvMinnerLedgerRecord> = Vec::new();
        ic_cdk::println!("get miner jnl begin");

        for ledger_item in s.borrow().iter() {
            ic_cdk::println!("get one miner jnl:{}", ledger_item.minner_principalid);
            res_vec.push(ledger_item.clone());
        }
        return Some(res_vec);
    })
}
#[ic_cdk::query]
fn get_total_listener() -> Option<usize>{
    STATEHEAP.with(|s|{
        let listener_count:usize =s.borrow().main_site_summary.listener_count;
        ic_cdk::println!("get_total_listener:{}",listener_count);

        return Some(listener_count );
    })
}

#[ic_cdk::update]
async fn get_main_site_summary() ->MainSiteSummary{
    let mut summary:MainSiteSummary = MainSiteSummary{
        listener_count:0,
        aigcblock_created_number:Nat::from(0 as u64),
        token_per_block:Nat::from(0 as u64),
        token_pool_balance:Nat::from(0 as u64)

    };
    STATEHEAP.with(
        |s|{
            ic_cdk::println!("get_main_site_summary {}",s.borrow().main_site_summary.listener_count);
            ic_cdk::println!("get_main_site_summary {}",s.borrow().main_site_summary.aigcblock_created_number);
            ic_cdk::println!("get_main_site_summary {}",s.borrow().main_site_summary.token_per_block);

            ic_cdk::println!("Query balance of mining pool {}", ic_cdk::id(),);

            
            
            summary = MainSiteSummary{
                listener_count:s.borrow().main_site_summary.clone().listener_count,
                aigcblock_created_number:s.borrow().main_site_summary.clone().aigcblock_created_number,
                token_per_block:s.borrow().main_site_summary.clone().token_per_block,
                token_pool_balance:NumTokens::from(0 as u128)

            };
        }
    );

    let pool_account:Account=Account::from_str("6nimk-xpves-34bk3-zf7dp-nykqv-h3ady-iu3ze-xplot-vm4uy-ptbel-3qe")
                                              .expect("pool principal unwarp err");
        
    let balance = ic_cdk::call::<(Account,), (Nat,)>(
    //todo: dev:mxzaz-hqaaa-aaaar-qaada-cai
    //todo: prod:jfqe5-daaaa-aaaai-aqwvq-cai
    Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai")
                   .expect("Could not decode the principal."),
                   "icrc1_balance_of",
                   (pool_account,),
            )
            .await
            .map_err(|e| format!("fail to call ledger:{:?}", e))
            .unwrap()
            .clone();
    summary.token_pool_balance = balance.0;
    return summary;
    
}

#[ic_cdk::query]
fn get_all_miner_jnl_with_principalid(principalid: String,pre:usize, take:usize) -> MinerJnlPageniaze {
    let mut minting_ledeger: Vec<UnvMinnerLedgerRecord> = Vec::new();
    let account: Account = Account::from_str(&principalid).expect("Parse principal id err");

    LEDGER_STATE.with(|s| {
        for ledeger_item in s.borrow().iter() {
            if principalid == ledeger_item.minner_principalid {
                minting_ledeger.push(ledeger_item);
            }
        }
    });
    if pre > minting_ledeger.len() {
        let empty_res:Vec<UnvMinnerLedgerRecord> = Vec::new();
        return  MinerJnlPageniaze{
            total_log : 0,
            ledgers : empty_res
        };
    }

    if take >= minting_ledeger.len()  {
        return MinerJnlPageniaze {
            total_log:minting_ledeger.len(),
            ledgers:minting_ledeger
        } ;
    }
    if pre +take > minting_ledeger.len()-1 {
        return MinerJnlPageniaze {
            total_log:minting_ledeger[pre*take..].to_vec().len(),
            ledgers:minting_ledeger[pre*take..].to_vec()
        };
    }    
    return MinerJnlPageniaze {
        total_log: minting_ledeger[pre..(pre+take)].to_vec().len(),
        ledgers: minting_ledeger[pre..(pre+take)].to_vec()
    };  
    //return minting_ledeger;
}

#[ic_cdk::update]
fn sync_userinfo_identity(user_infos: Vec<UserIdentityInfo>) -> Result<usize, String> {
    STATEHEAP.with(|s| {
        let mut tmp_userinfo: Vec<UserIdentityInfo> = Vec::new();
        let mut idl_cnt = 0;

        for item in user_infos.clone() {
            if s.borrow().unv_user_infos.len() == 0 {
                ic_cdk::println!("Sync userinfos from univoice-init push");
                tmp_userinfo.push(item.clone());
            }

            for user_info_item in s.borrow().unv_user_infos.iter() {
                if item.user_id == user_info_item.user_id {
                    idl_cnt += 1;
                    break;
                }
            }

            if idl_cnt == 0 {
                ic_cdk::println!("Sync userinfos from univoice push {}", item.user_id);
                tmp_userinfo.push(item.clone());
            }
            idl_cnt = 0;
        }

        for add_item in tmp_userinfo {
            s.borrow_mut().unv_user_infos.push(add_item);
        }

        let userinfo_size: usize = s.borrow().unv_user_infos.len();
        Ok(userinfo_size)
    })
}

#[ic_cdk::update]
async fn claim_to_account_from_index(block_index: BlockIndex) -> Result<TxIndex, String> {
    let miner_ledger = get_unclaimed_mint_ledger(&block_index);
    match miner_ledger {
        Some(ledger_item) => {
            let transfer_result = call_transfer(&ledger_item).await;
            match transfer_result {
                Result::Ok(i) => {
                    let mut claimed_ledger = ledger_item.clone();
                    claimed_ledger.biz_state = TransferTxState::Claimed;
                    claimed_ledger.meta_workload.mining_status =
                        MinerTxState::Claimed(String::from("claimed"));
                    claimed_ledger.gmt_claim_time = ic_cdk::api::time();
                    claimed_mint_ledger(&block_index, &i)
                        .map_err(|e| format!("fail to call ledger:{:?}", e));
                    ic_cdk::println!("Transfer Success {}", i);
                    return Result::Ok(TxIndex::from(i));
                }
                Result::Err(e) => {
                    ic_cdk::println!("Transfer fail {}", e);
                    return Err(String::from(e.to_string()));
                }
            }
        }
        None => return Err(String::from("None ledger need to be claimed")),
    };
    Ok(TxIndex::from(0 as u128))
}

#[ic_cdk::query]
fn gener_nft_owner_wait_claims(principal: String) -> MinerWaitClaimBalance {
    LEDGER_STATE.with(|s| {
        let miner_account: Account =
            Account::from(Principal::from_text(principal.clone()).unwrap());
        let mut balance: NumTokens = NumTokens::from(0 as u128);
        for unv_miner_ledger in s.borrow().iter() {
            if principal == unv_miner_ledger.clone().minner_principalid {
                balance = unv_miner_ledger.tokens.clone() + balance;
            }
        }
        return MinerWaitClaimBalance {
            pricipalid_txt: miner_account.owner.to_text(),
            tokens: balance,
        };
    })
}

#[ic_cdk::update]
async fn claim_to_account_by_principal(principalid: String) -> Result<NumTokens, String> {
    let miner_ledger_vec = get_unclaimed_mint_ledger_by_principal_daily(principalid);
    let mut sum_tx_tokens:NumTokens = NumTokens::from(0 as u128);
    match miner_ledger_vec {
        Some(ledger_item_vec) => {
            for ledger_item in ledger_item_vec.iter() {
                let transfer_result = call_transfer(&ledger_item).await;
                match transfer_result {
                    Result::Ok(i) => {
                        let mut claimed_ledger = ledger_item.clone();
                        claimed_ledger.biz_state = TransferTxState::Claimed;
                        claimed_ledger.meta_workload.mining_status =
                            MinerTxState::Claimed(String::from("claimed"));
                        claimed_ledger.gmt_claim_time = ic_cdk::api::time();
                        let block_index: Nat = claimed_ledger.block_index.unwrap();
                        claimed_mint_ledger(&block_index, &i)
                            .map_err(|e| format!("fail to call ledger:{:?}", e));
                        ic_cdk::println!("Transfer Success {}", i);
                        sum_tx_tokens += ledger_item.tokens.clone();
                        LEDGER_STATE.with(|s|{
                            for mut item in s.borrow_mut().iter() {
                                if block_index == item.block_index.unwrap() {
                                    item.gmt_claim_time = claimed_ledger.gmt_claim_time;
                                    item.biz_state = TransferTxState::Claimed;
                                }
                            }

                        });

                    }
                    Result::Err(e) => {
                        ic_cdk::println!("Transfer fail {}", e);
                        return Err(String::from(e.to_string()));
                    }
                }
            }
        }
        None => return Err(String::from("None ledger need to be claimed")),
    };
    Ok(sum_tx_tokens)
}

fn get_unclaimed_mint_ledger(index: &BlockIndex) -> Option<UnvMinnerLedgerRecord> {
    LEDGER_STATE.with(|s| {
        for item in s.borrow().iter() {
            if *index == item.clone().block_index.unwrap() {
                if item.biz_state == TransferTxState::Claimed {
                    return None;
                }

                return Some(item.clone());
            }
        }
        None
    })
}

#[ic_cdk::query]
fn sum_unclaimed_mint_ledger_onceday(principalid: String) -> NumTokens {
    LEDGER_STATE.with(|s| {
        let account: Account = Account::from_str(&principalid).expect("pack into  principal err");
        let mut tokens: NumTokens = NumTokens::from(0 as u128);
        let day_of_nano_millsecond: u64 = 24 * 3600 * 1000 * 1000;
        let nowtime = ic_cdk::api::time();
        for item in s.borrow().iter() {
            if (item.biz_state == TransferTxState::Claimed)
                || ((item.biz_state != TransferTxState::Claimed) && (day_of_nano_millsecond > nowtime - item.gmt_claim_time))
                || (item.minner_principalid != principalid)
            {
                if day_of_nano_millsecond > nowtime - item.gmt_claim_time {
                    ic_cdk::println!("Cal time: {} >{} -{}", 
                        day_of_nano_millsecond,nowtime, item.gmt_claim_time)
                 }
                continue;
            }
            if day_of_nano_millsecond <= nowtime - item.gmt_claim_time {
                ic_cdk::println!("Cal time full fill: {} >{} -{}", 
                    day_of_nano_millsecond,nowtime, item.gmt_claim_time)
            }
            tokens += item.clone().tokens;
        }
        return tokens;
    })
}

#[ic_cdk::query]
fn sum_claimed_mint_ledger(principalid: String) -> NumTokens {
    LEDGER_STATE.with(|s| {
        let account: Account = Account::from_str(&principalid).expect("pack into  principal err");
        let mut tokens: NumTokens = NumTokens::from(0 as u128);

        for item in s.borrow().iter() {
            if item.minner_principalid != principalid {
                continue;
            }
            tokens += item.clone().tokens;
        }
        return tokens;
    })
}

fn get_unclaimed_mint_ledger_by_principal(
    principalid: String,
) -> Option<Vec<UnvMinnerLedgerRecord>> {
    LEDGER_STATE.with(|s| {
        let mut ledgerRecord: Vec<UnvMinnerLedgerRecord> = Vec::new();
        for item in s.borrow().iter() {
            if principalid == item.clone().minner_principalid {
                if item.biz_state != TransferTxState::Claimed {
                    ledgerRecord.push(item.clone());
                }
            }
        }
        return Some(ledgerRecord);
    })
}

fn get_unclaimed_mint_ledger_by_principal_daily(
    principalid: String,
) -> Option<Vec<UnvMinnerLedgerRecord>> {
    LEDGER_STATE.with(|s| {
        let nowtime = ic_cdk::api::time();
        let day_of_nano_millsecond: u64 = 24 * 3600 * 1000 * 1000;

        let mut ledgerRecord: Vec<UnvMinnerLedgerRecord> = Vec::new();
        //24hour can claim once
        for item in s.borrow().iter() {
            if (principalid == item.clone().minner_principalid) &&
               (item.biz_state == TransferTxState::Claimed) && 
               (day_of_nano_millsecond > nowtime - item.gmt_claim_time) {
                   if day_of_nano_millsecond > nowtime - item.gmt_claim_time {
                        ic_cdk::println!("Cal time daliy: {} >{} -{}", 
                        day_of_nano_millsecond,nowtime, item.gmt_claim_time)
                   }
                   
                  let empty_res:Vec<UnvMinnerLedgerRecord> =  Vec::new();
                  return Some(empty_res);
               }
               if day_of_nano_millsecond <= nowtime - item.gmt_claim_time {
                    ic_cdk::println!("Cal time full fill daily: {} >{} -{}", 
                    day_of_nano_millsecond,nowtime, item.gmt_claim_time)
               }
        }


        for item in s.borrow().iter() {
            if principalid == item.clone().minner_principalid {
                if item.biz_state != TransferTxState::Claimed {
                    ledgerRecord.push(item.clone());
                }
            }
        }
        return Some(ledgerRecord);
    })
}

fn claimed_mint_ledger(index: &BlockIndex, trans_index: &TxIndex) -> Result<(), String> {
    LEDGER_STATE.with(|s| {
        let mut mem_index: u64 = 0;
        let stable_mem = s.borrow_mut();
        for item in stable_mem.iter() {
            if *index == item.clone().block_index.unwrap() {
                let mut item_clone = item.clone();
                item_clone.biz_state = TransferTxState::Claimed;
                item_clone.meta_workload.mining_status =
                    MinerTxState::Claimed(String::from("claimed"));
                item_clone.gmt_claim_time= ic_cdk::api::time();
                item_clone.trans_tx_index = Some(trans_index.clone());
                stable_mem.set(mem_index, &item_clone);
                return Ok(());
            }
            mem_index += 1;
        }
        Err(String::from("Ledger is in blackhole"))
    })
}

async fn call_approve_with_block_tokens(account: &Account, tokens: &NumTokens) -> ApproveResult {
    let approve_args = ApproveArgs {
        fee: Some(NumTokens::from(10 as u128)),
        memo: None,
        from_subaccount: None,
        created_at_time: Some(ic_cdk::api::time()),
        amount: tokens.clone(),
        expected_allowance: None,
        expires_at: None,
        spender: account.clone(),
    };
    ic_cdk::call::<(ApproveArgs,), (ApproveResult,)>(
        Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai")
            .expect("Could not decode the principal."),
        // 3. Specify the method name on the target canister to be called, in this case, "icrc1_transfer".
        "icrc2_approve",
        // 4. Provide the arguments for the call in a tuple, here `transfer_args` is encapsulated as a single-element tuple.
        (approve_args,),
    )
    .await
    .map_err(|e| format!("fail to call ledger:{:?}", e))
    .unwrap()
    .0
}

//Call icrc1_ledger
async fn call_transfer(miner_ledger: &UnvMinnerLedgerRecord) -> Result<BlockIndex, String> {
    ic_cdk::println!("Begin transfer {} tokens", miner_ledger.tokens);
    let to_principalid = miner_ledger.clone().minner_principalid;
    let transfer_from_args = TransferFromArgs {
        // the account we want to transfer tokens from (in this case we assume the caller approved the canister to spend funds on their behalf)
        from: Account::from_str(&miner_ledger.meta_workload.token_pool)
            .expect("Get token pool error"),
        // can be used to distinguish between transactions
        memo: None,
        // the amount we want to transfer
        amount: miner_ledger.tokens.clone(),
        // the subaccount we want to spend the tokens from (in this case we assume the default subaccount has been approved)
        spender_subaccount: None,
        // if not specified, the default fee for the canister is used
        fee: None,
        // the account we want to transfer tokens to
        to: Account::from_str(&to_principalid).unwrap(),
        // a timestamp indicating when the transaction was created by the caller; if it is not specified by the caller then this is set to the current ICP time
        created_at_time: None,
    };

    // 1. Asynchronously call another canister function using `ic_cdk::call`.
    ic_cdk::call::<(TransferFromArgs,), (Result<BlockIndex, TransferFromError>,)>(
        // 2. Convert a textual representation of a Principal into an actual `Principal` object. The principal is the one we specified in `dfx.json`.
        //    `expect` will panic if the conversion fails, ensuring the code does not proceed with an invalid principal.
        Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai")
            .expect("Could not decode the principal."),
        // 3. Specify the method name on the target canister to be called, in this case, "icrc2_transfer_from".
        "icrc2_transfer_from",
        // 4. Provide the arguments for the call in a tuple, here `transfer_args` is encapsulated as a single-element tuple.
        (transfer_from_args,),
    )
    .await // 5. Await the completion of the asynchronous call, pausing the execution until the future is resolved.
    // 6. Apply `map_err` to transform any network or system errors encountered during the call into a more readable string format.
    //    The `?` operator is then used to propagate errors: if the result is an `Err`, it returns from the function with that error,
    //    otherwise, it unwraps the `Ok` value, allowing the chain to continue.
    .map_err(|e| format!("failed to call ledger: {:?}", e))?
    // 7. Access the first element of the tuple, which is the `Result<BlockIndex, TransferError>`, for further processing.
    .0
    // 8. Use `map_err` again to transform any specific ledger transfer errors into a readable string format, facilitating error handling and debugging.
    .map_err(|e: TransferFromError| format!("ledger transfer error {:?}", e))
}

async fn total_nft_supply(ledger: &WorkLoadLedgerItem) -> Nat {
    ic_cdk::call::<(), (Nat,)>(
        Principal::from_text(ledger.nft_pool.clone()).expect("Could not decode the principal."),
        "icrc7_total_supply",
        (),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))
    .unwrap()
    .0
}

async fn total_nft_supply_owner(ledger: &WorkLoadLedgerItem) -> Nat {
    ic_cdk::call::<(), (Nat,)>(
        Principal::from_text(ledger.nft_pool.clone()).expect("Could not decode the principal."),
        "icrc7_total_supply",
        (),
    )
    .await
    .map_err(|e| format!("failed to call ledger: {:?}", e))
    .unwrap()
    .0
}

async fn init_nft_tokens(ledger: &WorkLoadLedgerItem) -> Vec<Vec<Nat>> {
    let mut tokens_shard: Vec<Nat> = Vec::new();
    let mut nft_tokens_param: Vec<Vec<Nat>> = Vec::new();
    let max_tokenid: Nat = total_nft_supply(&ledger).await;
    ic_cdk::println!("Total Nft Supply is {}", &max_tokenid);

    let mut i: u128 = 0 as u128;
    let mut i_shard: u128 = 0 as u128;

    let glb_shard_size = 50;
    loop {
        tokens_shard.push(Nat::from(i.clone()));
        i += 1;
        i_shard += 1;

        if Nat::from(i_shard).eq(&Nat::from(glb_shard_size as u128)) {
            nft_tokens_param.push(tokens_shard.clone());
            tokens_shard.clear();
            i_shard = 0;
            ic_cdk::println!("Init Nft shard to Index of {}", i);
        }

        if Nat::from(i) == max_tokenid {
            break;
        }
    }
    if tokens_shard.len() > 0 {
        nft_tokens_param.push(tokens_shard.clone());
        tokens_shard.clear();
    }
    return nft_tokens_param;
}

fn produce_unv_miner_ledger(
    workloadledger: &WorkLoadLedgerItem,
    nft_owner: &Account,
    block_tokens: &Nat,
) -> BlockIndex {
    LEDGER_STATE.with(|s| {
        let top_block = s.borrow_mut().len();
        let block_index = BlockIndex::from(top_block + 1);
        let minner_ledger = UnvMinnerLedgerRecord {
            minner_principalid: nft_owner.clone().owner.to_text(),
            meta_workload: workloadledger.clone(),
            block_index: Some(block_index.clone()),
            tokens: block_tokens.clone(),
            trans_tx_index: Option::None,
            gmt_datetime: ic_cdk::api::time(),
            gmt_claim_time: Timestamp::from(0 as u64),
            biz_state: TransferTxState::WaitClaim,
        };
        s.borrow_mut()
            .push(&minner_ledger)
            .expect("Push ledger error");
        return block_index;
    })
}
/*
#[ic_cdk::pre_upgrade]
fn pre_upgrade() {
    let state = STATEHEAP.with(|state: &RefCell<StateHeap>| mem::take(&mut *state.borrow_mut()));
    let stable_state: StableState = StableState { state };
    ic_cdk::println!("pre_upgrade");
    storage::stable_save((stable_state,)).unwrap();


}

#[ic_cdk::post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("post_upgrade");
    let (StableState { state },) =
        storage::stable_restore().expect("failed to restore stable state");
        STATEHEAP.with(|state0| *state0.borrow_mut() = state);
}
*/

#[ic_cdk::query]
async fn get_user_balance(account_owner: Principal) -> Result<Nat, String> {
    ic_cdk::println!("Received account_owner: {}", account_owner.to_text());

    let ledger_canister_id =
        Principal::from_text("mxzaz-hqaaa-aaaar-qaada-cai").expect("Invalid Ledger Canister ID");

    let account = Account {
        owner: account_owner,
        subaccount: None,
    };

    let result: Result<(Nat,), _> = call(ledger_canister_id, "icrc1_balance_of", (account,)).await;

    match result {
        Ok((balance,)) => Ok(balance),
        Err(err) => Err(format!("Failed to fetch balance: {:?}", err)),
    }
}

#[query]
async fn get_account_transactions(args: GetAccountTransactionsArgs) -> GetTransactionsResult {
    let ledger_canister_id =
        Principal::from_text("jqxvq-ciaaa-aaaai-aqwwa-cai").expect("Invalid Ledger Canister ID");

    let result: Result<(GetTransactionsResult,), _> =
        call(ledger_canister_id, "get_account_transactions", (args,)).await;

    match result {
        Ok((response,)) => {
            ic_cdk::println!("Received response: {:?}", response);
            response
        }
        Err(err) => {
            ic_cdk::println!("Error calling ledger canister: {:?}", err);
            GetTransactionsResult::Err(GetTransactionsErr {
                message: format!("Failed to fetch transactions: {:?}", err),
            })
        }
    }
}

#[ic_cdk::query]
fn query_chakra_data(principalid:String)->ChakraItem {
    STATEHEAP.with( |s| {
        let charas:Vec<ChakraItem> =  s.borrow().chakra_colloction.clone();

        for chakra_item in charas {
            if chakra_item.pricipalid_txt == principalid.clone() {
                return chakra_item;
            }
        }
        return ChakraItem {
           pricipalid_txt : principalid.clone(),
           cnt1:Nat::from(0 as u32) ,
           cnt2:Nat::from(0 as u32),
           cnt3:Nat::from(0 as u32),
           cnt4:Nat::from(0 as u32),
           cnt5:Nat::from(0 as u32),
           cnt6:Nat::from(0 as u32),
           cnt7:Nat::from(0 as u32)
        }

    }
    )

}

#[ic_cdk::update]
fn update_chakra(item:ChakraItem)->Result<Nat,String> {
    STATEHEAP.with(
       |s|{
            let mut cnt = 0;
            let item_input = item.clone();
            for  chakra_item in s.borrow_mut().chakra_colloction.iter_mut() {
                if chakra_item.pricipalid_txt == item.pricipalid_txt {
                    cnt+=1;
                    chakra_item.cnt1 = item_input.cnt1.clone();
                    chakra_item.cnt2 = item_input.cnt2.clone();
                    chakra_item.cnt3 = item_input.cnt3.clone();
                    chakra_item.cnt4 = item_input.cnt4.clone();
                    chakra_item.cnt5 = item_input.cnt5.clone();
                    chakra_item.cnt6 = item_input.cnt6.clone();
                    chakra_item.cnt7 = item_input.cnt7.clone();
                }
            }
            if cnt == 0 {
                let item_add = item.clone();
                s.borrow_mut().chakra_colloction.push(item_add);
               
            }
            Ok(Nat::from(0 as u32))
        }
    )

}

ic_cdk::export_candid!();
