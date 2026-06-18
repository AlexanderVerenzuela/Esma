import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Steps from './components/Steps';
import Catalog from './components/Catalog';
import Features from './components/Features';
import Teams from './components/Teams';
import Footer from './components/Footer';

const PublicSite = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Steps />
      <Catalog />
      <Features />
      <Teams />
      <Footer />
    </>
  );
};

export default PublicSite;
