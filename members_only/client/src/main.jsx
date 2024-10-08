import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Router from './router';
import { AuthProvider } from './contexts/AuthContext'; // Import your AuthProvider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </React.StrictMode>,
)