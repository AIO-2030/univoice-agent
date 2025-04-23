import { useEffect, useState } from 'react';
import style from './friends.module.scss'
import { useNavigate } from 'react-router-dom';
import { useAcountStore } from '@/stores/user';
import { fmtInt } from '@/utils/index';
import Modal from '@/components/modal-dialog'
import Default_Avatar from '@/assets/imgs/user_avatar.png'
// Remove the top-level await import
import { WALLET_TYPE } from '@/utils/uv_const'
import { get_friend_infos } from '@/utils/callbackend'; // Add this import


function FriendsPage() {
  const navigate = useNavigate();
  
  const { getPrincipal } = useAcountStore();
  const [list, setList] = useState<any[]>([]);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    initData();
  }, []);

  const getInviteCode = async () => {
    try {
      // Dynamically import the module inside the function
      const { get_custom_info } = await import('@/utils/callbackend');
      // Check if principal is available, if not try to reconnect
      const principal = getPrincipal();
      if (!principal) {
        console.log('Principal not found, attempting to reconnect wallet');
        try {
          const { checkPlugReady, reConnectPlug } = await import('@/utils/icplug');
          if (checkPlugReady()) {
            const principal_id = await reConnectPlug();
            if (!principal_id) {
              console.error('Failed to reconnect to wallet');
              return '';
            }
            // Update user with reconnected wallet
            const { useAcountStore } = await import('@/stores/user');
            const { setUserByWallet } = useAcountStore.getState();
            setUserByWallet(WALLET_TYPE.PLUG, principal_id);
            const { add_custom_info } = await import('@/utils/callbackend');
            const customInfo = {
              dapp_principal: "224r2-ziaaa-aaaah-aol2a-cai",
              wallet_principal: principal_id,
              nick_name: '',
              logo: 'https://example.com/logo.png',
              is_invite_code_filled: false,
              invite_code: '',
              used_invite_code: [] as [] | [string],
              total_rewards: BigInt(0),
            };

            try {
              const result = await add_custom_info(customInfo);
              if ('Ok' in result) {
                console.log('Custom info added successfully');
              } else {
                console.error('Failed to add custom info:', result.Err);
              }
            } catch (error) {
              console.error('Failed to add custom info:', error);
            }
          } else {
            console.error('Plug wallet extension not installed');
            return '';
          }
        } catch (error) {
          console.error('Error reconnecting to wallet:', error);
          return '';
        }
      }
      const result = await get_custom_info(null,getPrincipal());
      
      if (result && result.invite_code) {
        setInviteCode(result.invite_code);
        return result.invite_code;
      } else if (result && result.err) {
        console.error('Error getting invite code:', result.err);
        return '';
      } else {
        console.warn('Invalid response format for invite code',result);
        return '';
      }
    } catch (error) {
      console.error('Failed to get invite code:', error);
      return '';
    }
  }

  const initData = async () => {
    try {
      const principal = getPrincipal();
      if (!principal) {
        console.error('Principal not found');
        return;
      }
      
      const result = await get_friend_infos(principal);
      setList(result.friends);
    } catch (error) {
      console.error('Failed to fetch friend data:', error);
      // Fallback to sample data in case of error
      const fallbackData = {
        friends: [
        ]
      };
      setList(fallbackData.friends);
    }
    
    // Call the function directly since it's now properly defined as async
    getInviteCode();
  }

  const handleGoTasks = () => {
    navigate('/tasks');
  };

  const [mCodeOpen, setMCodeOpen] = useState(false)
  const onCloseMCode = () => {
    setMCodeOpen(false)
  }
  const openMCode = () => {
    setMCodeOpen(true)
  }

  const handleClickCopyCode = () => {
    try {
      // Try the modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inviteCode)
          .then(() => {
            alert('Invite code copied to clipboard!');
          })
          .catch(err => {
            // Fallback to execCommand if Clipboard API fails
            fallbackCopyToClipboard(inviteCode);
          });
      } else {
        // Fallback for browsers that don't support Clipboard API
        fallbackCopyToClipboard(inviteCode);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Could not copy invite code. Please try manually selecting and copying it.');
    }
  }

  const fallbackCopyToClipboard = (text: string) => {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make it invisible but part of the document
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      // Execute the copy command
      const successful = document.execCommand('copy');
      if (successful) {
        alert('Invite code copied to clipboard!');
      } else {
        alert('Unable to copy invite code');
      }
    } catch (err) {
      console.error('Error copying text: ', err);
      alert('Could not copy invite code. Please try manually selecting and copying it.');
    }
    
    // Clean up
    document.body.removeChild(textArea);
  }

  return (
    <div className={style.pgFriends}>
      <div className={style.intro}>
        <div className={style.introImg}></div>
        <div className={style.introTitle}>EARN MORE COINS</div>
        <div className={style.introTxt}>
          <p>Score 5% of your buddies</p>
          <p>+ an extra 1% from their referrals</p>
        </div>
      </div>
      
      <div className={style.pTitle}>
        <div className={style.lnk} onClick={handleGoTasks}>Socials</div>
        <div className={style.currentTab}>
          <div>Friends</div>
          <div className={style.currentSymbol}></div>
        </div>
      </div>
      {
      list.length === 0 ? 
      <div className="nodata">
        <div className="nodata-img"></div>
        <div className="nodata-txt">You haven't invited anyone yet</div>
      </div>
      :
      <div className={style.friends}>
        <div className={style.friendCount}><span>{list.length}</span>Friends</div>
      {list.map((item: any, index) => (
        <div key={index} className={style.friend}>
          <div className={style.avatar}><img src={item.avatar || Default_Avatar} alt="" /></div>
          <div className={style.infoBox}>
            <div className={style.info}>
              <div className={style.name}>{item.name}</div>
              <div className={style.cnt}><div className={style.cntIcon}></div>{item.friendnum}</div>
            </div>
            <div className={style.rewardsInfo}>
              <div className={style.coin}></div>
              <span>+{fmtInt(item.rewards)}</span>
            </div>
          </div>
        </div>
      ))}
      </div>
      }
      {inviteCode &&
      <div className={style.btnInvite} onClick={openMCode}>
        <div className={style.icon}></div>
        <span>INVITE FRIENDS</span>
      </div>
      }
      <Modal
        isOpen={mCodeOpen} onClose={onCloseMCode} overlayClassName={undefined} contentClassName={undefined}>
        <div className="md-title">Your Invitation Code</div>
        <div className={style.myInviteCode}>{inviteCode}<div className={style.copyIcon} onClick={handleClickCopyCode}></div></div>
        <div className={style.inviteTip}>Invite your friends to fill in this code</div>
      </Modal>
    </div>
  );
}
      
export default FriendsPage;