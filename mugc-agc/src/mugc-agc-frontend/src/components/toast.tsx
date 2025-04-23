import { createRef, forwardRef, useImperativeHandle, useState } from 'react'
import style from './toast.module.scss'

const Toast = forwardRef((props, ref) => {
  const [toasts, setToasts] = useState([])

  useImperativeHandle(ref, () => ({
    show: (message: string, mtype: string) => {
      addToast(message, mtype)
    }
  }));

  const addToast = (message, mtype) => {
    const id = Date.now()
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, message, mtype }
    ])
    
    setTimeout(() => {
      removeToast(id)
    }, 5000);
  }

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter(toast => toast.id !== id));
  }

  return (
    <div className={style.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${style.toast} ${style['t_' + toast.mtype]}`}>
          <div className={style.wrap}>
            <div className={style.icon}></div>
            <div className={style.ctx}>
              {toast.mtype === 'warn' && <div className={style.title}>Warning</div>}
              {toast.mtype === 'error' && <div className={style.title}>Error</div>}
              {toast.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

const ToastRef = createRef<{ show: (msg: string, mtype: string) => {} }>();

export const ToastContain = () => {
  return <Toast ref={ToastRef} />
}

export const showToast = (msg: string, mtype: string = 'info') => {
  if (ToastRef.current) {
    ToastRef.current.show(msg, mtype)
  }
}