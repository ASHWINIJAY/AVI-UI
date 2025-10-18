import { StrictMode } from 'react'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme.js';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'primereact/resources/themes/saga-blue/theme.css';   // or another PrimeReact theme
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <App />
    </LocalizationProvider>
    </HashRouter>
  </React.StrictMode>
);
