import { mountStoreDevtool } from 'simple-zustand-devtools';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { isLocalNet } from '@/utils/env';

import { univoice_vmc_backend } from 'declarations/univoice-vmc-backend';

const isDev = isLocalNet();
const expire_ms = 24 * 60 * 60 * 1000;
const buildExpire = () => {
  return new Date().getTime() + expire_ms;
}

// =========================== data persistence ===========================
interface AccountState {
  uid: string | number;
  wallet: string;
  principal: string;
  // balance:number;
  expire: number; // Login expiration(ms)
  setUser: (user_id: string | number) => void;
  setUserByWallet: (wallet_type: string, principal_id: string) => void;
  // setBalance:(tokens:number) => void;
  clearAccount: () => void;
  getUid: () => string | number;
  getPrincipal: () => string;
  // getBalance: () => string|number;
  getWalletType: () => string;
  hasExpired: () => boolean;
}

export const useAcountStore = create<AccountState>()(
  devtools(
    persist(
      (set,get) => ({
        uid: '',
        wallet: '',
        principal: '',
        // balance: 0,
        expire: 0,
        setUser: (user_id) => {
          set({
            uid: user_id,
            expire: buildExpire()
          });
        },
        setUserByWallet: (wallet_type, principal_id) => {
          getUserAccountId(wallet_type, principal_id).then((user_id) => {
            set({
              uid: user_id,
              wallet: wallet_type,
              principal: principal_id,
              expire: buildExpire()
            });
          });
        },
        // setBalance:(tokens) => {
        //    set(
        //         {   
        //             balance:tokens,
        //             expire: buildExpire()
        //         } 
        //    );
        // },
        clearAccount: () => {
          set({
            uid: '',
            wallet: '',
            principal: '',
            expire: 0
          });
        },
        getUid: () => {
          return get().hasExpired() ? '' : get().uid;
        },
        getPrincipal: () => {
          return get().hasExpired() ? '' : get().principal;
        },
        // getBalance: () => {
        //   return get().hasExpired() ? '' : get().balance;
        // },
        getWalletType: () => {
          return get().hasExpired() ? '' : get().wallet;
        },
        hasExpired: (): boolean => {
          return get().expire < new Date().getTime();
        }
      }),
      {
        name: '__official_website_univoice__',
      },
    ),
    {
      enabled: isDev,
    },
  ),
);

const getUserAccountId = async (wallet_type: string, principal_id: string): Promise<string> => {
  return '888'
  // return univoice_vmc_backend.greet(principal_id)
}

isDev && mountStoreDevtool('AppStore', useAcountStore);