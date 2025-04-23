import { useEffect, useRef } from "react";
import * as echarts from "echarts"
import style from './aiagent.module.scss'

function UvAiAgentPage() {
  const refScatterChart:any = useRef(null);
  const refLineChart:any = useRef(null);
  let scatterChart:any = null;
  let lineChart:any = null;

  const initScatterChart = () => {
    const option = {
      grid: {
        top: '4%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis'
      },
    }
    scatterChart = echarts.init(refScatterChart.current)
    scatterChart.setOption(option)
  }
  const getScatterData = () => {
    const option = {
      xAxis: {},
      yAxis: {},
      series: [
        {
          symbolSize: 5,
          data: [
            [10.0, 8.04],
            [8.07, 6.95],
            [13.0, 7.58],
            [9.05, 8.81],
            [11.0, 8.33],
            [14.0, 7.66],
            [13.4, 6.81],
            [10.0, 6.33],
            [14.0, 8.96],
            [12.5, 6.82],
            [9.15, 7.2],
            [11.5, 7.2],
            [3.03, 4.23],
            [12.2, 7.83],
            [2.02, 4.47],
            [1.05, 3.33],
            [4.05, 4.96],
            [6.03, 7.24],
            [12.0, 6.26],
            [12.0, 8.84],
            [7.08, 5.82],
            [5.02, 5.68]
          ],
          type: 'scatter'
        }
      ]
    }
    scatterChart.setOption(option)
  }

  const initLineChart = () => {
    const option = {
      grid: {
        top: '15%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis'
      },
    }
    lineChart = echarts.init(refLineChart.current)
    lineChart.setOption(option)
  }
  const getLineData = () => {
    const option = {
      legend: {
        data: ['s1','s2']
      },
      xAxis: {
        data: ['A', 'B', 'C', 'D', 'E']
      },
      yAxis: {},
      series: [
        {
          data: [10, 22, 28, 23, 19],
          type: 'line',
          smooth: true,
          name: 's1',
          showSymbol: false,
        },
        {
          data: [21, 12, 18, 43, 59],
          type: 'line',
          smooth: true,
          name: 's2'
        }
      ]
    }
    lineChart.setOption(option)
  }
  useEffect(() => {
    window.scrollTo(0, 0)
    initScatterChart()
    getScatterData()
    initLineChart()
    getLineData()
  }, []);
  return (
    <div className="uv-container-1 container-subpg">
      <div className="sub-qa-block">
        <div className="qa-block-title bigtxt">Univoice AI Agent</div>
        <div className="qa-block-txt bigtxt">
          <p>univoice AI Agent is a combination of the prototypes of Sun Wukong and Conan, possessing humor, wisdom, keenness, curiosity, empathy, and confidence. Fearless Explorer: This AI is like a curious child, eager to explore the audible world of Earth and understand human language and emotions. It is unafraid of challenges and believes in its ability to solve problems, much like Sun Wukong and Conan's thirst for knowledge and adventurous spirit.</p>
        </div>
      </div>
      <div className="sub-block-split"></div>
      <div className="sub-qa-block">
        <div className="qa-block-title">Principles of Training</div>
        <div className="qa-block-txt">The key is "learning from data," which means enabling AI to modify or adapt its behavior to make it more accurate. Through training, the univoice agent improves in recognizing human language (correct labeling) and responding appropriately in conversations (reaction).At the same time, this is also the focus of univoice's objectives on the computational network.</div>
      </div>
      <div className="sub-qa-block">
        <div className="qa-block-title">Univoice: The Web3 Platform Where Voice Becomes a Driving Force</div>
        <div className="qa-block-txt">
          <p>You are a speaker and holding Univoice Licence.</p>
          <p>Univoice Licence: NFT or univoice-related products</p>
          <p>In expressing ourselves,univoice ai agent listens, we also learn to listen to the voices of inner and outer with patience.</p>
        </div>
      </div>
      <div className="sub-qa-block">
        <div className="qa-block-title">Highlights of technological innovation</div>
        <div className={style.panel_chart}>
          <div className={style.card}>
            <div className={style.chart} style={{backgroundColor: '#FAF0FF',borderColor: '#A719F8'}}>
              <div className={style.wrap}>
                <div style={{width: '100%', height: '100%'}} ref={refScatterChart}></div>
              </div>
            </div>
            <div>
              <p className={style.label}>Dataset</p>
              <p className={style.intro}>Scatter plot matrix</p>
            </div>
          </div>
          <div className={style.card}>
            <div className={style.chart} style={{backgroundColor: '#F0F2FF',borderColor: '#BD5AFF'}}>
              <div className={style.wrap}>
                <div style={{width: '100%', height: '100%'}} ref={refLineChart}></div>
              </div>
            </div>
            <div>
              <p className={style.label}>Training process</p>
              <p className={style.intro}>The two lines correspond to the forward error and the backward gradient values.</p>
            </div>
          </div>
        </div>
        <div className="qa-block-txt">
          <p className="color-ddd txtsize-24">1.Community-driven Intelligence: </p>
          <p>Univoice is a Web3 project that harnesses AI to empower users, turning their voice into an integral part of the evolving communication landscape.</p>
        </div>
        <div className="qa-block-txt">
          <p className="color-ddd txtsize-24">2.Token-Backed Voice Experience: </p>
          <p>Each contribution to Univoice through voices is rewarded with tokens, symbolizing ownership and rewards for participation in this decentralized network.</p>
        </div>
        <div className="qa-block-txt">
          <p className="color-ddd txtsize-24">3.In-Moment Rewards & Engagement: </p>
          <p>Instant token incentives for valuable interactions or AI learning milestones foster a vibrant ecosystem where every voice counts.</p>
        </div>
        <div className="qa-block-txt">
          <p className="color-ddd txtsize-24">4.Equity for All, Growth for All: </p>
          <p>Univoice guarantees equitable rewards distribution, fostering an inclusive environment where users actively contribute to its growth.</p>
        </div>
        <div className="qa-block-txt">
          <p className="color-ddd txtsize-24">5.Voice-powered Ecosystem: </p>
          <p>Users collaborate on and build projects around the platform, forming a Web3-driven community centered around voice technology.</p>
        </div>
        <div className="qa-block-txt">
          <p className="color-ddd txtsize-24">6.Transparency & Trust in the Digital Age: </p>
          <p>Using blockchain to manage token transactions, Univoice upholds transparency and trust among its users.</p>
        </div>
        <div className="qa-block-txt">
          <p className="color-ddd txtsize-24">7.Adaptive, AI-Powered Evolution: </p>
          <p>Univoice constantly evolves, adapting to new demands through artificial intelligence, ensuring its relevance in an ever-changing world.</p>
        </div>
        <div className="qa-block-txt">
          <p className="color-ddd txtsize-24">8.Univoice: The Voice That Connects, Inspires & Revolutionizes</p>
          <p>In Univoice's narrative, the power of voice is amplified by Web3 principles, as a platform where every user's voice has a voice and drives change through collaborative token-driven efforts.</p>
        </div>
      </div>
      <div className="sub-qa-block">
        <div className="qa-block-title">Univoice AI Agent</div>
        <div className="qa-block-txt">The Univoice AI Agent combines humor, wisdom, courage, empathy, and confidence, akin to a lovable child with a challenging spirit and a loving heart."</div>
      </div>
      <div className="sub-qa-block">
        <div className="qa-block-title">Partner Brands</div>
      </div>
    </div>
  )
}
export default UvAiAgentPage;