import { univoice_vmc_backend } from 'declarations/univoice-vmc-backend';
import type {Result,MinerWaitClaimBalance,UnvMinnerLedgerRecord,MainSiteSummary,MinerJnlPageniaze,ChakraItem} from 'declarations/univoice-vmc-backend/univoice-vmc-backend.did';
import { isLocalNet } from '@/utils/env';
import exp from 'constants';


// Mode
const development = isLocalNet();
// Identity provider URL
const IDENTITY_PROVIDER = development
  ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943` 
  : "https://identity.ic0.app";


export const poll_balance = async () =>{
  return await univoice_vmc_backend.query_poll_balance();
}

export const get_total_listener = async() =>{
  console.log("Call backend get_total_listener");
  return await univoice_vmc_backend.get_total_listener();
}

/**
 * query custom should claimed
 * @param principalId 
 * @returns 
 */
export const gener_nft_owner_wait_claims = async(principalId:string):Promise<MinerWaitClaimBalance> => {
  let result:MinerWaitClaimBalance;
  result = await univoice_vmc_backend.gener_nft_owner_wait_claims(principalId);
  return result;  
}

export const get_miner_jnl = async(principalid:string, pre:bigint, take:bigint):Promise<MinerJnlPageniaze> =>{
  console.log("get_miner_jnl with principalid of:"+ principalid,pre,take);
  let res = await univoice_vmc_backend.get_all_miner_jnl_with_principalid(principalid,pre,take);
  console.log("get_miner_jnl with principalid result:", res);
  return res;
}

export const get_main_site_summary = async():Promise<MainSiteSummary> =>{

  return  univoice_vmc_backend.get_main_site_summary();

}

export const get_miner_license = async(user_principal: string, pre?: bigint, take?: bigint):Promise<Array<bigint>> =>  {
   let res = await  univoice_vmc_backend.get_miner_license(user_principal);
   return res;

}

type SummartForMyvoice = { 
  sum_claimed:bigint,
  sum_unclaimed:bigint
};

export const fetch_sumary_for_myvoice = async(user_principal:string):Promise<SummartForMyvoice> =>{
  let sum_claimed_val = await univoice_vmc_backend.sum_claimed_mint_ledger(user_principal);

  let sum_unclaimed_val = await univoice_vmc_backend.sum_unclaimed_mint_ledger_onceday(user_principal);
  const res = {
    sum_claimed:sum_claimed_val,
    sum_unclaimed:sum_unclaimed_val
  }

  return res;

}

export const claim_to_account_by_principal = async(user_principal:string):Promise<bigint> =>{
  let claim_res = await univoice_vmc_backend.claim_to_account_by_principal(user_principal);
  console.log("Has claimed res", claim_res);
  if("Ok" in claim_res) {
    return  (claim_res as {'Ok': bigint}).Ok;

  }
  return BigInt(0);
}

export const query_chakra_data=async (user_principal:string):Promise<ChakraItem> =>{
  console.log("call query_chakra_data",user_principal);
  return univoice_vmc_backend.query_chakra_data(user_principal);
}

export const update_chakra_data=async (chakraItem:ChakraItem) => {
  console.log("call update_chakra_data", chakraItem);
  univoice_vmc_backend.update_chakra(chakraItem);
}


