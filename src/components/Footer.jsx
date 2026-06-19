import React from 'react';
import { MessageCircle } from 'lucide-react';
import EditableText from './editor/EditableText';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section" id="contacto">
      <div className="container">
        <div className="footer-cta text-center">
          <EditableText 
            id="footer_title" 
            defaultText='¿LISTO PARA CREAR TU <span class="text-primary italic">DISEÑO ÚNICO?</span>' 
            isHtml={true} 
            as="h2" 
          />
          <EditableText 
            id="footer_desc" 
            defaultText="Te respondemos al instante. Sin compromiso." 
            as="p" 
            className="mb-4" 
          />
          <a href="https://wa.me/000000000" className="btn btn-solid-primary mt-4" target="_blank" rel="noreferrer">
            <MessageCircle size={20} /> <EditableText id="footer_btn" defaultText="SOLICITAR DISEÑO POR WHATSAPP" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
