import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Upload } from 'lucide-react';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    description: '',
    mainImage: '',
    isFeatured: false,
    gallery: []
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) { console.error(err); }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (res.ok) {
        if (field === 'mainImage') {
          setFormData({ ...formData, mainImage: data.url });
        } else if (field === 'gallery') {
          setFormData({ ...formData, gallery: [...formData.gallery, data.url] });
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId ? `http://localhost:3000/api/products/${editingId}` : 'http://localhost:3000/api/products';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setFormData({ code: '', name: '', categoryId: '', description: '', mainImage: '', isFeatured: false, gallery: [] });
        fetchProducts();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) { console.error(err); }
  };

  const handleEdit = (prod) => {
    setFormData({
      code: prod.code,
      name: prod.name,
      categoryId: prod.categoryId,
      description: prod.description || '',
      mainImage: prod.mainImage,
      isFeatured: prod.isFeatured,
      gallery: prod.gallery || []
    });
    setEditingId(prod.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (err) { console.error(err); }
  };

  if (showForm) {
    return (
      <div className="admin-card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>Código del Producto</label>
            <input type="text" className="admin-input" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label>Nombre</label>
            <input type="text" className="admin-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label>Categoría</label>
            <select className="admin-input" required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
              <option value="">Selecciona una categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="admin-form-group">
            <label>Descripción</label>
            <textarea className="admin-input" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="admin-form-group">
            <label>Imagen Principal</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {formData.mainImage && <img src={formData.mainImage} alt="Main" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />}
              <label className="admin-btn admin-btn-secondary" style={{ cursor: 'pointer' }}>
                <Upload size={18} /> Subir Imagen
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleFileUpload(e, 'mainImage')} />
              </label>
            </div>
          </div>
          <div className="admin-form-group">
            <label>
              <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} /> Destacado
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="admin-btn">Guardar</button>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Productos</h2>
        <button className="admin-btn" onClick={() => { setEditingId(null); setFormData({ code: '', name: '', categoryId: '', description: '', mainImage: '', isFeatured: false, gallery: [] }); setShowForm(true); }}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Img</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Destacado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(prod => (
            <tr key={prod.id}>
              <td><img src={prod.mainImage} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
              <td>{prod.code}</td>
              <td>{prod.name}</td>
              <td>{prod.categoryName}</td>
              <td>{prod.isFeatured ? 'Sí' : 'No'}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="admin-btn admin-btn-secondary" onClick={() => handleEdit(prod)}><Edit size={16} /></button>
                  <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(prod.id)}><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No hay productos</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManager;
