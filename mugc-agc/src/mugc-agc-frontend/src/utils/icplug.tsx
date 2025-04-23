import { PlugMobileProvider } from '@funded-labs/plug-mobile-sdk'
import { isLocalNet } from '@/utils/env';
import { tokenLedegerIdlFactory, } from '@/idl/icrc1.did.js';
import {icrc7IdlFactory} from '@/idl/icrc7.did.js';

import { Principal } from '@dfinity/principal';

const isDev = isLocalNet();
const isMobile = PlugMobileProvider.isMobileBrowser()

export const initPlug = () => {
  const walletConnectProjectId = '1e0a755a594cfe1d94e3617f12f5ae64'
  if (isMobile) {
    const provider = new PlugMobileProvider({
      debug: isDev, // If you want to see debug logs in console
      walletConnectProjectId: walletConnectProjectId, // Project ID from WalletConnect console
      window: window,
    })
    console.log('provider.initialize()')
    // provider.initialize().catch(console.log)
    provider.initialize().then(()=>{
      console.log('provider.initialize ok')
      if (!provider.isPaired()) {
        console.log('!provider.isPaired')
        provider.pair().catch((e) => {
          console.log('provider.pair exception', e)
        })
      }
    }).catch((e) => {
      console.log('provider.initialize exception', e)
    })
    console.log('inited')
  }
}

export const plugReady = (): boolean => {
  if (isMobile) {
    return true;
  } else {
    const w = window as any;
    if (!w.ic || !w.ic.plug) {
      alert('请先安装plug钱包插件');
      return false;
    }
    return true;
  }
}

// Canister Ids
const tokenCanisterId  = 'jfqe5-daaaa-aaaai-aqwvq-cai';
// Nft canister ids
const nftCanisterId = "3blo3-qqaaa-aaaam-ad3ea-cai";
// Whitelist
const whitelist = [
  tokenCanisterId,
  nftCanisterId,
];

// Host
const host = "https://mainnet.dfinity.network";

export const reConnectPlug = async (): Promise<string> => {
  if (!plugReady()) return '';
  const plug = (window as any).ic.plug;
  // 断开旧的连接
  try{
    // if (plug.principalId) {
    plug.disconnect()
    // }
  } catch (e) {
    console.log('disconnect ic plug exception!', e);
  }
  try {
    const publicKey = await plug.requestConnect({
      // whitelist,
      // host,
      timeout: 50000
    });
    return plug.principalId ? plug.principalId : '';
  } catch (e) {
    console.log('connect ic plug exception!', e);
    return '';
  }
}

export const callBalance = async (principal_id:string): Promise<String> => {
   if (!plugReady()) return "";
   const plug = (window as any).ic.plug;
   const principal = Principal.fromText(principal_id) ;
   console.log('ICRC ledger call principal =' + principal);    

   const account =  {'owner' : principal,'subaccount' : [] };
   await plug.requestConnect({
    whitelist,
   }); 

   const tokenActor = await plug.createActor({
      canisterId: tokenCanisterId,
      interfaceFactory: tokenLedegerIdlFactory,
   });
   // use our actors getSwapInfo method
   console.log('ICRC ledger call agent begin');    

   var tokensStr  = await tokenActor.icrc1_balance_of(account);
   console.log('ICRC ledger call agent end :' + tokensStr);    

   return tokensStr;
}


export const callBalanceInstance= async (principal_id:string): Promise<String> => {


  if (!plugReady()) return "";
  const plug = (window as any).ic.plug;
  if(!plug) {
     return ""
  }
  const principal = Principal.fromText(principal_id) ;
  console.log('ICRC ledger call principal =' + principal);    

  const account =  {'owner' : principal,'subaccount' : [] };
  var tokensStr = "";
  // requestConnect callback function
  console.log('ICRC ledger call onConnectionUpdate');    

   // rebuild actor and test by getting Sonic info
  const tokenActor = await plug.createActor({
        canisterId: tokenCanisterId,
        interfaceFactory: tokenLedegerIdlFactory,
  });
// use our actors getSwapInfo method
  console.log('ICRC ledger call agent');    

  const tokens = await tokenActor.icrc1_balance_of(account);
  console.log('ICRC ledger call: ', tokens);    
  tokensStr = tokens.toString();
  
  return tokensStr;
} 

export const call_tokens_of= async (principal_id:string) : Promise<Array<bigint>> =>{
  if (!plugReady()) return null;
  const plug = (window as any).ic.plug;
  if(!plug) {
     return null;
  }
  const principal = Principal.fromText(principal_id) ;
  console.log('ICRC7 ledger call principal =' + principal);    

  const account =  {'owner' : principal,'subaccount' : [] };
  // requestConnect callback function
  console.log('ICRC7 ledger call onConnectionUpdate');    

   // rebuild actor and test by getting Sonic info
  const tokenActor = await plug.createActor({
        canisterId: nftCanisterId,
        interfaceFactory: icrc7IdlFactory,
  });
// use our actors getSwapInfo method
  console.log('ICRC7 ledger call agent');    

  const tokenIds = await tokenActor.icrc7_tokens_of(account);
  console.log('ICRC7 ledger call: ', tokenIds);    
 
  return tokenIds;

}

