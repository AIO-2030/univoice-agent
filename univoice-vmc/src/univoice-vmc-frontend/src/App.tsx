import { useRoutes } from 'react-router-dom';
import routes from '@/routes/index';
import './App.scss'
import { ToastContain } from '@/components/toast';

function App() {
  // init routes
  const views = useRoutes(routes);

  return (
    <>
    <ToastContain />
    {views}
    </>
  )
}

export default App