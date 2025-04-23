import { AuthClient } from "@dfinity/auth-client"
import { Identity, Actor, HttpAgent } from "@dfinity/agent";
// import { Principal } from '@dfinity/principal';
// import { AccountIdentifier } from "@dfinity/nns";
import { useAcountStore } from '@/stores/user'
import { WALLET_TYPE, TransferResponse, ERROR_MSG } from '@/utils/uv_const'

// import { tokenLedegerIdlFactory } from '@/idl/icrc1.did.js';
// // Canister Ids
// const tokenCanisterId  = 'jfqe5-daaaa-aaaai-aqwvq-cai';

// Host
const host = 'https://icp-api.io' //'https://mainnet.dfinity.network'

let authClient: any = undefined

export const init = async () => {
  if (!authClient) {
    authClient = await AuthClient.create({
      idleOptions: {
        disableIdle: true,
        disableDefaultIdleCallback: true,
      },
    });
  }
}

export const getPrincipal = async (): Promise<string> => {
  await init();
  const connected = await authClient.isAuthenticated();
  if (!connected) {
    return '';
  }
  return authClient.getIdentity().getPrincipal().toString()
}

export const buildActor = async (idl, canisterId) => {
  await init();
  const agent = new HttpAgent({ 
    host: host
  });
  const actor = Actor.createActor(
    idl, {
      agent,
      canisterId,
    }
  )
  return actor;
}

export const reConnectII = async () => {
  await init();
  await authClient.login({
    identityProvider: "https://identity.ic0.app",
    onSuccess: () => {
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal().toString();
      console.log('II login success, principal_id:', principal)
      if (principal) {
        useAcountStore.getState().setUserByWallet(WALLET_TYPE.II, principal)
      }
    },
    onError: (error) => {
      console.log('II login error:', error);
    }
  })
}

// export const queryBalance = async (): Promise<string> => {
//   await init();
//   const connected = await authClient.isAuthenticated();
//   if (!connected) {
//     return '';
//   }
//   // const agent = new HttpAgent({ identity: authClient.getIdentity() });
//   const agent = new HttpAgent({ 
//     host: 'https://icp-api.io' //'https://mainnet.dfinity.network'
//   });
//   // await agent.fetchRootKey();
//   const tokenActor = Actor.createActor(
//     tokenLedegerIdlFactory, {
//       agent,
//       canisterId: tokenCanisterId,
//     }
//   )
//   const pid = authClient.getIdentity().getPrincipal().toString();
//   const principal = Principal.fromText(pid);
//   const account =  {'owner' : principal, 'subaccount' : [] };
//   // use our actors getSwapInfo method
//   var tokensStr  = await tokenActor.icrc1_balance_of(account);
//   console.log('icrc1_balance_of :', tokensStr)
//   return tokensStr.toString();
// }
