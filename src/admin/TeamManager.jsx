import React, { useState, useEffect } from 'react';
import { Trash2, Upload, Plus, Edit } from 'lucide-react';
import { supabase, getTenantId } from '../supabaseClient';
import './Admin.css';

const TeamManager = () => {
  const [teams, setTeams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear().toString(),
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const tenantId = await getTenantId();
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTeams(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `teams/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.year) {
      alert('Por favor completa todos los campos.');
      return;
    }

    if (!editingId && !formData.image) {
      alert('Por favor selecciona una imagen para el nuevo equipo.');
      return;
    }
    
    setLoading(true);
    try {
      let imageUrl = formData.image;
      if (typeof formData.image !== 'string' && formData.image !== null) {
        imageUrl = await uploadImage(formData.image);
      }

      const tenantId = await getTenantId();
      const teamData = {
        tenant_id: tenantId,
        name: formData.name,
        year: formData.year,
      };

      if (imageUrl) {
        teamData.image = imageUrl;
      }

      if (editingId) {
        const { error } = await supabase
          .from('teams')
          .update(teamData)
          .eq('id', editingId)
          .eq('tenant_id', tenantId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('teams').insert([teamData]);
        if (error) throw error;
      }
      
      handleCancelForm();
      fetchTeams();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el equipo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team) => {
    setFormData({
      name: team.name,
      year: team.year,
      image: team.image,
    });
    setPreviewUrl(team.image);
    setEditingId(team.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (team) => {
    if (!window.confirm('¿Eliminar este equipo?')) return;
    
    try {
      if (team.image) {
        const urlParts = team.image.split('/images/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('images').remove([filePath]);
        }
      }

      const tenantId = await getTenantId();
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id)
        .eq('tenant_id', tenantId);
      if (error) throw error;
      
      fetchTeams();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      year: new Date().getFullYear().toString(),
      image: null,
    });
    setPreviewUrl('');
  };

  return (
    <div className="admin-page">
      <div className="admin-header flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>Gestión de Equipos</h1>
        <button className="btn btn-primary" onClick={showForm ? handleCancelForm : () => setShowForm(true)}>
          <Plus size={20} />
          {showForm ? 'Cancelar' : 'Nuevo Equipo'}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <h2>{editingId ? 'Editar Equipo' : 'Agregar Nuevo Equipo'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label>Nombre del Equipo / Cliente</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Selección Municipal"
              />
            </div>
            
            <div className="form-group">
              <label>Año</label>
              <input 
                type="text" 
                value={formData.year} 
                onChange={e => setFormData({...formData, year: e.target.value})}
                placeholder="Ej. 2024"
              />
            </div>

            <div className="form-group">
              <label>Imagen del Equipo</label>
              <div className="image-upload-box">
                <input type="file" accept="image/*" id="teamImage" onChange={handleImageChange} hidden />
                <label htmlFor="teamImage" className="upload-label">
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

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (editingId ? 'Actualizar Equipo' : 'Guardar Equipo')}
            </button>
          </form>
        </div>
      )}

      <div className="admin-grid">
        {teams.map(team => (
          <div key={team.id} className="admin-card product-card">
            <div className="product-image-preview">
              <img src={team.image} alt={team.name} />
            </div>
            <div className="product-card-info">
              <h3>{team.name}</h3>
              <p>Año: {team.year}</p>
            </div>
            <div className="product-card-actions" style={{ gap: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-icon" onClick={() => handleEdit(team)} style={{ backgroundColor: 'transparent', border: '1px solid #444', color: '#fff' }}>
                <Edit size={18} />
              </button>
              <button className="btn btn-icon btn-danger" onClick={() => handleDelete(team)}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {teams.length === 0 && !showForm && (
          <p className="empty-state">No hay equipos registrados aún.</p>
        )}
      </div>
    </div>
  );
};

export default TeamManager;
