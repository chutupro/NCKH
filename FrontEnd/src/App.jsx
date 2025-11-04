import React from 'react'
import "./App.css";
import AppRoutes from "./routes/Routee";
import { useSetupApiAuth } from "./hooks/useSetupApiAuth";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // ✅ Setup axios interceptor để dùng accessToken từ Context
  useSetupApiAuth();
  
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  )
}

export default App;