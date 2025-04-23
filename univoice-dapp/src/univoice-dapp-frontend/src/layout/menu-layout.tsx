import { Outlet } from 'react-router-dom';
import BottomMenu from '@/components/bottom-menu'

function MenuLayout() {
  return (
    <div className="main-container">
      <Outlet/>
      <BottomMenu />
    </div>
  )
}

export default MenuLayout