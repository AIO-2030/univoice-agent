import { useState } from 'react'
import style from './invite-code.module.scss'
import { use_invite_code } from '../utils/callbackend'
import { WALLET_TYPE } from '@/utils/uv_const'

const BtnInviteCode = ({
  onClose
}) => {
  const [inviteCode, setInviteCode] = useState('')

  const handleSubmit = async () => {
    // TODO
    const principal = await getPrincipalWithReconnect();
    if (!principal) {
      alert('Please connect your wallet first');
      return;
    }

    const success = await handleUseInviteCode(principal);
    if (success) {
      alert('Invitation code accepted!');
    } else {
      alert('Failed to use invitation code. Please check and try again.');
      return;
    }
    onClose();
  }

  const handleInputInviteCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 6) return;
    setInviteCode(e.target.value);
  };

  const getPrincipalWithReconnect = async () => {
    const { useAcountStore } = await import('@/stores/user');
    const { getPrincipal, setUserByWallet } = useAcountStore.getState();
    
    let principal = getPrincipal();
    
    // If principal is not available, try to reconnect wallet
    if (!principal) {
      try {
        const { checkPlugReady, reConnectPlug } = await import('@/utils/icplug');
        if (checkPlugReady()) {
          const principal_id = await reConnectPlug();
          if (!principal_id) {
            console.error('Failed to reconnect to wallet');
            return null;
          }
          // Update user with reconnected wallet
          setUserByWallet(WALLET_TYPE.PLUG, principal_id);
          principal = principal_id;
        } else {
          console.error('Plug wallet extension not installed');
          return null;
        }
      } catch (error) {
        console.error('Error reconnecting to wallet:', error);
        return null;
      }
    }
    
    return principal;
  };

  const handleUseInviteCode = async (principalId: string) => {
    if (!inviteCode || inviteCode.length !== 6) {
      console.error('Invalid invite code');
      return false;
    }

    try {
      const result = await use_invite_code(inviteCode, principalId);
      if ('Ok' in result) {
        console.log('Successfully used invite code:', result.Ok);
        return true;
      } else {
        console.error('Error using invite code:', result.Err);
        return false;
      }
    } catch (error) {
      console.error('Failed to use invite code:', error);
      return false;
    }
  };

  return (
    <>
      <div className="md-title">Enter Invitation Code</div>
      <div className={style.iptInviteCode}>
        <input
          type="text"
          placeholder="Enter Invitation Code"
          value={inviteCode}
          onChange={handleInputInviteCode}
          // onChange={(e) => setInviteCode(e.target.value)}
        />
      </div>
      <div className={`${style.btnSubmit} btn-1 md-btn-1`} onClick={handleSubmit}>Submit</div>
    </>
  )
}

export default BtnInviteCode;