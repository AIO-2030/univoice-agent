import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import style from './home.module.scss'
import TopBar from '@/components/topbar'
import FootBar from '@/components/footbar'
import Chakra from '@/components/chakra'
import {query_chakra_data} from '@/utils/call_vmc_backend'

function UvHomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const refHome:any = useRef(null);
  const refPartner:any = useRef(null);
  const refVision:any = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const [chakraClickStat, setChakraClickStat] = useState({
    cnt1: 0,
    cnt2: 0,
    cnt3: 0,
    cnt4: 0,
    cnt5: 0,
    cnt6: 0,
    cnt7: 0,
  });

  const topbarRef = useRef<{ hideProfile: () => void }>(null)
  const handleHideProfile = () => {
    if (topbarRef.current) {
      topbarRef.current.hideProfile()
    }
  }

  const fnClickFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const goAnchor = (anchor:any) => {
    if ('#ptn' === anchor) {
      goPartner()
    } else if ('#vision' === anchor) {
      goVision()
    } else if ('#home' === anchor) {
      goHome()
    }
  }
  const goHome = () => {
    refHome.current && refHome.current.scrollIntoView(true)
  }
  const goPartner = () => {
    refPartner.current.scrollIntoView(true)
  }
  const goVision = () => {
    refVision.current.scrollIntoView(true)
  }

  // const goWhitePaper = () => {
  //   navigate('/whitepaper.pdf')
  // }

  const goActivity = () => {
    navigate('/activity')
  }
  
  const goSpeaking = () => {
    navigate('/speaking')
  }
  const goListening = () => {
    navigate('/listening')
  }
  const goCoCreating = () => {
    navigate('/cocreating')
  }
  const goAiAgent = () => {
    navigate('/aiagent')
  }
  const goToken = () => {
    navigate('/dashboard')
  }

  const startSpeaking = () => {}
  const startListening = () => {}
  const startCoCreating = () => {}

  const loadChakraClickStat = () => {
    query_chakra_data('').then(
      resultItem =>{
        let dataItem = {
          cnt1 : Number(resultItem.cnt1),
          cnt2 : Number(resultItem.cnt2),
          cnt3 : Number(resultItem.cnt3),
          cnt4 : Number(resultItem.cnt4),
          cnt5 : Number(resultItem.cnt5),
          cnt6 : Number(resultItem.cnt6),
          cnt7 : Number(resultItem.cnt7)
        }
        setChakraClickStat(dataItem);
      }
    );
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    goAnchor(location.hash)
    loadChakraClickStat()
  }, []);
  return (
    <div className={`${style.flip_card} ${style.pg} uv-container`} ref={refHome}>
      <div className={`${style.flip_card_inner} ${isFlipped ? style.flip_card_inner_flipped : ''}`}>
        <div className={`${style.flip_card_front}`}>
          <div className={style.home_1}>
            <div className={style.ctx} onClick={handleHideProfile}>
              <TopBar ref={topbarRef}/>
              <div className={style.mainpanel}>
                <div className={style.info}>
                  <div className={style.t1}>I'm Univoice</div>
                  <div className={style.t1}>I'm Undefined</div>
                  <div className={style.t2}>Hello,I’m univoice.I’m undefined.</div>
                  <div className={style.t2}>welcome to the new world created by voices.</div>
                  <div className={style.t2}>“Authentic Freedom Infinite is superpower”</div>
                  <div className={style.links}>
                    <a href="/whitepaper.pdf" target="_blank"><div className={`${style.btn} btn-link-1`}>WHITE PAPER</div></a>
                    <div className={`${style.btn} btn-link-1`} onClick={goActivity}>ACTIVITY</div>
                  </div>
                </div>
                <div className={style.ipcard}></div>
                <div className={style.joinus} onClick={fnClickFlip}><div className={style.txt}>JOIN US</div></div>
              </div>
            </div>
          </div>

          <div className={`${style.home_2} uv-container-1`}>
              <div className={style.img}></div>
              <div className={style.txt_wwd}>What We Do ?</div>
          </div>

          <div className={`${style.home_2_ctx} ${style.home_2_1} uv-container-1`}>
            <div className={style.panel}>
              <div className={`${style.img} ${style.icon_speaking}`}></div>
              <div className={style.title}>Speaking</div>
              <div className={style.intro}>
                <p>The essence of Univoice, where every individual can freely express themselves and contribute to the creation of a harmonious, voice-driven world.</p>
                <div className={style.lnk_learn_more} onClick={goSpeaking}>learn more ...</div>
              </div>
              <div className={`${style.btn} btn-link-1`} onClick={startSpeaking}>
                <div>Start</div>
                <div className={style.icon}></div>
              </div>
            </div>
            <div className={style.panel}>
              <div className={`${style.img} ${style.icon_listening}`}></div>
              <div className={style.title}>Listening</div>
              <div className={style.intro}>
                <p>“ Let AI know you better,you be yourself ”.</p>
                <p>Univoice has always been listening and accompanying.</p>
                <div className={style.lnk_learn_more} onClick={goListening}>learn more ...</div>
              </div>
              <div className={`${style.btn} btn-link-1`} onClick={startListening}>
                <div>Start</div>
                <div className={style.icon}></div>
              </div>
            </div>
            <div className={style.panel}>
              <div className={`${style.img} ${style.icon_creating}`}></div>
              <div className={style.title}>Co-creating</div>
              <div className={style.intro}>
                <p>“ Understand that voice, see that person, comprehend that heart ”, communicate smoothly and create harmoniously together.</p>
                <div className={style.lnk_learn_more} onClick={goCoCreating}>learn more ...</div>
              </div>
              <div className={`${style.btn} btn-link-1`} onClick={startCoCreating}>
                <div>Start</div>
                <div className={style.icon}></div>
              </div>
            </div>
          </div>

          <div className={`${style.home_2_ctx} ${style.home_2_2} uv-container-1`}>
            <div className={style.panel}>
              <div className={`${style.img} ${style.icon_aiagent}`}></div>
              <div className={style.title}>AI Agent</div>
              <div className={style.intro}>
                <p>“Univoice is a Web3 project that harnesses AI to empower users,and it constantly evolves, adapting to new demands through artificial intelligence, ensuring its relevance in an ever-changing world.</p>
              </div>
              <div className={`${style.btn} btn-link-1`} onClick={goAiAgent}>
                <div>Training Process</div>
                <div className={style.icon}></div>
              </div>
            </div>
            <div className={style.panel}>
              <div className={`${style.img} ${style.icon_tokens}`}></div>
              <div className={style.title}>Token</div>
              <div className={style.intro}>
                <p>“Each contribution to Univoice through voices is rewarded with tokens，Univoice use blockchain to manage token transactions, upholds transparency and trust among its users.</p>
              </div>
              <div className={`${style.btn} btn-link-1`} onClick={goToken}>
                <div>View Dashboard</div>
                <div className={style.icon}></div>
              </div>
            </div>
          </div>
          
          <div className={`${style.home_3} uv-container-1`} ref={refPartner}>
              <div className={style.line}></div>
              <div className={style.txt_wwd}>Partner Ship</div>
              <div className={style.txt}>Our expanding networkof ecosystems</div>
          </div>

          <div className={`${style.home_3_1} uv-container-1`}>
            <div className={style.card}>
              <div className={style.panel}>
                <div className={style.panel_ctx}>
                <div className={style.ptn_mixlab}></div>
                </div>
              </div>
            </div>
            <div className={style.card}>
              <div className={style.panel}>
                <div className={style.panel_ctx}>
                  <div className={style.ptn_plug}></div>
                </div>
              </div>
            </div>
            <div className={style.card}>
              <div className={style.panel}>
                <div className={style.panel_ctx}>
                  <div className={style.ptn_icp}></div>
                </div>
              </div>
            </div>
            <div className={style.card}>
              <div className={style.panel}>
                <div className={style.panel_ctx}>
                  <div className={style.ptn_yuku}></div>
                </div>
              </div>
            </div>
            <div className={style.card}>
              <div className={style.panel}>
                <div className={style.panel_ctx}>
                <div className={style.ptn_zonli}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`${style.home_4} uv-container-1`} ref={refVision}>
            <div className={style.home_4_ctx}>
              <div className={style.line}></div>
              <div className={style.bg_1}></div>
              <div className={style.bg_2}></div>
              <div className={style.ctx}>
                <div className={style.wrap}>
                  <div className={style.txt_vision}>Vision</div>
                  <div className={style.txt}>
                    <p>Together! let's co-create an univioce AI Agent that listens to all voices and understands our the best.</p>
                    <p>Create an AI agent that is unique to you. You are unique soul with Authentic Freedom Infinite.</p>
                  </div>
                  <div className={style.logo}></div>
                </div>
              </div>
              
            </div>
          </div>
          <FootBar homeGoAnchor={goAnchor} />

        </div>
        <div className={`${style.flip_card_back} ${style.side_back}`}>
          <div className={style.home_b}>
            <div className={style.home_b_1}>
              <div className={`${style.ctx} font-pf`}>
                <p>"If you want to find the secrets of the universe, think in terms of energy, frequency and vibration."</p>
                <div className={style.sign}>- Nikola Tesla</div>
              </div>
            </div>
            <div className={style.home_b_2}>
              <div className={style.bg_chakra}>
                <Chakra idx={1} clickcnt={chakraClickStat.cnt1}/>
                <Chakra idx={2} clickcnt={chakraClickStat.cnt2}/>
                <Chakra idx={3} clickcnt={chakraClickStat.cnt3}/>
                <Chakra idx={4} clickcnt={chakraClickStat.cnt4}/>
                <Chakra idx={5} clickcnt={chakraClickStat.cnt5}/>
                <Chakra idx={6} clickcnt={chakraClickStat.cnt6}/>
                <Chakra idx={7} clickcnt={chakraClickStat.cnt7}/>
              </div>
            </div>
            <div onClick={fnClickFlip} className={style.btn_turnback}>Back</div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default UvHomePage;