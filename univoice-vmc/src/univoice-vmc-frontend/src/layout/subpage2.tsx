import { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../components/topbar'
import FootBar from '../components/footbar'

function MainLayout() {

  const topbarRef = useRef<{ hideProfile: () => void }>(null)
  const handleHideProfile = () => {
    if (topbarRef.current) {
      topbarRef.current.hideProfile()
    }
  }

  return (
    <div className="uv-container pg-sub2" onClick={handleHideProfile}>
      <div className="container-topbar"><TopBar ref={topbarRef}/></div>
      <Outlet/>
      <FootBar/>
    </div>
  )
}

export default MainLayout