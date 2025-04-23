import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import style from './footbar.module.scss'

const FootBar = (option:any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState('');
  const callHomeGoAnchor = (anchor: any) => {
    if (option.homeGoAnchor) {
      option.homeGoAnchor(anchor)
    } else {
      navigate('/' + anchor)
    }
  }

  useEffect(() => {
    setActive(location.pathname);
  }, [location]);

  const clickHome = () => {
    callHomeGoAnchor('#home')
    // if (active === '/') return
    // navigate('/')
    // navigate('/', { replace: true })
  }
  const clickPartner = () => {
    callHomeGoAnchor('#ptn')
  }
  const clickVision = () => {
    callHomeGoAnchor('#vision')
  }
  
  const clickLink = (gourl:any) => {
    if (active === gourl) return
    navigate(gourl)
  }

  const clickSpeaking = () => {
    clickLink('/speaking')
  }
  const clickListening = () => {
    clickLink('/listening')
  }
  const clickCoCreating = () => {
    clickLink('/cocreating')
  }
  const clickAiAgent = () => {
    clickLink('/aiagent')
  }
  const clickToken = () => {
    clickLink('/dashboard')
  }

  return (
    <div className={style.container}>
      <div className={`uv-container-1 ${style.container_wrap}`}>
        <div className={style.leftbar}>
            <div className={style.uvlogo}></div>
            <div className={style.linkbar}>
              <a href="https://x.com/UNIVOICE_" target='_blank'><div className={style.btn_round}>
                <div className={`${style.btn_img} ${style.x}`}></div>
              </div></a>
              <div className={style.btn_split}></div>
              <a href="https://t.me/univoiceofficial" target='_blank'><div className={style.btn_round}>
              <div className={`${style.btn_img} ${style.telegram}`}></div>
              </div></a>
              <div className={style.btn_split}></div>
              <div className={`${style.btn_round} ${style.disable}`}>
                <div className={`${style.btn_img} ${style.discord}`}></div>
              </div>
              <div className={style.btn_split}></div>
              <div className={`${style.btn_round} ${style.disable}`}>
                <div className={`${style.btn_img} ${style.medium}`}></div>
              </div>
              <div className={style.btn_split}></div>
              <div className={`${style.btn_round} ${style.disable}`}>
                <div className={`${style.btn_img} ${style.github}`}></div>
              </div>
            </div>
            <div className={style.copyright}>© Copyright 2024, All Rights Reserved by Univoice</div>
        </div>

        <div className={style.rightbar}>
          <div className={style.col_panel}>
            <div>
              <div className={style.title}>Product</div>
              <div className={style.lnk} onClick={clickHome}>Home</div>
              <div className={style.lnk} onClick={clickPartner}>Partner Ship</div>
              <div className={style.lnk} onClick={clickVision}>Vision</div>
            </div>
          </div>
          <div className={style.col_panel}>
            <div>
              <div className={style.title}>Service</div>
              <div className={style.lnk} onClick={clickSpeaking}>Speaking</div>
              <div className={style.lnk} onClick={clickListening}>Listening</div>
              <div className={style.lnk} onClick={clickCoCreating}>Co-creating</div>
              <div className={style.lnk} onClick={clickAiAgent}>AI Agent</div>
              <div className={style.lnk} onClick={clickToken}>Token</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default FootBar;