import { useEffect, useState } from 'react';
import { fmtInt, fmtUvBalance, fmtTimestamp, fmtSummaryAddr } from '@/utils';
import { call_tokens_of, getWalletPrincipal, queryBalance as queryWalletBalance, transfer } from '@/utils/wallet'
import style from './self.module.scss'
import ImgNftThum from '@/assets/imgs/nft_thum.png'
import { toastSuccess, toastError, toastWarn } from '@/components/toast';
import { ERROR_MSG } from '@/utils/uv_const';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/modal-dialog'
import { showLoading, hideLoading } from '@/components/loading'

// import {fetch_sumary_for_myvoice, claim_to_account_by_principal, get_miner_jnl} from "@/utils/call_dapp_backend";
import { useAcountStore } from '@/stores/user';
import { calculate_total_claimable_rewards, get_unclaimed_rewards } from '@/utils/callbackend';
function SelfPage() {
  const navigate = useNavigate();

  const [summaryData, setSummaryData] = useState({
    rewards: '',
    claimable: '',
  });
  const [licenseData, setLicenseData] = useState<any>([]);
  const [claimable, setClaimable] = useState(true)
  const { getPrincipal } = useAcountStore();
  const [walletBalance, setWalletBalance] = useState('')

  const handleBack = () => {
    window.history.back();
  };

  const handleGoDashboard = () => {
    navigate('/dashboard');
  };

  const refreshBalance = () => {
    if (getPrincipal() === '') {
      return
    }
    queryWalletBalance().then((balance) => {
      if (balance) {
        setWalletBalance(Number(balance).toString())
      }
    }).catch((e) => {
      setWalletBalance('')
      toastWarn('Failed to query balance data: ' + e.toString())
    })
  }

  const getPrincipalStr = (len1: number, len2: number) => {
    const pid = getPrincipal()
    return pid.substring(0, len1) + '...' + pid.substring(pid.length - len2);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    getWalletPrincipal().then(pid => {
      if(pid){
        refreshBalance();
        loadSummary();
        loadLicense();
      }
    }).catch(e => {
      toastError('Failed to load page data: ' + e.toString())
    });
  }, [getPrincipal()]);
  
  const loadSummary = async () => {
    let data={
      rewards: '',
      claimable: '',
    };
    
    const principal_id = getPrincipal();
    if(!principal_id) {
      // toastWarn('Failed to query my performance data: ' + ERROR_MSG.USER_NOT_AUTH)
      return;
    }
    // fetch_sumary_for_myvoice(principal_id)
    //   .then( sum_tokens => {
    //     data.claimable = String(sum_tokens.sum_unclaimed);
    //     data.rewards = String(sum_tokens.sum_claimed);
    //     setSummaryData(data);
    //   }).catch(e => {
    //     toastWarn('Failed to query my performance data!')
    //   });
    // Import the calculate_total_claimable_rewards function

    // Use the function to get the claimable rewards
    try {
      const claimableRewards = await calculate_total_claimable_rewards(principal_id);
      data.claimable = claimableRewards.toString();
    } catch (error) {
      console.error("Error calculating claimable rewards:", error);
      toastWarn('Failed to fetch claimable rewards data');
      data.claimable = '0';
    }

    // Set initial rewards to 0 until we have a proper function to fetch it
    try {
      const unclaimedRewards = await get_unclaimed_rewards(principal_id);
      data.rewards = unclaimedRewards.toString();
    } catch (error) {
      console.error("Error fetching unclaimed rewards:", error);
      toastWarn('Failed to fetch rewards data');
      data.rewards = '0';
    }
    setSummaryData(data);
  }

  const catchNftImgFail = (event) => {
    event.target.src = ImgNftThum
  }

  const loadLicense = () => {
    const dataItem ={ 
       id: 1,
       imgurl: 'https://bafybeibhnv326rmac22wfcxsmtrbdbzjzn5mviykq3rbt4ltqkqqfgobga.ipfs.w3s.link/thum.jpg',
       idx: '01',
       intro: 'Univoice listener',
       quantity: 1,
       myhashs: ''
    }

    const data = [];
              
    call_tokens_of().then(tokenIds=>{
      let owner_cnt = 0;
      let myhash_str = "";
      console.log("Origin nft tokens is",tokenIds);

      for (let token_id in tokenIds) {
        console.log("hold license of token_id", tokenIds[token_id]);
        owner_cnt +=1;
        myhash_str += '#'+tokenIds[token_id]+',';
      }
      dataItem.myhashs = myhash_str;
      dataItem.quantity = owner_cnt;
      dataItem.imgurl = ImgNftThum;
      if (owner_cnt > 0) {
        data[0] = dataItem;
      }
      console.log('data', data)
      setLicenseData(data);
    })      
  }

  

  const clickClaim = () => {
    if(!getPrincipal()){
      toastWarn('Failed to claim rewards: ' + ERROR_MSG.USER_NOT_AUTH)
      return
    }
    // TODO
    // claim_to_account_by_principal(getPrincipal()).then(trans_tokens=>{
    //   toastSuccess("You have claimed "+String(trans_tokens)+" success. You can recheck by your wallet.");
    //   loadSummary();
    //   setClaimable(false)
    // });
  }

  const [mSendOpen, setMSendOpen] = useState(false)
  const onCloseMSend = () => {
    setMSendOpen(false)
  }
  const openMSend = () => {
    setSendTargetPId('')
    setSendAmount('')
    setMSendOpen(true)
  }

  const [mReceiveOpen, setMReceiveOpen] = useState(false)
  const onCloseMReceive = () => {
    setMReceiveOpen(false)
  }
  const openMReceive = () => {
    setMReceiveOpen(true)
  }

  const handleClickCopyPrincipal = () => {
    navigator.clipboard.writeText(getPrincipal())
  }

  const [sendTargetPId, setSendTargetPId] = useState('')
  const [sendAmount, setSendAmount] = useState('')

  // const handleInputSendTarget = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.value.length > 6) return;
  //   setSendTargetPId(e.target.value);
  // };

  const handelInputSendAmout = (val: string) => {
    if (val.length == 0) {
      setSendAmount(val)
      return
    }
    val = val.replace(/[^\d]/g, ''); // number only
    setSendAmount(val)
  }

  const handleSubmitSend = () => {
    if (!sendTargetPId || !sendAmount) {
      toastWarn('Please enter both target ID and amount');
      return;
    }

    const amount = parseInt(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toastWarn('Please enter a valid amount');
      return;
    }

    // Check if wallet balance is sufficient
    const currentBalance = parseInt(walletBalance || '0');
    if (amount > currentBalance) {
      toastError(ERROR_MSG.INSUFFICIENT_FUNDS);
      return;
    }
    openMSendConfirm();
  }

  const [mSendConfirmOpen, setMSendConfirmOpen] = useState(false)
  const onCloseMSendConfirm = () => {
    setMSendConfirmOpen(false)
  }
  const openMSendConfirm = () => {
    setMSendConfirmOpen(true)
  }

  const handleConfirmSend = async () => {
    onCloseMSendConfirm()
    if (!sendTargetPId || !sendAmount) {
      toastWarn('Please enter both target ID and amount');
      return;
    }

    const amount = parseInt(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toastWarn('Please enter a valid amount');
      return;
    }

    // Check if wallet balance is sufficient
    const currentBalance = parseInt(walletBalance || '0');
    if (amount > currentBalance) {
      toastError(ERROR_MSG.INSUFFICIENT_FUNDS);
      return;
    }

    showLoading()
    transfer(sendTargetPId, amount)
      .then((txId) => {
        hideLoading()
        toastSuccess(`Transfer successful! Transaction ID: ${txId}`);
        refreshBalance(); // Refresh balance after successful transfer
        onCloseMSend()
      })
      .catch((error) => {
        hideLoading()
        console.error('Error send $uvc:', error);
        toastError(`Transfer failed: ${error}`);
      });
  }
  
  return (
    <div className="main-container">
      <div className="top-nav-bar">
        <div className={style.topBarWrapper}>
          <div className={style.btnBack} onClick={handleBack}></div>
          <div className={style.welcome}>Welcome</div>
        </div>
      </div>
      <div className="uvpage-2">
        <div className={style.pgSelf}>

          <div className={style.userInfo}>
            <div className={style.avatar}></div>
            <div className={style.col2}>
              <div className={style.name}>{getPrincipalStr(5,3)}</div>
              <div className={style.btnGoDashboard} onClick={handleGoDashboard}>
                <span>Dashboard</span>
                <div className={style.icon}></div>
              </div>
            </div>
          </div>

          <div className={style.dataPanel}>
            <div className={style.mainPanel}>
              <div className={style.selfData}>
                <div className={style.accInfo}>
                  <div className={style.label}><p>Total</p><p>Balance</p></div>
                  <div className={style.amountInfo}>
                    <div className={style.unit}>$UVC</div>
                    <div className={style.amount}>{
                      walletBalance ==='' ?
                      '--' :
                      fmtUvBalance(walletBalance)
                    }</div></div>
                </div>
                <div className={style.opBalance}>
                  <div className={style.btn} onClick={openMSend}>
                    <div className={style.btnIconSend}></div>
                    <p>Send</p>
                  </div>
                  <div className={style.btn} onClick={openMReceive}>
                    <div className={style.btnIconReceive}></div>
                    <p>Receive</p>
                  </div>
                </div>
                <div className={style.accInfo}>
                  <div className={style.label}><p>Claimable</p><p>Rewards</p></div>
                  <div className={style.amountInfo}>
                    <div className={style.unit}>$UVC</div>
                    <div className={style.amount}>{summaryData.claimable === '' ? '--' : fmtUvBalance(summaryData.claimable)}</div></div>
                </div>
                <div className={style.btnClaim}>Claim</div>
              </div>
            </div>
            <div className={style.bg2}></div>
            <div className={style.bg1}></div>
          </div>

          <div className={style.licensePanel}>
            <div className={style.titleBar}>
              <div className={style.title}>Licenses holded</div>
              <div className={style.btnGetMore} onClick={handleGoDashboard}>
                <div className={style.icon}></div>
                <span>Get More</span>
              </div>
            </div>
          </div>

          {
          licenseData.length === 0 ? 
          <div className="nodata">
            <div className="nodata-img"></div>
            <div className="nodata-txt">No data</div>
          </div>
          :
          <div className={style.nfts}>
            {licenseData.map((el: { id: string; imgurl: string; intro: string; quantity: number}) => (
            <div key={el.id} className={`${style.nft} aspect-ratio-1-1`}>
              <div className={`${style.nft_wrap} aspect-ratio-wrap`}>
                <img className={`img-fixed ${style.img}`} src={el.imgurl} onError={catchNftImgFail} />
                <div className={style.info}>
                  <div className={style.infoctx}>
                    <div className={style.intro}>{el.intro}</div>
                    <div className={style.quantity}>
                      <div className={style.lab}>Quantity</div>
                      <div>+{el.quantity}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
          }
        </div>
      </div>
      <Modal
        isOpen={mReceiveOpen} onClose={onCloseMReceive} overlayClassName={undefined} contentClassName={undefined}>
        <div className="md-title"></div>
        <div className={style.modalMyPId}><div className={style.pid}>{getPrincipal()}</div><div className={style.copyIcon} onClick={handleClickCopyPrincipal}></div></div>
        <div className={style.modalTip}>Please inform the other party of this ID</div>
      </Modal>
      <Modal
        isOpen={mSendOpen} onClose={onCloseMSend} overlayClassName={undefined} contentClassName={undefined}>
        <div className="md-title">Send</div>
        
        <div className={style.sendLabel}>Principal ID</div>
        <div className={style.iptSend}>
          <textarea
            rows={3}
            placeholder="Enter Target Principal ID"
            value={sendTargetPId}
            onChange={(e) => setSendTargetPId(e.target.value)}
          ></textarea>
        </div>
        <div className={style.sendLabel}>Amount</div>
        <div className={style.iptSend}>
          <input
            type="text"
            placeholder="Enter amount of tokens to send"
            value={sendAmount}
            onChange={(e) => handelInputSendAmout(e.target.value)}
          />
        </div>
        <div className={`${style.btnSubmitSend} btn-1 md-btn-1`} onClick={handleSubmitSend}>Confirm Send</div>
      </Modal>
      <Modal
        isOpen={mSendConfirmOpen} onClose={onCloseMSendConfirm} overlayClassName={style.abc} contentClassName={style.cdf}>
        <div className="md-title">Confirm</div>
        <div className={style.sendConfirm}>Are you sure you want to transfer <span className={style.amount}>{fmtUvBalance(sendAmount)}</span> <span className={style.unit}>$UVC</span> from your account to this PRINCIPAL ID?</div>
        <div className={style.sendConfirmPid}>{sendTargetPId}</div>
        <div className={style.modalBtns}>
          <div className={style.modalBtnOK} onClick={handleConfirmSend}>OK</div>
          <div className={style.modalBtnCancel} onClick={onCloseMSendConfirm}>Cancel</div>
        </div>
      </Modal>
    </div>
  );
}
    
export default SelfPage;