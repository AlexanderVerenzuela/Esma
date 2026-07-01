import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Steps from './components/Steps';
import Catalog from './components/Catalog';
import Features from './components/Features';
import Teams from './components/Teams';
import Footer from './components/Footer';
import { useSite } from './context/SiteContext';
import { Settings, X } from 'lucide-react';

const PublicSite = () => {
  const { isAdmin, isEditMode, setIsEditMode, loading } = useSite();
  const [loaderMounted, setLoaderMounted] = useState(true);
  const [loaderOpacity, setLoaderOpacity] = useState(1);

  useEffect(() => {
    if (!loading) {
      // Start fade out transition
      setLoaderOpacity(0);
      const timer = setTimeout(() => {
        setLoaderMounted(false);
      }, 1000); // Matches the 1s transition duration
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <>
      <Navbar />
      <Hero />
      <Steps />
      <Catalog />
      <Features />
      <Teams />
      <Footer />

      {loaderMounted && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000',
          zIndex: 10000,
          opacity: loaderOpacity,
          transition: 'opacity 1s ease-in-out',
          pointerEvents: 'none'
        }} />
      )}
      
      {isAdmin && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: isEditMode ? 'var(--primary)' : '#111',
          color: isEditMode ? '#000' : '#fff',
          padding: '10px 20px',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          zIndex: 9999,
          cursor: 'pointer',
          border: '2px solid',
          borderColor: isEditMode ? 'var(--primary)' : '#333',
          fontWeight: 'bold',
          transition: 'all 0.3s'
        }}
        onClick={() => setIsEditMode(!isEditMode)}
        >
          {isEditMode ? <X size={20} /> : <Settings size={20} />}
          {isEditMode ? 'Salir de Edición' : 'Activar Modo Edición'}
        </div>
      )}
    </>
  );
};

export default PublicSite;
