import { Navigate, RouteObject } from 'react-router-dom';
import SubLayout from '../layout/subpage';
import DevelopePage from '../pages/developer';
import HomePage from '../pages/home';
import CoCreatingPage from '../pages/cocreating';


const routes: RouteObject[] = [{
    path: '/',
    element: <HomePage/>
  },{
    Component: SubLayout,
    children: [
      {
        path: '/develop',
        element: <DevelopePage />
      },
      {
        path: '/cocreating',
        element: <CoCreatingPage />
      }
    ]
  },
  // ...external,
  {
    path: '/*',
    element: <Navigate to="/" />
  }
];
export default routes;