export const call_tokens_of_nftcollection= async (principal_id:string) : Promise<Array<bigint>> =>{
  if (!plugReady()) return null;
  const plug = (window as any).ic.plug;
  if(!plug) {
     return null;
  }
  const principal = Principal.fromText("br5f7-7uaaa-aaaaa-qaaca-cai") ;
  console.log('ICRC7 ledger call principal =' + principal);    

  const account =  {'owner' : principal,'subaccount' : [] };
  // requestConnect callback function
  console.log('ICRC7 ledger call onConnectionUpdate');    

   // rebuild actor and test by getting Sonic info
  const tokenActor = await plug.createActor({
        canisterId: nftCanisterId,
        interfaceFactory: icrc7IdlFactory,
  });
// use our actors getSwapInfo method
  console.log('ICRC7 ledger call agent');    

  const tokenIds = await tokenActor.icrc7_tokens_of(account);
  console.log('ICRC7 ledger call: ', tokenIds);    
 
  return tokenIds;

}

export const call_get_transactions = async (principal_id:string,pre:number, take:number): Promise<TransferResponse[]> => {
  if (!plugReady()) return null;
  const plug = (window as any).ic.plug;
  const principal = Principal.fromText(principal_id) ;
  console.log('ICRC ledger call principal =' + principal);    

  const request =  {'start' : pre,'length' : take };
  await plug.requestConnect({
   whitelist,
  }); 

  const tokenActor = await plug.createActor({
     canisterId: tokenCanisterId,
     interfaceFactory: tokenLedegerIdlFactory,
  });
  // use our actors getSwapInfo method
  console.log('ICRC ledger call get_transactions begin');    

  var response  = await tokenActor.get_transactions(request);

  var transactions = response.transactions;
  var log_length = response.log_length;
  let tranferDetails:TransferResponse[] = [];
  transactions.forEach((element,index)=> {
    console.log('ICRC ledger call transaction kind :' , element.kind);   
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
            console.log("Transaction result = ", transfer_detail_item);
            tranferDetails[index]= transfer_detail_item;        
          }        
       }
    
  });


  return tranferDetails;
}


export const call_get_transactions_listener = async (principal_id:string,pre:number, take:number): Promise<TransferResponse[]> => {
  if (!plugReady()) return null;
  const plug = (window as any).ic.plug;
  const principal = Principal.fromText(principal_id) ;
  console.log('ICRC ledger call principal =' + principal);    

  const request =  {'start' : pre,'length' : take };
  await plug.requestConnect({
   whitelist,
  }); 

  const tokenActor = await plug.createActor({
     canisterId: tokenCanisterId,
     interfaceFactory: tokenLedegerIdlFactory,
  });
  // use our actors getSwapInfo method
  console.log('ICRC ledger call get_transactions begin');    

  var response  = await tokenActor.get_transactions(request);

  var transactions = response.transactions;
  let tranferDetails:TransferResponse[] = [];
  let index = 0;
  let total_log = response.total_log;
  transactions.forEach((element)=> {
    console.log('ICRC ledger call transaction kind :' , element.kind);   
       if(element.kind=="transfer"){
         let transferInfo = element.transfer[0];

         if(element.transfer && transferInfo){

            let time_stamp = element.transfer.created_at_time?element.transfer.created_at_time:element.timestamp;
            let gmt_time_stamp:number;
            if(time_stamp){
              gmt_time_stamp=Number(Number(time_stamp)/1000) ;
            } 
            if (transferInfo.to?.owner.toString() === principal_id) {
              let transfer_detail_item:TransferResponse={
                   total_log:total_log,
                   txIndex:pre+index,
                   to:transferInfo.to?.owner.toString(),
                   fee:transferInfo.fee?Number(transferInfo.fee):Number(0),
                   memo:null,
                   created_at_time:gmt_time_stamp,
                   amount:transferInfo.amount?Number(transferInfo.amount):Number(0),
                   from:transferInfo.from?.owner.toString()
                 };
              console.log("Transaction result = ", transfer_detail_item);
              tranferDetails[index]= transfer_detail_item;    
              index+=1;        
            }                
          }        
       }
    
  });


  return tranferDetails;
}



export type TransferResponse = {
   total_log:number;
   txIndex:number,
   to:string,
   fee : number,
   from : string,
   memo : number,
   created_at_time : number,
   amount : number
};

export default reConnectPlug;