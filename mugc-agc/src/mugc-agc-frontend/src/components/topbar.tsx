import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { plugReady, reConnectPlug, callBalance, initPlug } from '@/utils/icplug';
import { useAcountStore } from '@/stores/user';
import { fmtUvBalance } from '@/utils';
import style from './topbar.module.scss'

const TopBar = (props:any, ref:any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState('');
  const [isLinkWallet, setIsLinkWallet]= useState<boolean>();
  const { setUserByPlugWallet, clearAccount, getUid, getPrincipal, getBalance, setBalance, getWalletType } = useAcountStore();
  const [showProfile, setShowProfile] = useState(false)

  useImperativeHandle(ref, () => ({
    hideProfile: () => {
      setShowProfile(false)
    }
  }))

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const clickHome = () => {
    if (currentPath === '/') return
    navigate('/')
    // navigate('/', { replace: true })
  }

  const clickWallet = () => {
    if (getUid()) {
      return;
    }
    const pReady = plugReady();
    if (!pReady) {
      alert('Please install plug-wallet extension first');
    } else {
      loginPlug();
    }
  }

  const clickProfile = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation()
    reverseShowProfile()
  }

  const clickProfilePanel = (e: { stopPropagation: () => void; }) => {
    e.stopPropagation()
  }

  const loginPlug = () => {
    reConnectPlug()
      .then((principal_id) => {
        console.log('reConnectPlug done, pid:', principal_id)
        if (principal_id) {
          setIsLinkWallet(true);
           callBalance(principal_id).then(
               (tokenstr) =>{
                   console.log('callBalance done, tokens:', tokenstr);
                   setBalance(Number(tokenstr));
               }
          );          
          setUserByPlugWallet(principal_id);
        }
      }).catch((e) => {
        console.log('reConnectPlug exception!', e)
      })
  }
  const clickA = () => {
    initPlug()
  }

  const getPrincipalStr = (len1: number, len2: number) => {
    const pid = getPrincipal()
    // callBalance(pid).then((token_str) =>{
    //      console.log('callBalance done, tokens:', token_str);
    //     }
    // );
    return pid.substring(0, len1) + '...' + pid.substring(pid.length - len2);
  }

  const reverseShowProfile = () => {
    setShowProfile(!showProfile)
  }

  const clickCopyAccountId = () => {
    navigator.clipboard.writeText(getPrincipal())
  }

  const clickMyUnivoice = () => {
    reverseShowProfile()
    if (currentPath === '/myunivoice') return
    navigate('/myunivoice')
  }

  const clickDisconnect = () => {
    reverseShowProfile()
    clearAccount()
    setIsLinkWallet(false)
  }

  return (
    <div className={style.container}>
      <div className={style.uvlogo} onClick={clickHome}></div>
      <div className={style.bar}>
        <a href="https://x.com/UNIVOICE_" target='_blank'><div className={style.btn_round}>
          <div className={`${style.lnkicon} ${style.x}`}></div>
        </div></a>
        <div className={style.btn_split}></div>
        <a href="https://t.me/univoiceofficial" target='_blank'><div className={style.btn_round}>
          <div className={`${style.lnkicon} ${style.telegram}`}></div>
        </div></a>
        { getPrincipal() === ''? 
        <div className={style.wallet_no_link} onClick={clickWallet}>
          <div className={style.wallet_no_link_bg}></div>
          <div className={style.ctx}>Connect wallet</div>
        </div>
        :
        <div className={style.wallet_linked_wrap}>
          <div className={style.wallet_linked} onClick={clickProfile}>
            <div className={`${style.wallet_icon} ${style['wallet_icon_' + getWalletType()]}`}></div>
            <div className={style.wallet_txt}>{getPrincipalStr(5, 3)}</div>
            <div className={`${showProfile ? style.arrow_up : style.arrow_down}`}></div>
            { showProfile  && 
            <div className={style.profile} onClick={clickProfilePanel}>
              <div className={style.r}>
                <div className={style.label}>Principal ID</div>
                <div className={style.principal_info}>
                  <div>{getPrincipalStr(8, 11)}</div>
                  <div className={style.copy} onClick={clickCopyAccountId}></div>
                </div>
              </div>
              <div className={style.r}>
                <div className={style.myuv_border} onClick={clickMyUnivoice}>
                  <div className={style.myuv}>
                    <div>My Univoice</div>
                    <div className={style.icon}></div>
                  </div>
                </div>
              </div>
              <div className={`${style.split} ${style.bottom_row}`}>
                <div className={style.btn_disconn} onClick={clickDisconnect}>
                  <div className={style.icon}></div>
                  <div>Disconnect</div>
                </div>
              </div>
            </div>
          }
          </div>
        </div>
        }
        {/* <div className="m-[10px]" onClick={clickA}>A</div> */}
      </div>
    </div>
  )
}
export default forwardRef(TopBar);