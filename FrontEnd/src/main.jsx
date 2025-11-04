// main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
// Removed react-i18next initialization (using Google Translate + local shim)
// Google Translate widget (mounted once) - keeps react-i18next as backup
import GoogleTranslate from './Component/common/GoogleTranslate';
import App from './App.jsx';
import ScrollToTop from './Component/common/ScrollToTop'
import { AppProvider } from './context/context';
import 'leaflet/dist/leaflet.css';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import mapLocationsReducer from './pages/map/mapLocationsSlice';

const store = configureStore({
  reducer: {
    mapLocations: mapLocationsReducer,
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AppProvider>
        <BrowserRouter>
          <ScrollToTop />
          {/* <GoogleTranslate /> */}
          <App />
        </BrowserRouter>
      </AppProvider>
    </Provider>
  </StrictMode>
);