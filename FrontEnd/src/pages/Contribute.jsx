// src/pages/Contribute.jsx
import React from 'react';
import Headers from '../Component/home/Headers';
import Footer from '../Component/home/Footer';
// import ContributeForm from '../Component/Contribute/ContributeForm';
import '../Styles/Contribute/contribute.css';
import ContributeForm from '../Component/contribute/ContributeForm';

export default function Contribute() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #1a1612 0%, #2a2520 50%, #1a1612 100%)', color: '#D4C5A9', minHeight: '100vh' }}>
      <Headers />
      <main className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <ContributeForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}