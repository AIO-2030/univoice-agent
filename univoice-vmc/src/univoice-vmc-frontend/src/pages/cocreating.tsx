import { useEffect } from 'react';

function UvCoCreatingPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  return (
    <div className="uv-container-1 container-subpg">
      <div className="sub-qa-block">
        <div className="qa-block-title bigtxt">Co-Creating</div>
        <div className="qa-block-txt bigtxt"></div>
      </div>
      {/* <div className="sub-block-split"></div>
      <div className="sub-qa-block">
        <div className="qa-block-title">What can we creat?</div>
        <div className="qa-block-txt">We are human.</div>
      </div> */}
    </div>
  )
}

export default UvCoCreatingPage;