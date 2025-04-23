import { mountStoreDevtool } from 'simple-zustand-devtools';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
// import { isLocalNet } from '@/utils/env';
import { univoice_dapp_backend } from 'declarations/univoice-dapp-backend'

const isDev = true //isLocalNet();
const expire_ms = 24 * 60 * 60 * 1000;
const buildExpire = () => {
  return new Date().getTime() + expire_ms;
}

// =========================== data persistence ===========================
interface AccountState {
  wallet: string;
  principal: string;
  expire: number; // Login expiration(ms)
  ex_info: any;
  setUserByWallet: (wallet_type: string, principal_id: string) => void;
  clearAccount: () => void;
  getWalletType: () => string;
  getPrincipal: () => string;
  hasExpired: () => boolean;
  setExInfo: (info: any) => void;
  getExInfo: () => any
}

export const useAcountStore = create<AccountState>()(
  devtools(
    persist(
      (set,get) => ({
        wallet: '',
        principal: '',
        expire: 0,
        ex_info: {},
        setUserByWallet: (wallet_type, principal_id) => {
          set({
            wallet: wallet_type,
            principal: principal_id,
            expire: buildExpire()
          });
          // TODO
          set({
            ex_info: {
              is_invite_code_filled: false,
              invite_code: '123456'
            }
          });
          // univoice_dapp_backend.get_custom_info(null, [principal_id]).then((result) => {
          //   if (result && result.length > 0) {
          //     let u = result[0];
          //     set({
          //       ex_info: {
          //         is_invite_code_filled: u.is_invite_code_filled,
          //         invite_code: u.invite_code
          //       }
          //     });
          //   }
          // })
        },
        clearAccount: () => {
          set({
            wallet: '',
            principal: '',
            expire: 0
          });
        },
        getPrincipal: () => {
          return get().hasExpired() ? '' : get().principal;
        },
        getWalletType: () => {
          return get().hasExpired() ? '' : get().wallet;
        },
        hasExpired: (): boolean => {
          return get().expire < new Date().getTime();
        },
        setExInfo: (info) => {
          set({
            ex_info: info
          });
        },
        getExInfo: () => {
          return get().ex_info;
        }
      }),
      {
        name: '__univoice_dapp__',
      },
    ),
    {
      enabled: isDev,
    },
  ),
);

isDev && mountStoreDevtool('AppStore', useAcountStore);