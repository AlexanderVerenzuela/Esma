import React, { useRef, useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getTenantSlug } from '../supabaseClient';
import EditableText from './editor/EditableText';
import EditableImage from './editor/EditableImage';
import './Hero.css';

const Hero = () => {
  const container = useRef(null);
  const [tenantSlug, setTenantSlug] = useState('default');

  useEffect(() => {
    setTenantSlug(getTenantSlug());
  }, []);

  useGSAP(() => {
    gsap.fromTo('.hero-content > *', 
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.2
      }
    );
  }, { scope: container });

  const waMessage = tenantSlug === 'demo'
    ? 'Hola, quiero cotizar uniformes de fútbol'
    : 'Hola Esma Sportwear, quiero cotizar uniformes';

  return (
    <EditableImage 
      id="hero_bg" 
      defaultSrc="/images/hero_background_1781810278116.png" 
      mobileId="hero_bg_mobile"
      defaultMobileSrc="/images/banner-cel.png"
      isBackground={true} 
      className="hero"
    >
      <div className="hero-overlay"></div>
      <div className="container hero-content" ref={container}>
        <div className="pill-tag">
          <span className="pill-dot"></span> <EditableText id="hero_tag" defaultText={tenantSlug === 'demo' ? "DEMO 2026" : "CATÁLOGO 2026"} />
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
        <a href={`https://wa.me/51943396733?text=${encodeURIComponent(waMessage)}`} className="btn btn-primary" target="_blank" rel="noreferrer">
          <MessageCircle size={20} /> <EditableText id="hero_btn" defaultText="COTIZAR POR WHATSAPP" />
        </a>
      </div>
    </EditableImage>
  );
};

export default Hero;
