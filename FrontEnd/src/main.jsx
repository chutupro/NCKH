<<<<<<< Updated upstream
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
=======
// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
>>>>>>> Stashed changes
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/context';

createRoot(document.getElementById('root')).render(
  <StrictMode>
<<<<<<< Updated upstream
    <AppProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProvider>
=======
    <Provider store={store}>
      <AppProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProvider>
    </Provider>
>>>>>>> Stashed changes
  </StrictMode>
)
