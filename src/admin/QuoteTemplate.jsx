import React, { forwardRef } from 'react';
import './QuoteTemplate.css';

const QuoteTemplate = forwardRef(({ data }, ref) => {
  const {
    clientName,
    date,
    items,
    paymentConditions,
    otherDetails,
    bankAccounts,
    signatureName,
    total
  } = data;

  return (
    <div className="quote-document" ref={ref}>
      <div className="quote-header-box">
        <img src="/images/logo.png" alt="Esma Sportwear" />
      </div>

      <div className="quote-top-section">
        <div className="quote-client-row">
          <div>
            <div className="quote-text-primary">CLIENTE:</div>
            <div className="quote-client-name">{clientName || 'Nombre del Cliente'}</div>
          </div>
          <div>
            <div className="quote-date">Fecha: {date || 'DD/MM/YYYY'}</div>
          </div>
        </div>
        
        <div className="quote-payment-info">
          <div className="quote-text-primary">DATOS DE PAGO</div>
          {bankAccounts.split('\n').map((line, i) => (
            <div key={i} className="quote-payment-line">{line}</div>
          ))}
        </div>
      </div>

      <div className="quote-table-container">
        <table className="quote-table">
          <thead>
            <tr>
              <th>#</th>
              <th>DESCRIPCIÓN</th>
              <th>PRECIO</th>
              <th>Cantidad</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  {item.desc1}
                  {item.desc2 && <><br />{item.desc2}</>}
                </td>
                <td>S/.{item.price}</td>
                <td>{item.quantity}</td>
                <td>S/.{item.total}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '20px', color: '#999' }}>Agrega productos al formulario...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="quote-bottom-section">
        <div className="quote-conditions-col">
          <div className="quote-text-primary" style={{marginBottom: '10px'}}>CONDICIONES DE PAGO</div>
          <div className="quote-condition-text">{paymentConditions}</div>
          
          <div className="quote-text-primary" style={{marginTop: '20px', marginBottom: '10px'}}>OTROS DETALLES</div>
          <div className="quote-condition-text">{otherDetails}</div>
        </div>
        
        <div className="quote-totals-col">
          <div style={{ borderTop: '1px solid #ccc', marginTop: '10px' }}></div>
          <div className="quote-total-row">
            <span className="quote-total-label">TOTAL</span>
            <span className="quote-total-amount">S/.{total}</span>
          </div>
        </div>
      </div>

      <div className="quote-footer">
        <div className="quote-signature-box">
          <div className="quote-signature-line">{signatureName || 'Samuel Verenzuela'}</div>
        </div>
        
        <div className="quote-contact-info">
          <div>esmasportwear@gmail.com</div>
          <div>982-598-322</div>
        </div>

        <div className="quote-signature-box">
          <div className="quote-signature-line">Cliente</div>
        </div>
      </div>

      <div className="quote-bottom-bar">
        ENTREGA 2026
      </div>
    </div>
  );
});

export default QuoteTemplate;
