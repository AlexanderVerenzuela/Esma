import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase, getTenantId } from '../supabaseClient';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const tenantId = await getTenantId();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('id', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const tenantId = await getTenantId();
      const { error } = await supabase.from('categories').insert([{ tenant_id: tenantId, name: newCategory }]);
      if (error) throw error;
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Error al agregar categoría: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
      const tenantId = await getTenantId();
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);
      if (error) throw error;
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert('No se puede eliminar la categoría. Probablemente está en uso por algún producto.');
    }
  };

  return (
    <div className="admin-card">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Categorías</h2>
      </div>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input 
          type="text" 
          className="admin-input" 
          placeholder="Nueva categoría..." 
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="admin-btn">
          <Plus size={18} /> Agregar
        </button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th style={{ width: '100px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>{cat.name}</td>
              <td>
                <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(cat.id)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No hay categorías</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryManager;
