import React from 'react';
import { MessageSquare, PenTool, Shirt, Factory, Package } from 'lucide-react';
import EditableText from './editor/EditableText';
import './Steps.css';

const stepsData = [
  { num: '01', title: 'CONTÁCTANOS', desc: 'Envíanos tu idea, logo, colores o referencia por WhatsApp.', icon: <MessageSquare size={24} color="#000" /> },
  { num: '02', title: 'CREAMOS TU PROPUESTA', desc: 'Nuestro equipo desarrolla una propuesta visual basada en tu idea.', icon: <PenTool size={24} color="#000" /> },
  { num: '03', title: 'APROBACIÓN DEL DISEÑO', desc: 'Revisas el diseño y solicitas los cambios necesarios.', icon: <Shirt size={24} color="#000" /> },
  { num: '04', title: 'FABRICACIÓN', desc: 'Fabricamos tu camiseta con materiales de alta calidad.', icon: <Factory size={24} color="#000" /> },
  { num: '05', title: 'RECIBE TU PEDIDO', desc: 'Enviamos tu camiseta lista para usar.', icon: <Package size={24} color="#000" /> },
];

const Steps = () => {
  return (
    <section className="section steps-section" id="pasos">
      <div className="container">
        <div className="text-center mb-4">
          <div className="pill-tag" style={{margin: '0 auto 1.5rem'}}>
            <span className="pill-dot"></span> <EditableText id="steps_tag" defaultText="PROCESO" />
          </div>
          <EditableText 
            id="steps_title" 
            defaultText='CREA TU CAMISETA PERSONALIZADA <span class="text-primary">EN 5 PASOS</span>' 
            isHtml={true} 
            as="h2" 
          />
          <EditableText 
            id="steps_subtitle" 
            defaultText="Desde tu idea hasta la entrega final." 
            as="p" 
          />
        </div>
        
        <div className="steps-wrapper">
          <div className="steps-line"></div>
          <div className="steps-container">
            {stepsData.map((step, index) => (
              <div className="step-box" key={index}>
                <div className="step-icon-wrapper">
                  <div className="step-icon">{step.icon}</div>
                  <span className="step-bg-num">{step.num}</span>
                </div>
                <EditableText id={`step_title_${index}`} defaultText={step.title} as="h3" />
                <EditableText id={`step_desc_${index}`} defaultText={step.desc} as="p" />
                {index < stepsData.length - 1 && (
                  <div className="step-arrow">&gt;</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Steps;
