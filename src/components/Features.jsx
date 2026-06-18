import React from 'react';
import { Palette, Image as ImageIcon, Type, ShieldCheck, ArrowRight } from 'lucide-react';
import './Features.css';

const Features = () => {
  return (
    <section className="section features-section">
      <div className="container">
        <div className="features-content">
          <div className="features-text">
            <div className="pill-tag">
              <span className="pill-dot"></span> DISEÑA TU UNIFORME
            </div>
            <h2>
              100%<br/>
              PERSONALIZADO<br/>
              <span className="text-primary italic">A TU ESTILO</span>
            </h2>
            <p className="mb-4 mt-4">Tú imaginas, nosotros lo hacemos realidad. Personalizá cada detalle de tu uniforme con los colores, logos y diseños que representan a tu equipo.</p>
            <a href="https://wa.me/000000000" className="btn btn-outline" target="_blank" rel="noreferrer">
              DISEÑAR AHORA <ArrowRight size={18} />
            </a>
          </div>
          
          <div className="features-visual">
            <div className="glowing-jersey">
              <img src="/images/design_1_imanza_1781810286422.png" alt="Jersey personalizado" />
            </div>
            
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Palette size={20} color="var(--primary)" />
                </div>
                <div>
                  <h3>COLORES</h3>
                  <p>A tu elección</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <ImageIcon size={20} color="var(--primary)" />
                </div>
                <div>
                  <h3>LOGOS</h3>
                  <p>Bordado o estampado</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <Type size={20} color="var(--primary)" />
                </div>
                <div>
                  <h3>NOMBRES</h3>
                  <p>Y números</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <ShieldCheck size={20} color="var(--primary)" />
                </div>
                <div>
                  <h3>PATROCINIOS</h3>
                  <p>Y publicidad</p>
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
