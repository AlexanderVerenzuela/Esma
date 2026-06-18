import React from 'react';
import { MessageCircle } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <div className="pill-tag">
          <span className="pill-dot"></span> CATÁLOGO 2026
        </div>
        <h1>
          UNIFORMES QUE <br/>
          <span className="text-primary italic">VISTEN</span> TU PASIÓN.
        </h1>
        <p className="hero-subtitle">Diseños únicos, calidad premium y entrega rápida para tu equipo.</p>
        <a href="https://wa.me/000000000?text=Hola%20Esma%20Sportwear%2C%20quiero%20cotizar%20uniformes" className="btn btn-primary" target="_blank" rel="noreferrer">
          <MessageCircle size={20} /> COTIZAR POR WHATSAPP
        </a>
      </div>
    </section>
  );
};

export default Hero;
