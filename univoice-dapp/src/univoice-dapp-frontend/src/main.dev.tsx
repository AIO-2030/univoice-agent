import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.scss';

// This is a simplified version of main.tsx for development
// that doesn't require a preamble for Fast Refresh

// Create root element for React
const rootElement = document.getElementById('root');

// Render the app if root element exists
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} 