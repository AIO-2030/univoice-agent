import React from 'react';
import { createRef, forwardRef, useImperativeHandle, useState } from 'react'
import style from './loading.module.scss';

const Loading = forwardRef((props, ref) => {
  const [active, setActive] = useState(false)

  useImperativeHandle(ref, () => ({
    show: () => {
      setActive(true)
    },
    hide: () => {
      setActive(false)
    }
  }));

  return (

    // <div className={style.boxLoading}></div>

    // <div className={style.loader}>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    //   <span></span>
    // </div>

    // <div className={style.bars}>
    //   <div className={style.bar}></div>
    //   <div className={style.bar}></div>
    //   <div className={style.bar}></div>
    //   <div className={style.bar}></div>
    //   <div className={style.bar}></div>
    //   <div className={style.bar}></div>
    //   <div className={style.bar}></div>
    //   <div className={style.bar}></div>
    //   <div className={style.bar}></div>
    //   <div className={style.bar}></div>
    // </div>
    <>
    { active &&
    <div className={style.wrapper}>
      <div className={style.wavy}>
        <span className={style.bar}>l</span>
        <span className={style.bar}>o</span>
        <span className={style.bar}>a</span>
        <span className={style.bar}>d</span>
        <span className={style.bar}>i</span>
        <span className={style.bar}>n</span>
        <span className={style.bar}>g</span>
        <span className={style.bar}>.</span>
        <span className={style.bar}>.</span>
        <span className={style.bar}>.</span>
      </div>
    </div>
    }
    </>
  );
})
// export default React.memo(Loading);


const LoadingRef = createRef<{ show: () => {}, hide: () => {} }>();

export const LoadingContain = () => {
  return <Loading ref={LoadingRef} />
}

export const showLoading = () => {
  if (LoadingRef.current) {
    LoadingRef.current.show()
  }
}

export const hideLoading = () => {
  if (LoadingRef.current) {
    LoadingRef.current.hide()
  }
}