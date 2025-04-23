import React from 'react';
import eruda from 'eruda';
import { isLocalNet } from '@/utils/env';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.scss';

const isDev = isLocalNet();
isDev && eruda.init();

export const Root = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <Root />
  // </React.StrictMode>,
);
