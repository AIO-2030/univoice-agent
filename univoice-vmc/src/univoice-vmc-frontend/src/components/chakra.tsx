import { Key, useState } from 'react';
import style from './chakra.module.scss'
import {update_chakra_data,query_chakra_data} from '@/utils/call_vmc_backend'
import { useAcountStore } from '@/stores/user';
import type {ChakraItem} from 'declarations/univoice-vmc-backend/univoice-vmc-backend.did';

function ChakraComponent( props:{ idx: number, clickcnt: number } ) {
  const [totalClick, setTotalClick] = useState(0);
  const [bubbles, setBubbles] = useState([])
  const { getPrincipal } = useAcountStore();

  
  const clickChakra = () => {
    addBubble()
    sendToBackendStore();
  }

  const sendToBackendStore = () => {
    let principal_id = getPrincipal();
    console.log("Save chakra with", props.idx, props.clickcnt+totalClick);
    let idx_param = props.idx;
    let click_param = props.clickcnt+totalClick;

     query_chakra_data(getPrincipal()).then(
           resultItem =>{
           let dataItem = {
             pricipalid_txt: principal_id,
             cnt1 : resultItem.cnt1,
             cnt2 : resultItem.cnt2,
             cnt3 : resultItem.cnt3,
             cnt4 : resultItem.cnt4,
             cnt5 : resultItem.cnt5,
             cnt6 : resultItem.cnt6,
             cnt7 : resultItem.cnt7
           };
           if (idx_param ==1)  {
             dataItem.cnt1 = BigInt(click_param);
           }
           if (idx_param ==2)  {
            dataItem.cnt2 = BigInt(click_param);
           }
           if (idx_param ==3)  {
            dataItem.cnt3 = BigInt(click_param);
           }
           if (idx_param ==4)  {
            dataItem.cnt4 = BigInt(click_param);
           }
           if (idx_param ==5)  {
            dataItem.cnt5 = BigInt(click_param);
           }
           if (idx_param ==6)  {
            dataItem.cnt6 = BigInt(click_param);
           }
           if (idx_param ==7)  {
            dataItem.cnt7 = BigInt(click_param);
           }
           update_chakra_data(dataItem);
         }
         

        );

  }
  
  // heart bubble
  const addBubble = () => {
    const id = Date.now()
    const swing = Math.floor(Math.random() * 4) + 1
    const speed = Math.floor(Math.random() * 2) + 1
    const b = {
      id: id,
      swing: swing,
      speed: speed
    }
    console.log(swing)
    setBubbles((prevBubbles) => [
      ...prevBubbles,
      b
    ])
    
    setTimeout(() => {
      removeBubble(id)
    }, 2600);

    setTotalClick(totalClick + 1)
  }

  const removeBubble = (id) => {
    setBubbles((prevBubbles) => prevBubbles.filter(b => b.id !== id));
  }

  return (
    <div className={`${style.chakra} ${style['chakra_' + props.idx]}`}>
      <div className={`${props.idx % 2 === 1 ? style.chakra_right : style.chakra_left}`}>
        <div className={style.chakra_circle} onClick={clickChakra}></div>
        <div className={style.heart}></div>
        <div className={style.chakra_click_count}>{props.clickcnt + totalClick}</div>
        <div className={style.fade_area}>
        {bubbles.map((el: { id: Key | null | undefined; swing: number; speed: number; }) => (
          <div key={el.id} className={`${style.bubble} ${style.b1} ${style['bl_' + el.swing + '_' + el.speed]}`}></div>
        ))}
        </div>
      </div>
    </div>
  )
}
export default ChakraComponent;