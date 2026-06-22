import React from 'react';
import { Palette, Image as ImageIcon, Type, ShieldCheck, ArrowRight } from 'lucide-react';
import EditableText from './editor/EditableText';
import EditableImage from './editor/EditableImage';
import './Features.css';

const Features = () => {
  return (
    <section className="section features-section">
      <div className="container">
        <div className="features-content">
          <div className="features-text">
            <div className="pill-tag">
              <span className="pill-dot"></span> <EditableText id="feat_tag" defaultText="DISEÑA TU UNIFORME" />
            </div>
            <EditableText 
              id="feat_title" 
              defaultText='100%<br/>PERSONALIZADO<br/><span class="text-primary italic">A TU ESTILO</span>' 
              isHtml={true} 
              as="h2" 
            />
            <EditableText 
              id="feat_desc" 
              defaultText="Tú imaginas, nosotros lo hacemos realidad. Personalizá cada detalle de tu uniforme con los colores, logos y diseños que representan a tu equipo." 
              as="p" 
              className="mb-4 mt-4" 
            />
            <a href="https://wa.me/51943396733" className="btn btn-outline" target="_blank" rel="noreferrer">
              <EditableText id="feat_btn" defaultText="DISEÑAR AHORA" /> <ArrowRight size={18} />
            </a>
          </div>
          
          <div className="features-visual">
            <div className="glowing-jersey">
              <EditableImage id="feat_img" defaultSrc="/images/design_1_imanza_1781810286422.png" />
            </div>
            
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Palette size={20} color="var(--primary)" />
                </div>
                <div>
                  <EditableText id="feat_1_title" defaultText="COLORES" as="h3" />
                  <EditableText id="feat_1_desc" defaultText="A tu elección" as="p" />
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <ImageIcon size={20} color="var(--primary)" />
                </div>
                <div>
                  <EditableText id="feat_2_title" defaultText="LOGOS" as="h3" />
                  <EditableText id="feat_2_desc" defaultText="Bordado o estampado" as="p" />
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Type size={20} color="var(--primary)" />
                </div>
                <div>
                  <EditableText id="feat_3_title" defaultText="NOMBRES" as="h3" />
                  <EditableText id="feat_3_desc" defaultText="Y números" as="p" />
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <ShieldCheck size={20} color="var(--primary)" />
                </div>
                <div>
                  <EditableText id="feat_4_title" defaultText="PATROCINIOS" as="h3" />
                  <EditableText id="feat_4_desc" defaultText="Y publicidad" as="p" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
