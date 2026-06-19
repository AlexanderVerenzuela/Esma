import React from 'react';
import { MessageCircle } from 'lucide-react';
import EditableText from './editor/EditableText';
import EditableImage from './editor/EditableImage';
import './Hero.css';

const Hero = () => {
  return (
    <EditableImage id="hero_bg" defaultSrc="/images/hero_background_1781810278116.png" isBackground={true} className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <div className="pill-tag">
          <span className="pill-dot"></span> <EditableText id="hero_tag" defaultText="CATÁLOGO 2026" />
        </div>
        <EditableText 
          id="hero_title" 
          defaultText='UNIFORMES QUE <br/><span class="text-primary italic">VISTEN</span> TU PASIÓN.' 
          isHtml={true} 
          as="h1" 
        />
        <EditableText 
          id="hero_subtitle" 
          defaultText="Diseños únicos, calidad premium y entrega rápida para tu equipo." 
          as="p" 
          className="hero-subtitle" 
        />
        <a href="https://wa.me/000000000?text=Hola%20Esma%20Sportwear%2C%20quiero%20cotizar%20uniformes" className="btn btn-primary" target="_blank" rel="noreferrer">
          <MessageCircle size={20} /> <EditableText id="hero_btn" defaultText="COTIZAR POR WHATSAPP" />
        </a>
      </div>
    </EditableImage>
  );
};

export default Hero;
