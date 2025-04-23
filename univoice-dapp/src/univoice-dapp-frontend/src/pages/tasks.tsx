import { useEffect, useState } from 'react';
import style from './tasks.module.scss'
import TaskItem from '@/components/task-item';
import { useNavigate } from 'react-router-dom';
import IconX from '@/assets/svg/logo_twitter.svg'
import IconTG from '@/assets/svg/logo_telegram.svg'
import IconYTB from '@/assets/svg/logo_YouTuBe.svg'
import { get_user_tasks } from '@/utils/callbackend'; // Import the API function
import { useAcountStore } from '@/stores/user'
import { WALLET_TYPE} from '@/utils/uv_const'


function TasksPage() {
  const navigate = useNavigate();

  const initList = [
    {
      icon: IconX,
      task_desc: 'Follow Our Twitter',
      isComplete: false,
    }, {
      icon: IconTG,
      task_desc: 'Jion Our TG Community',
      isComplete: false,
    }, {
      icon: IconTG,
      task_desc: 'Jion Our TG Channel',
      isComplete: false,
    }, {
      icon: IconYTB,
      task_desc: 'Follow Our YouTuBe',
      isComplete: false,
    },
  ];

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      // Get principal ID - you'll need to implement this based on your authentication system
      const principalId = await principal_id(); // Get principal ID using the defined function
      if (!principalId) {
        console.error("No principal ID available");
        setTasks(initList); // Use initial list if no principal ID
        return;
      }

      // Call backend to get user tasks
      const userTasks = await get_user_tasks(principalId);

      if (userTasks && userTasks.length > 0) {
        // Merge backend data with UI display data
        const newList = userTasks.map((item: any, idx: number) => {
          // Make sure we don't go out of bounds of initList
          const uiData = idx < initList.length ? initList[idx] : {};
          return {
            ...uiData,
            ...item,
          };
        });

        setTasks(newList);
      } else {
        // If no tasks returned from backend, use initial list with default values
        const defaultList = initList.map((item, idx) => {
          return {
            ...item,
            task_id: ['Follow_X', 'Follow_TG_Community', 'Follow_TG_Channel', 'Follow_YouTuBe'][idx] || '',
            task_url: [
              'https://x.com/UNIVOICE_',
              'https://t.me/univoiceofficial',
              'https://t.me/+S3WQWidjW9lkZTU1',
              ''
            ][idx] || '',
            status: '',
            rewards: 5000
          };
        });

        setTasks(defaultList);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setTasks([]);
    }
  }

  const handleGoFriends = () => {
    navigate('/friends');
  };

  const principal_id = () => {
    const principalId = useAcountStore.getState().getPrincipal();

    if (!principalId) {
      // Attempt to reconnect to plug and get principal
      const getPlugConnect = async () => {
        try {
          const { reConnectPlug, getPlugPrincipal } = await import('@/utils/icplug');
          await reConnectPlug();
          const newPrincipalId = await getPlugPrincipal();

          if (newPrincipalId) {
            useAcountStore.getState().setUserByWallet(WALLET_TYPE.PLUG, newPrincipalId);
            return newPrincipalId;
          }
        } catch (error) {
          console.error("Failed to reconnect to plug wallet:", error);
        }
        return '';
      };

      return getPlugConnect();
    }

    return principalId;

  }

  return (
    <div className={style.pgTasks}>
      <div className={style.intro}>
        <div className={style.introImg}></div>
        <div className={style.introTitle}>EARN MORE COINS</div>
        <div className={style.introTxt}>
          <p>Score 5% of your buddies</p>
          <p>+ an extra 1% from their referrals</p>
        </div>
      </div>

      <div className={style.pTitle}>
        <div className={style.currentTab}>
          <div>Socials</div>
          <div className={style.currentSymbol}></div>
        </div>
        <div className={style.lnk} onClick={handleGoFriends}>Friends</div>
      </div>
      <div>
        {tasks.map((item: any, index) => {
          return (
            <TaskItem
              hideAction={false}
              customeClass={'customeClass'}
              customeIconClass={'customeIconClass'}
              item={item}
              key={`item_keys_${index}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default TasksPage;