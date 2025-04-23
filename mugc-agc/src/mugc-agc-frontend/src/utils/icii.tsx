import { Identity, Actor, HttpAgent, AnonymousIdentity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client"
import type { IDL } from "@dfinity/candid"
import dotenv from 'dotenv';
// import { AccountIdentifier } from "@dfinity/nns";

// // The interface of the whoami canister
// const webapp_idl = ({ IDL }) => {
//   return IDL.Service({ whoami: IDL.Func([], [IDL.Principal], ["query"]) });
// };
// export const init = ({ IDL }) => {
//   return [];
// };
const idlFactory = ({ IDL }: {IDL:any}) =>
  IDL.Service({
     whoami: IDL.Func([], [IDL.Principal], ['query']),
  });
const ii_canisterId = "qwsdo-xaaaa-aaaah-aaa3a-cai";

console.log('env', process.env.DFX_NETWORK)

let authClient: any = undefined;
// let identity;
let principal_id: any = undefined;

export const getPrincipal = () => {
  if (principal_id === undefined) {
    getIdentity();
  }
  return principal_id;
}

const updateAuthed = async () => {
  let identity: any;
  if (await authClient.isAuthenticated()) {
    identity = authClient.getIdentity();
  } else {
    console.log('ii not auth yet');
    return
  }
  console.log('icii', identity); // AnonymousIdentity
  // console.log('Anonymous?', identity.getPrincipal().isAnonymous())
  console.log('pid:', identity.getPrincipal().toString())
  console.log(JSON.stringify(identity.getPrincipal()))
  // const accountId = AccountIdentifier.fromPrincipal({ principal: identity.getPrincipal() });
  // console.log('accountId:', accountId.toHex());

  // 有效时间(s)
  const nextExpiration = identity.getDelegation().delegations
    .map((d: { delegation: { expiration: any; }; }) => d.delegation.expiration)
    .reduce((current: number, next: number) => next < current ? next : current);
  // const expirationDuration  = nextExpiration - BigInt(Date.now()) * BigInt(1000_000);
  const expirationDuration  = (nextExpiration / BigInt(1000_000) - BigInt(Date.now())) / BigInt(1000);
  console.log('expire(s):', expirationDuration);
  
  // 获取principal
  // Using the identity obtained from the auth client, we can create an agent to interact with the IC.
  const agent = new HttpAgent({ identity })
  if (isLocal()) {
    await agent.fetchRootKey();
  }
  // Using the interface description of our webapp, we create an actor that we use to call the service methods.
  const actor = Actor.createActor(idlFactory, {
    agent,
    canisterId: ii_canisterId,
  })
  // Call whoami which returns the principal (user id) of the current user.
  const principal = await actor.whoami();
  console.log('principal:', principal);
  principal_id = principal;
}

const getIdentity = async () => {
  if (authClient === undefined) {
    authClient = await AuthClient.create();
  }
  updateAuthed();
}

const isLocal = () => {
  return process.env.DFX_NETWORK === 'local';
}

export const goLogin = async () => {
  if (authClient === undefined) {
    authClient = await AuthClient.create();
  }
  const identityProvider = isLocal() ? 'https://identity.ic0.app' : 'https://identity.ic0.app';
  new Promise((resolve, reject) => {
    authClient.login({
      identityProvider: identityProvider,
      onSuccess: resolve,
      onError: reject
    })
  }).then(async result => {
    console.log('ic login result', result)
    updateAuthed();
  }).catch(error =>{
    alert(error)
    console.log('ic login error:', error)
  })
}
