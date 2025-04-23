import { Navigate, RouteObject } from 'react-router-dom';
import MenuLayout from '@/layout/menu-layout';
import MenuLayout2 from '@/layout/menu-layout2';
import HomePage from '@/pages/home';
import SoundsPage from '@/pages/sounds';
import SelfPage from '@/pages/self';
import DashboardPage from '@/pages/dashboard';
import FriendsPage from '@/pages/friends';
import TasksPage from '@/pages/tasks';
import LicenseDetailPage from '@/pages/licensedetail';

const routes: RouteObject[] = [{
  //   path: '/',
  //   element: <HomePage/>
  // },{
    Component: MenuLayout,
    children: [
      {
        path: '/',
        element: <HomePage />
      }
    ]
  }, {
    //   path: '/',
    //   element: <HomePage/>
    // },{
    Component: MenuLayout2,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />
      }, {
        path: '/sounds',
        element: <SoundsPage />
      }, {
        path: '/friends',
        element: <FriendsPage />
      }, {
        path: '/tasks',
        element: <TasksPage />
      }
    ]
  }, {
      path: '/self',
      element: <SelfPage/>
    }, {
      path: '/licensedetail/:id',
      element: <LicenseDetailPage/>
  },
  // ...external,
  {
    path: '/*',
    element: <Navigate to="/" />
  }
];
export default routes;