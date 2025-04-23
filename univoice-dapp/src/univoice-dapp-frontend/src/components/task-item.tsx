import { useEffect, useState } from 'react';
import style from './task-item.module.scss'
import { useAcountStore } from '@/stores/user';
import { toastInfo, toastError, toastWarn } from '@/components/toast';
import { fmtInt } from '@/utils/index';
import { update_task_status } from '@/utils/callbackend'; // Import the API function


const TaskItem = ({
    item,
    hideAction = false,
    customeClass = '',
    customeIconClass = ''
  }: {
    item: any;
    hideAction?: boolean;
    customeClass?: string;
    customeIconClass?: string;
  }) => {
  const [isComplate, setComplate] = useState(item.status === 'FINISH');
  const { getPrincipal } = useAcountStore();

  useEffect(() => {
    !isComplate && setComplate(item.status === 'FINISH');
  }, [isComplate]);

  const onTapTask = async () => {
    if (isComplate) return;

    item.task_url && openUrl();

    // todo call api
    try {
      const res = await finishTask(getPrincipal(), item.task_id);
      setComplate(true);
    } catch (error) {
      console.log('🚀 ~ onTapTask ~ error:', error);
      toastError('something wrong, please try again');
    }
  };

  const openUrl = () => {
    const w = window.open(item.task_url, '_blank');
  }

  const finishTask = async (principalId: string, taskId: string) => {
    if (!principalId || !taskId) {
      toastWarn('Missing principal ID or task ID');
      return false;
    }
    
    try {
      const result = await update_task_status(principalId, taskId, 'FINISH');
      
      if ('Ok' in result) {
        toastInfo('Task completed successfully');
        return true;
      } else if ('Err' in result) {
        console.error('Task completion error:', result.Err);
        toastError(`Contract Err: ${result.Err}`);
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error finishing task:', error);
      toastError('Failed to complete task');
      return false;
    }
  };

  return (
    <div className={`${style.task} ${customeClass} ${ hideAction || isComplate || !item.task_url ? style.disable : style.actable}`} onClick={() => !hideAction && onTapTask()}>
      <div className={`${style.taskIcon} ${customeIconClass}`}>
        <img src={item.logo || item.icon} alt="" />
      </div>
      <div className={style.taskCtx}>
        <div className={style.taskDesc}>{item.task_desc}</div>
        <div className={style.rewardsInfo}>
          <div className={style.coin}></div>
          <span>+{fmtInt(item.rewards)}</span>
        </div>
      </div>
      <div className={`${style.go} ${ hideAction || !item.task_url ? style.hiddenGo : ''}`}>
        <div className={`${style.statusIcon} ${ isComplate ? style.statusChecked : style.statusGo}`}></div>
      </div>
    </div>
  );
}

export default TaskItem;