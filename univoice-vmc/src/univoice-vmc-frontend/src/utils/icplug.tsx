import { tokenLedegerIdlFactory } from '@/idl/icrc1.did.js';
import { icrc7IdlFactory } from '@/idl/icrc7.did.js';

import { Principal } from '@dfinity/principal';
import { TransferResponse, ERROR_MSG } from '@/utils/uv_const';

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
// const host = "https://mainnet.dfinity.network";

const plug = (window as any).ic ? (window as any).ic.plug : undefined;

export const getPlugPrincipal = async (): Promise<string> => {
  await plug.isConnected()
  return plug.principalId ? plug.principalId : ''
}

export const buildActor = async (idl, canisterId) => {
  const connected = await plug.isConnected();
  if (!connected) {
    return Promise.reject(ERROR_MSG.WALLET_NOT_CONNECTED)
  }
  const actor = await plug.createActor({
    canisterId: canisterId,
    interfaceFactory: idl,
  });
  return actor;
}

export const checkPlugReady = (): boolean => {
  return plug ? true : false;
}

export const reConnectPlug = async (): Promise<string> => {
  // try{
  //   plug.disconnect()
  // } catch (e) {
  //   console.log('disconnect ic plug exception!', e);
  // }
  try {
    const publicKey = await plug.requestConnect({
      whitelist,
      // host,
      timeout: 2 * 3600 * 1000
    });
    return plug.principalId ? plug.principalId : '';
  } catch (e) {
    console.log('connect ic plug exception!', e);
    throw e;
  }
}

// The following is currently not in use

// export const queryBalance = async (): Promise<string> => {
//   const connected = await plug.isConnected();
//   if (!connected) {
//     return '';
//   }
//   const principal = Principal.fromText(plug.principalId);
//   const account =  {'owner' : principal, 'subaccount' : [] };
//   const tokenActor = await plug.createActor({
//     canisterId: tokenCanisterId,
//     interfaceFactory: tokenLedegerIdlFactory,
//   });
//   // use our actors getSwapInfo method
//   var tokensStr  = await tokenActor.icrc1_balance_of(account);
//   return tokensStr;
// }

export const call_tokens_of = async () : Promise<Array<bigint>> => {
  const connected = await plug.isConnected();
  if (!connected) {
    return Promise.reject(ERROR_MSG.WALLET_NOT_CONNECTED);
  }
  const principal_id = plug.principalId
  const principal = Principal.fromText(principal_id) ;
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

// dashboard query transaction data
export const call_get_transactions = async (pre:number, take:number): Promise<TransferResponse[]> => {
  const connected = await plug.isConnected();
  if (!connected) {
    return Promise.reject(ERROR_MSG.WALLET_NOT_CONNECTED);
  }

  const tokenActor = await plug.createActor({
     canisterId: tokenCanisterId,
     interfaceFactory: tokenLedegerIdlFactory,
  });
  // use our actors getSwapInfo method
  const request =  {'start' : pre, 'length' : take};
  var response  = await tokenActor.get_transactions(request);

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

export const call_get_transactions_listener = async (principal_id:string,pre:number, take:number): Promise<TransferResponse[]> => {
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

export default reConnectPlug;