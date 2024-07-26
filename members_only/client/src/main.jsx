import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Ensure this import is present
import App from './App';
import Router from './router';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router/>
  </React.StrictMode>,
)
