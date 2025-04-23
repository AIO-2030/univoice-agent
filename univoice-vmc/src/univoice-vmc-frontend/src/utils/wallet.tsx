import { useAcountStore } from '@/stores/user'
import { getPlugPrincipal, buildActor as buildActorPlug } from '@/utils/icplug'
import { getPrincipal as getIIPrincipal, buildActor as buildActorII } from '@/utils/icii'
import { WALLET_TYPE, TransferResponse, ERROR_MSG } from '@/utils/uv_const'
import { Principal } from '@dfinity/principal';

import { tokenLedegerIdlFactory } from '@/idl/icrc1.did.js';
import { icrc7IdlFactory } from '@/idl/icrc7.did.js';
// Canister Ids
const tokenCanisterId  = 'jfqe5-daaaa-aaaai-aqwvq-cai';
// Nft canister ids
const nftCanisterId = "3blo3-qqaaa-aaaam-ad3ea-cai";

const buildActor = async (idl, canisterId) => {
  const walletType = useAcountStore.getState().getWalletType()
  if (!walletType) {
    return Promise.reject(ERROR_MSG.WALLET_NOT_CONNECTED)
  }
  return buildActorByWallet(walletType, idl, canisterId)
}

const buildActorDefaultII = async (idl, canisterId) => {
  const walletType = useAcountStore.getState().getWalletType() || WALLET_TYPE.II
  return buildActorByWallet(walletType, idl, canisterId)
}

const buildActorByWallet = async (walletType:string, idl, canisterId) => {
  let actor;
  if (WALLET_TYPE.PLUG === walletType) {
    actor = buildActorPlug(idl, canisterId)
  } else if (WALLET_TYPE.II === walletType) {
    actor = await buildActorII(idl, canisterId)
  } else {
    return Promise.reject(ERROR_MSG.UNKNOWN_WALLET_TYPE)
  }
  return actor;
}

export const queryBalance = async () => {
  const actor = await buildActor(tokenLedegerIdlFactory, tokenCanisterId);
  const pid = useAcountStore.getState().getPrincipal()
  const principal = Principal.fromText(pid);
  const account =  {'owner' : principal, 'subaccount' : [] };
  // use our actors getSwapInfo method
  var tokensStr  = await actor.icrc1_balance_of(account);
  return tokensStr.toString();
}

export const getWalletPrincipal = async (): Promise<string> => {
  const walletType = useAcountStore.getState().getWalletType()
  if (!walletType) {
    return Promise.reject(ERROR_MSG.WALLET_NOT_CONNECTED)
  }
  if (WALLET_TYPE.PLUG === walletType) {
    return getPlugPrincipal()
  } else if (WALLET_TYPE.II === walletType) {
    return getIIPrincipal()
  }
  return Promise.reject(ERROR_MSG.UNKNOWN_WALLET_TYPE)
}

export const checkLoginByWallet = async (): Promise<boolean> => {
  const userPrincipal = useAcountStore.getState().getPrincipal()
  const walletType = useAcountStore.getState().getWalletType()
  if (!walletType) {
    if (userPrincipal) {
      useAcountStore.getState().clearAccount()
    }
    return Promise.resolve(false)
  }
  let principal;
  if (WALLET_TYPE.PLUG === walletType) {
    principal = await getPlugPrincipal()
  } else if (WALLET_TYPE.II === walletType) {
    principal = await getIIPrincipal()
  } else {
    if (userPrincipal) {
      useAcountStore.getState().clearAccount()
    }
    return Promise.resolve(false)
  }
  if (!principal) {
    if (userPrincipal) {
      useAcountStore.getState().clearAccount()
    }
    return Promise.resolve(false)
  }
  const equal = principal === userPrincipal
  if (!equal) {
    console.log('checkLoginByWallet eq: ', equal)
    console.log('user pid: ', userPrincipal)
    console.log('wallet pid: ', principal)
    useAcountStore.getState().setUserByWallet(walletType, principal)
  }
  return Promise.resolve(true)
}

export const call_get_transactions = async (pre:number, take:number): Promise<TransferResponse[]> => {
  const actor = await buildActorDefaultII(tokenLedegerIdlFactory, tokenCanisterId);
  // use our actors getSwapInfo method
  const request =  {'start' : pre, 'length' : take};
  var response  = await actor.get_transactions(request);

  var transactions = response.transactions;
  var log_length = response.log_length;
  let tranferDetails:TransferResponse[] = [];
  transactions.forEach((element,index)=> {
    if(element.kind=="transfer"){
      let transferInfo = element.transfer[0];

      if(element.transfer && transferInfo){
        let time_stamp = element.transfer.created_at_time?element.transfer.created_at_time:element.timestamp;
        let gmt_time_stamp:number;
        if(time_stamp){
          gmt_time_stamp=Number(Number(time_stamp)/1000) ;
        } 

        let transfer_detail_item:TransferResponse={
          total_log:log_length,
          txIndex:pre+index,
          to:transferInfo.to?.owner.toString(),
          fee:transferInfo.fee?Number(transferInfo.fee):Number(0),
          memo:null,
          created_at_time:gmt_time_stamp,
          amount:transferInfo.amount?Number(transferInfo.amount):Number(0),
          from:transferInfo.from?.owner.toString()
        };
        // console.log("Transaction result = ", transfer_detail_item);
        tranferDetails[index]= transfer_detail_item;
      }
    } else {
      console.log('ICRC ledger call transaction kind :' , element.kind);
    }
  });
  return tranferDetails;
}

export const call_tokens_of = async () => {
  const actor = await buildActor(icrc7IdlFactory, nftCanisterId);
  const pid = useAcountStore.getState().getPrincipal()
  const principal = Principal.fromText(pid);
  const account =  {'owner' : principal,'subaccount' : [] };
  // requestConnect callback function
  
  // use our actors getSwapInfo method
  console.log('ICRC7 ledger call agent');    
  const tokenIds = await actor.icrc7_tokens_of(account);
  console.log('ICRC7 ledger call: ', tokenIds);
  return tokenIds;
}
