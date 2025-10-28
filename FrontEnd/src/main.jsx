// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
// initialize i18n before the app renders so react-i18next hooks work
import './config/i18n';
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
          <App />
        </BrowserRouter>
      </AppProvider>
    </Provider>
  </StrictMode>
);