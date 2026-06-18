import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, Edit } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    description: '',
    mainImage: null,
    isFeatured: false
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error) setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      // Fetch products and join categories
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const formatted = data.map(p => ({
        ...p,
        categoryName: p.categories?.name,
        categoryId: p.category_id,
        mainImage: p.main_image,
        isFeatured: p.is_featured
      }));
      setProducts(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, mainImage: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.categoryId || !formData.mainImage) {
      alert('Por favor completa todos los campos requeridos y selecciona una imagen.');
      return;
    }
    
    setLoading(true);
    try {
      const imageUrl = typeof formData.mainImage === 'string' ? formData.mainImage : await uploadImage(formData.mainImage);
      
      const productData = {
        code: formData.code,
        name: formData.name,
        category_id: parseInt(formData.categoryId),
        description: formData.description,
        main_image: imageUrl,
        is_featured: formData.isFeatured,
        gallery: []
      };

      const { error } = await supabase.from('products').insert([productData]);
      if (error) throw error;
      
      setShowForm(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el producto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      // 1. Delete image from storage
      if (product.mainImage) {
        const urlParts = product.mainImage.split('/images/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('images').remove([filePath]);
        }
      }

      // 2. Delete product record
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      categoryId: '',
      description: '',
      mainImage: null,
      isFeatured: false
    });
    setPreviewUrl('');
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gestión de Productos</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          {showForm ? 'Cancelar' : 'Nuevo Producto'}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <h2>Agregar Nuevo Producto</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Código del Producto</label>
              <input 
                type="text" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value})}
                placeholder="Ej. ESMA-001"
              />
            </div>
            
            <div className="form-group">
              <label>Nombre</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Nombre del producto"
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <select 
                value={formData.categoryId} 
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción del producto..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Imagen Principal</label>
              <div className="image-upload-box">
                <input type="file" accept="image/*" id="mainImage" onChange={handleImageChange} hidden />
                <label htmlFor="mainImage" className="upload-label">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="upload-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={32} />
                      <span>Seleccionar Imagen</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                style={{ width: 'auto' }}
              />
              <label htmlFor="isFeatured" style={{ margin: 0 }}>¿Destacar este producto en el Inicio?</label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </form>
        </div>
      )}

      <div className="admin-grid">
        {products.map(product => (
          <div key={product.id} className="admin-card product-card">
            <div className="product-image-preview">
              <img src={product.mainImage} alt={product.name} />
              {product.isFeatured && <span className="featured-badge">Destacado</span>}
            </div>
            <div className="product-card-info">
              <span className="product-code">{product.code}</span>
              <h3>{product.name}</h3>
              <p className="product-category">{product.categoryName}</p>
            </div>
            <div className="product-card-actions">
              <button className="btn btn-icon btn-danger" onClick={() => handleDelete(product)}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && !showForm && (
          <p className="empty-state">No hay productos registrados aún.</p>
        )}
      </div>
    </div>
  );
};

export default ProductManager;
