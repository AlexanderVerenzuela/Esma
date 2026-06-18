import React from 'react';
import { MessageCircle } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section" id="contacto">
      <div className="container">
        <div className="footer-cta text-center">
          <h2>¿LISTO PARA CREAR TU <span className="text-primary italic">DISEÑO ÚNICO?</span></h2>
          <p className="mb-4">Te respondemos al instante. Sin compromiso.</p>
          <a href="https://wa.me/000000000" className="btn btn-solid-primary mt-4" target="_blank" rel="noreferrer">
            <MessageCircle size={20} /> SOLICITAR DISEÑO POR WHATSAPP
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
