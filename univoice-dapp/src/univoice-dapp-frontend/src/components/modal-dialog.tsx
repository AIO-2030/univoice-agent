import { useState, useEffect } from 'react'
// import style from './btn-wallet-login.module.scss'

const ModalDialog = ({
  isOpen,
  onClose, 
  children, 
  closeOnOverlayClick = true,
  showCloseButton = true,
  overlayClassName,
  contentClassName
}) => {

  const stopPropagation = (e) => {
    e.stopPropagation();
  }

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`${'modal-dialog'} ${overlayClassName ? overlayClassName : ''}`}
      onClick={closeOnOverlayClick ? onClose : null}>
      <div className={`${'modal-content'} ${contentClassName ? contentClassName : ''}`} onClick={stopPropagation}>
        <div className="md-ctx-wrapper">
          {children}
        </div>
        {showCloseButton &&
        <div className="close-icon" onClick={onClose}>&times;</div>
        }
      </div>
    </div>
  )
}

export default ModalDialog;