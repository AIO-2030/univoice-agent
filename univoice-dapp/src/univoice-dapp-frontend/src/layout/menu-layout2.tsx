import { Outlet } from 'react-router-dom';
import BottomMenu from '@/components/bottom-menu'

function MenuLayout2() {
  return (
    <div className="main-container">
      <div className="uvpage-1">
        <Outlet/>
      </div>
      <BottomMenu />
    </div>
  )
}

export default MenuLayout2