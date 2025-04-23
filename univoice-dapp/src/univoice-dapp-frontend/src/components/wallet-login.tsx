import style from './wallet-login.module.scss'
import { useAcountStore } from '@/stores/user';
import { checkPlugReady, reConnectPlug } from '@/utils/icplug';
import { toastInfo, toastError, toastWarn,toastSuccess} from '@/components/toast';
import { WALLET_TYPE,ERROR_MSG } from '@/utils/uv_const'
import { add_custom_info } from '@/utils/callbackend'



const WalletLogin = ({
  onClose
}) => {
  const { setUserByWallet, getPrincipal } = useAcountStore();

  const handleLoginPlug = () => {
    if (!checkPlugReady()) {
      toastInfo('Please install plug-wallet extension first');
      return
    }
    loginPlug();
  }

  const loginPlug = () => {
    reConnectPlug().then((principal_id) => {
      if (!principal_id) return;
      setUserByWallet(WALLET_TYPE.PLUG, principal_id);
      add_cust_info ();
      onClose();
    }).catch((e) => {
      toastError('Failed to connect wallet! ' + e.toString())
    })
  }

  const add_cust_info = () => {
      const principal = getPrincipal();
      if (!principal) {
        toastWarn('Failed to add custom info: ' + ERROR_MSG.USER_NOT_AUTH);
        return;
      }
    
      // Using the specified canister ID from dfx.json for univoice-dapp-frontend
      const customInfo = {
        dapp_principal: "224r2-ziaaa-aaaah-aol2a-cai", // Canister ID of univoice-dapp-frontend
        wallet_principal: principal,
        nick_name: 'Angle',
        logo: 'https://example.com/logo.png',
        is_invite_code_filled: false,
        invite_code: '',
        used_invite_code: [] as [] | [string], // 使用空数组表示Candid的opt text无值状态
        total_rewards: BigInt(0),
      };
    
      add_custom_info(customInfo)
        .then((result) => {
          if ('Ok' in result) {
            console.log('Custom info added successfully');
            toastSuccess('Custom info added successfully');
          } else {
            console.log('Failed to add custom info:', result.Err);
            toastError('Failed to add custom info: ' + result.Err);
          }
        })
        .catch((error) => {
          console.error('Failed to add custom info:', error);
          toastError('Failed to add custom info: ' + error.toString());
        });
    }

  return (
    <>
      <div className="md-title">Connect Wallet</div>
      <div className={style.tip}>Choose your wallet</div>
      <div className={style.walletItem} onClick={handleLoginPlug}>
        <div className={style.iconPlug}></div>
        <div className={style.walletName}>Plug Wallet</div>
      </div>
    </>
  )
}

export default WalletLogin;