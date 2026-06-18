import React, { useState, useEffect } from 'react';
import { Trash2, Upload, Plus } from 'lucide-react';
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

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/teams');
      const data = await res.json();
      setTeams(data);
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
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.year || !formData.image) {
      alert('Por favor completa todos los campos y selecciona una imagen.');
      return;
    }
    
    setLoading(true);
    try {
      const imageUrl = await uploadImage(formData.image);
      const teamData = {
        name: formData.name,
        year: formData.year,
        image: imageUrl
      };

      await fetch('http://localhost:3000/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });
      
      setShowForm(false);
      setFormData({ name: '', year: new Date().getFullYear().toString(), image: null });
      setPreviewUrl('');
      fetchTeams();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el equipo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este equipo?')) {
      await fetch(`http://localhost:3000/api/teams/${id}`, { method: 'DELETE' });
      fetchTeams();
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gestión de Equipos</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          {showForm ? 'Cancelar' : 'Nuevo Equipo'}
        </button>
      </div>

      {showForm && (
        <div className="admin-card">
          <h2>Agregar Nuevo Equipo</h2>
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
              {loading ? 'Guardando...' : 'Guardar Equipo'}
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
            <div className="product-card-actions">
              <button className="btn btn-icon btn-danger" onClick={() => handleDelete(team.id)}>
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
