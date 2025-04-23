import { useState, useEffect } from 'react'
import style from './home.module.scss'
import WalletLogin from '@/components/wallet-login'
import InviteCode from '@/components/invite-code'
import RecordVoice from '@/components/record-voice'
import { useAcountStore } from '@/stores/user';
import mainImg from '@/assets/imgs/home.gif'
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/modal-dialog'

function HomePage() {
  const navigate = useNavigate();
  const { getPrincipal, getExInfo } = useAcountStore();

  const getPrincipalStr = (len1: number, len2: number) => {
    const pid = getPrincipal()
    return pid.substring(0, len1) + '...' + pid.substring(pid.length - len2);
  }

  const handleSelf = () => {
    navigate('/self');
  }

  const [mInviteCodeOpen, setMInviteCodeOpen] = useState(false)
  const onCloseMInviteCode = () => {
    setMInviteCodeOpen(false)
  }
  const openMInviteCode = () => {
    setMInviteCodeOpen(true)
  }

  const [mLoginOpen, setMLoginOpen] = useState(false)
  const onCloseMLogin = () => {
    setMLoginOpen(false)
  }
  const openMLogin = () => {
    setMLoginOpen(true)
  }

  const [mRecordOpen, setMRecordOpen] = useState(false)
  const onCloseMRecord = () => {
    setMRecordOpen(false)
  }
  const openMRecord = () => {
    setMRecordOpen(true)
  }

  return (
    <div className="uvpage">
      <div className={style.homeContainer}>
        <div className={style.homeBody}>
          <div className={style.bodyCtx}>
            <div className={style.homeIp}>
              <img src={mainImg} alt="main" />
            </div>
            <div className={`${style.gradientHeading} ${style.slogan}`}>
              <div>I'm Univoice</div>
              <div>I'm Undefined</div>
            </div>
          </div>
        </div>
        <div className="btm-ph"></div>
        {getPrincipal() &&
        <div className={style.userpanel}>
          <div className={style.userInfo} onClick={handleSelf}>
            <div className={style.avatar}></div>
            <div className={style.name}>{getPrincipalStr(3,2)}</div>
          </div>
          { !getExInfo().is_invite_code_filled &&
          <div className={style.inviteCode}>
            <div className={style.inviteCodeWrapper} onClick={openMInviteCode}>Invite Code</div>
          </div>
          }
        </div>
        }
        <div className={style.wallet}>
          <div className={style.walletWrapper} onClick={openMLogin}>
            <div className={style.walletIcon}></div>
          </div>
        </div>
        <div className={style.record}>
          <div className={style.btnOpenRecord} onClick={openMRecord}>Click to start Recording</div>
        </div>
      </div>
      <Modal
        isOpen={mInviteCodeOpen} onClose={onCloseMInviteCode} overlayClassName={undefined} contentClassName={undefined}>
        <InviteCode onClose={onCloseMInviteCode} />
      </Modal>
      <Modal
        isOpen={mLoginOpen} onClose={onCloseMLogin} overlayClassName={undefined} contentClassName={undefined}>
        <WalletLogin onClose={onCloseMLogin} />
      </Modal>
      <Modal
        isOpen={mRecordOpen} onClose={onCloseMRecord} overlayClassName={style.mRecord} contentClassName={style.modalContent}>
        <RecordVoice onClose={onCloseMRecord} />
      </Modal>
    </div>
  );
}
  
export default HomePage;