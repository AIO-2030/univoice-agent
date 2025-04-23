import { useState } from 'react';
import { mugc_agc_backend } from 'declarations/mugc-agc-backend';
import { useRoutes } from 'react-router-dom';
import routes from '@/routes/index';
import { ToastContain } from '@/components/toast';
import './App.scss'

function App() {
  const views = useRoutes(routes);

  return (
    <>
    <ToastContain />
    {views}
    </>
  )
}

export default App;
