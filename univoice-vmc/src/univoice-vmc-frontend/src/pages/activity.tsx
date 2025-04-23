import { useEffect } from 'react';

function UvActivityPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  return (
    <div className="uv-container-1 container-subpg">
      <div className="sub-qa-block">
        <div className="qa-block-title bigtxt">Activities</div>
        <div className="qa-block-txt bigtxt">
          <p><span className="color-white">Free Voice: </span>Each time within 30 seconds, 10-15 seconds is optimal. We recommend prioritizing your native language, although using multiple languages is even better if you have that skill.</p>
        </div>
        <div className="qa-block-txt bigtxt">
          <p><span className="color-white">Themed Voice: </span>Share Univoice's slogan and participate in the global fast flash themed voice activities. You can also initiate your desired theme and explore various interesting voice activities together.</p>
        </div>
      </div>
      <div className="sub-block-split"></div>
      <div className="sub-qa-block">
        <div className="qa-block-title">Recently activies:</div>
        <div className="qa-block-txt">
          <div className="color-ddd txtsize-24">1.Sologon</div>
          <p>Each time within 30 seconds, 10-15 seconds is optimal. We recommend prioritizing your native language, although using multiple languages is even better if you have that skill.</p>
        </div>
        <div className="qa-block-txt">
          <div className="color-ddd txtsize-24">2.Your best wishes</div>
          <p>Share Univoice's slogan and participate in the global fast flash themed voice activities. You can also initiate your desired theme and explore various interesting voice activities together.</p>
        </div>
      </div>
      <div className="sub-qa-block">
        <div className="qa-block-title">Topic:</div>
        <div className="qa-block-txt">coming soon</div>
      </div>
    </div>
  )
}

export default UvActivityPage;