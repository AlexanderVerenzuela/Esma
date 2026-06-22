import React, { useState, useRef } from 'react';
import { Plus, Trash2, Download, Image as ImageIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QuoteTemplate from './QuoteTemplate';
import './Admin.css'; // Assume we reuse some common admin styles

const QuoteGenerator = () => {
  const quoteRef = useRef(null);

  const [formData, setFormData] = useState({
    clientName: '',
    date: new Date().toLocaleDateString('es-ES'),
    bankAccounts: 'Cuenta BCP: 19103352053011\nYape: 982-409-277 Iris\nEstefany Machare Cortez',
    paymentConditions: '50% POR ADELANTADO PARA COMENZAR CONFECCIÓN, 50% RESTANTE AL MOMENTO DE LA ENTREGA.',
    otherDetails: 'CONJUNTOS TALLA 10 FALDA SHORTS 5 SOLES ADICIONAL',
    signatureName: 'Samuel Verenzuela'
  });

  const [items, setItems] = useState([
    { id: 1, desc1: 'CONJUNTOS TALLA 8', desc2: '', price: 40, quantity: 6, total: 240 }
  ]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate total if price or quantity changes
        if (field === 'price' || field === 'quantity') {
          updated.total = (parseFloat(updated.price || 0) * parseInt(updated.quantity || 0)).toFixed(2);
        }
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, desc1: '', desc2: '', price: 0, quantity: 1, total: 0 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2);
  };

  const downloadAsImage = async () => {
    if (!quoteRef.current) return;
    
    // Temporarily remove the scale transform from the parent to prevent html2canvas text squishing bug
    const wrapper = quoteRef.current.parentElement;
    const originalTransform = wrapper.style.transform;
    wrapper.style.transform = 'none';
    
    try {
      const canvas = await html2canvas(quoteRef.current, { scale: 2, useCORS: true });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `Cotizacion_${formData.clientName || 'Esma'}.png`;
      link.click();
    } finally {
      wrapper.style.transform = originalTransform;
    }
  };

  const downloadAsPDF = async () => {
    if (!quoteRef.current) return;
    
    const wrapper = quoteRef.current.parentElement;
    const originalTransform = wrapper.style.transform;
    wrapper.style.transform = 'none';

    try {
      const canvas = await html2canvas(quoteRef.current, { scale: 2, useCORS: true });
      const image = canvas.toDataURL("image/png");
      
      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(image, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Cotizacion_${formData.clientName || 'Esma'}.pdf`);
    } finally {
      wrapper.style.transform = originalTransform;
    }
  };

  return (
    <div className="admin-container quote-generator-layout">
      {/* Left Column: Form */}
      <div className="admin-card quote-form-column">
        <h2>Generar Cotización</h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Nombre del Cliente</label>
            <input 
              type="text" 
              name="clientName" 
              className="admin-input" 
              value={formData.clientName} 
              onChange={handleFormChange} 
              placeholder="Ej: Deportivo FC"
            />
          </div>
          <div className="form-group" style={{ width: '150px' }}>
            <label>Fecha</label>
            <input 
              type="text" 
              name="date" 
              className="admin-input" 
              value={formData.date} 
              onChange={handleFormChange} 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Cuentas Bancarias (Datos de Pago)</label>
          <textarea 
            name="bankAccounts" 
            className="admin-input" 
            rows="3" 
            value={formData.bankAccounts} 
            onChange={handleFormChange} 
          />
        </div>

        <div style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Productos</h3>
          <button onClick={addItem} className="admin-btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>
            <Plus size={16} /> Agregar
          </button>
        </div>

        {[...items].reverse().map((item, index) => (
          <div key={item.id} style={{ background: '#1a1a1a', border: '1px solid #333', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', position: 'relative' }}>
            <button 
              onClick={() => removeItem(item.id)}
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255, 68, 68, 0.1)', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '5px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Eliminar producto"
            >
              <Trash2 size={16} />
            </button>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', marginTop: '10px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <input 
                  type="text" 
                  placeholder="Descripción Principal (Ej: CONJUNTOS TALLA 8)" 
                  className="admin-input" 
                  value={item.desc1} 
                  onChange={(e) => handleItemChange(item.id, 'desc1', e.target.value)} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <input 
                  type="text" 
                  placeholder="Detalles Adicionales (Opcional)" 
                  className="admin-input" 
                  value={item.desc2} 
                  onChange={(e) => handleItemChange(item.id, 'desc2', e.target.value)} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="form-group" style={{ width: '100px', marginBottom: 0 }}>
                <label style={{ fontSize: '11px', color: '#888' }}>Precio (S/.)</label>
                <input 
                  type="number" 
                  className="admin-input" 
                  value={item.price} 
                  onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} 
                />
              </div>
              <div className="form-group" style={{ width: '100px', marginBottom: 0 }}>
                <label style={{ fontSize: '11px', color: '#888' }}>Cantidad</label>
                <input 
                  type="number" 
                  className="admin-input" 
                  value={item.quantity} 
                  onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} 
                />
              </div>
              <div className="form-group" style={{ width: '120px', marginBottom: 0 }}>
                <label style={{ fontSize: '11px', color: '#888' }}>Total (S/.)</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={item.total} 
                  disabled 
                  style={{ background: '#0a0a0a', color: '#fff', borderColor: '#222' }}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="form-group" style={{ marginTop: '2rem' }}>
          <label>Condiciones de Pago</label>
          <textarea 
            name="paymentConditions" 
            className="admin-input" 
            rows="2" 
            value={formData.paymentConditions} 
            onChange={handleFormChange} 
          />
        </div>

        <div className="form-group">
          <label>Otros Detalles</label>
          <textarea 
            name="otherDetails" 
            className="admin-input" 
            rows="2" 
            value={formData.otherDetails} 
            onChange={handleFormChange} 
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={downloadAsPDF} className="admin-btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Descargar PDF
          </button>
          <button onClick={downloadAsImage} className="admin-btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: '2px solid #333' }}>
            <ImageIcon size={18} /> Descargar Imagen
          </button>
        </div>

      </div>

      {/* Right Column: Preview */}
      <div className="quote-preview-container">
        {/* Wrapper to reserve exact scaled dimensions so it doesn't cause scrollbars */}
        <div className="quote-preview-wrapper">
          <div className="quote-preview-content">
            <QuoteTemplate 
              ref={quoteRef}
              data={{
                ...formData,
                items,
                total: calculateGrandTotal()
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteGenerator;
