import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Plus, Trash2, Send } from 'lucide-react';
import Navbar from './Navbar';
import './ListGenerator.css';

const ListGenerator = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  const [clientName, setClientName] = useState('');
  const [teamName, setTeamName] = useState('');

  const [players, setPlayers] = useState([
    { id: Date.now(), talla: 'M', nombre: '', numero: '', pantaloneta: 'Sí' }
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', productId).single();
      if (data) setProduct(data);
    };
    fetchProduct();
  }, [productId]);

  const addRow = () => {
    setPlayers([...players, { id: Date.now(), talla: 'M', nombre: '', numero: '', pantaloneta: 'Sí' }]);
  };

  const removeRow = (id) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const updatePlayer = (id, field, value) => {
    setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSubmit = async () => {
    if (!clientName || !teamName) {
      alert('Por favor completa tu nombre y el nombre del equipo.');
      return;
    }

    // Check if at least one player has a name or number
    const validPlayers = players.filter(p => p.nombre.trim() !== '' || p.numero.trim() !== '');
    if (validPlayers.length === 0) {
      alert('Por favor agrega al menos un jugador a la lista.');
      return;
    }

    setLoading(true);
    try {
      // Create a clean array without the internal 'id' used for React keys
      const cleanData = validPlayers.map(({ id, ...rest }) => rest);

      const { error } = await supabase.from('team_lists').insert([{
        client_name: clientName,
        team_name: teamName,
        design_id: productId,
        players_data: cleanData
      }]);

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al enviar la lista. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div className="list-generator-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="generator-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>¡Lista Enviada con Éxito!</h2>
            <p style={{ marginBottom: '2rem', color: '#888' }}>
              Hemos recibido la lista de jugadores para el equipo <strong>{teamName}</strong>.
              Nos pondremos en contacto contigo muy pronto.
            </p>
            <button className="btn btn-solid-primary" onClick={() => navigate('/')}>
              Volver al Inicio
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="list-generator-page">
        <div className="container">
          <div className="generator-header">
            <div>
              <h2 style={{ marginBottom: '0.5rem' }}>CREAR LISTA DE JUGADORES</h2>
              {product && <p style={{ color: '#888' }}>Diseño seleccionado: <strong>{product.name} (Ref: {product.code})</strong></p>}
            </div>
            <button className="btn btn-outline" onClick={() => navigate('/')} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <ArrowLeft size={18} /> Volver
            </button>
          </div>

          <div className="generator-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--primary)' }}>Datos del Pedido</h3>
            <div className="generator-form-grid">
              <div className="form-group">
                <label>Tu Nombre / Contacto</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Nombre del Equipo</label>
                <input
                  type="text"
                  placeholder="Ej. Los Halcones FC"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="generator-card">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--primary)' }}>Jugadores</h3>

            <div className="table-toolbar">
              <button className="btn btn-solid-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={addRow}>
                <Plus size={18} /> Agregar Fila
              </button>
              <button className="btn btn-outline" onClick={() => setPlayers([{ id: Date.now(), talla: 'M', nombre: '', numero: '', pantaloneta: 'Sí' }])}>
                Limpiar datos
              </button>
            </div>

            <div className="generator-table-wrapper">
              <table className="generator-table">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>Talla</th>
                    <th style={{ width: '40%' }}>Nombre en Camiseta</th>
                    <th style={{ width: '15%' }}>Número</th>
                    <th style={{ width: '20%' }}>Pantaloneta</th>
                    <th style={{ width: '10%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id}>
                      <td>
                        <select value={player.talla} onChange={(e) => updatePlayer(player.id, 'talla', e.target.value)}>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                          <option value="Talla 14">Talla 14</option>
                          <option value="Talla 16">Talla 16</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={player.nombre}
                          onChange={(e) => updatePlayer(player.id, 'nombre', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Ej. 10"
                          value={player.numero}
                          onChange={(e) => updatePlayer(player.id, 'numero', e.target.value)}
                        />
                      </td>
                      <td>
                        <select value={player.pantaloneta} onChange={(e) => updatePlayer(player.id, 'pantaloneta', e.target.value)}>
                          <option value="Sí">Sí</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn-remove-row" onClick={() => removeRow(player.id)}>
                          <Trash2 size={18} /> <span style={{ fontSize: '0.8rem' }}>Quitar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="submit-section">
              <button
                className="btn btn-solid-primary"
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '1.1rem', padding: '1rem 2rem' }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Enviando...' : <><Send size={20} /> Enviar Lista a ESMA</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListGenerator;
