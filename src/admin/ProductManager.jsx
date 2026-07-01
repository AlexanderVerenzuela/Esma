import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, Edit, Search } from 'lucide-react';
import { supabase, getTenantId } from '../supabaseClient';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  
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
      const tenantId = await getTenantId();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenantId);
      if (!error) setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const tenantId = await getTenantId();
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (name)
        `)
        .eq('tenant_id', tenantId)
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
    if (!formData.name || !formData.categoryId) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!editingId && !formData.mainImage) {
      alert('Por favor selecciona una imagen para el nuevo producto.');
      return;
    }
    
    setLoading(true);
    try {
      let imageUrl = formData.mainImage;
      if (typeof formData.mainImage !== 'string' && formData.mainImage !== null) {
        imageUrl = await uploadImage(formData.mainImage);
      }
      
      const tenantId = await getTenantId();
      const productData = {
        tenant_id: tenantId,
        code: formData.code || `PROD-${Date.now()}`,
        name: formData.name,
        category_id: parseInt(formData.categoryId),
        description: formData.description,
        is_featured: formData.isFeatured,
      };

      if (imageUrl) {
        productData.main_image = imageUrl;
      }

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId)
          .eq('tenant_id', tenantId);
        if (error) throw error;
      } else {
        productData.gallery = [];
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }
      
      handleCancelForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el producto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      description: product.description || '',
      mainImage: product.mainImage,
      isFeatured: product.isFeatured
    });
    setPreviewUrl(product.mainImage);
    setEditingId(product.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (product) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      if (product.mainImage) {
        const urlParts = product.mainImage.split('/images/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('images').remove([filePath]);
        }
      }

      const tenantId = await getTenantId();
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)
        .eq('tenant_id', tenantId);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-header flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>Gestión de Productos</h1>
        <button className="btn btn-primary" onClick={showForm ? handleCancelForm : () => setShowForm(true)}>
          <Plus size={20} />
          {showForm ? 'Cancelar' : 'Nuevo Producto'}
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', padding: '0.5rem 1rem' }}>
          <Search size={20} color="#888" style={{ marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Buscar producto por nombre o código..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff', outline: 'none', fontSize: '1rem' }}
          />
        </div>
      </div>

      {showForm && (
        <div className="admin-card">
          <h2>{editingId ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Nombre del Diseño</label>
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
              {loading ? 'Guardando...' : (editingId ? 'Actualizar Producto' : 'Guardar Producto')}
            </button>
          </form>
        </div>
      )}

      <div className="admin-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="admin-card product-card">
            <div className="product-image-preview">
              <img src={product.mainImage} alt={product.name} />
              {product.isFeatured && <span className="featured-badge">Destacado</span>}
            </div>
            <div className="product-card-info">
              {/* <span className="product-code">{product.code}</span> */}
              <h3>{product.name}</h3>
              <p className="product-category">{product.categoryName}</p>
            </div>
            <div className="product-card-actions" style={{ gap: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-icon" onClick={() => handleEdit(product)} style={{ backgroundColor: 'transparent', border: '1px solid #444', color: '#fff' }}>
                <Edit size={18} />
              </button>
              <button className="btn btn-icon btn-danger" onClick={() => handleDelete(product)}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && !showForm && (
          <p className="empty-state">
            {searchQuery ? 'No se encontraron productos que coincidan con la búsqueda.' : 'No hay productos registrados aún.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductManager;
