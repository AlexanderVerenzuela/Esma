import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Download, Eye, X } from 'lucide-react';
import './Admin.css';

const ListManager = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const { data, error } = await supabase
        .from('team_lists')
        .select(`
          *,
          product:design_id (name, code)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLists(data);
    } catch (err) {
      console.error(err);
      alert('Error cargando listas');
    } finally {
      setLoading(false);
    }
  };

  const deleteList = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta lista?')) {
      try {
        const { error } = await supabase.from('team_lists').delete().eq('id', id);
        if (error) throw error;
        setLists(lists.filter(l => l.id !== id));
      } catch (err) {
        console.error(err);
        alert('Error al eliminar');
      }
    }
  };

  const downloadCSV = (list) => {
    const headers = ['Talla', 'Nombre en Camiseta', 'Numero', 'Pantaloneta'];
    const rows = list.players_data.map(p => [
      p.talla || '', 
      p.nombre || '', 
      p.numero || '', 
      p.pantaloneta || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n" 
      + rows.map(e => e.map(item => `"${item}"`).join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${list.team_name.replace(/\s+/g, '_')}_lista.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <div className="admin-page"><p>Cargando listas...</p></div>;

  return (
    <div className="admin-page">
      <div className="admin-header flex-between mb-4">
        <h2>Listas de Equipos Recibidas</h2>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Equipo</th>
              <th>Diseño Seleccionado</th>
              <th>Jugadores</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lists.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No hay listas registradas todavía.</td>
              </tr>
            )}
            {lists.map((list) => (
              <tr key={list.id}>
                <td>{new Date(list.created_at).toLocaleDateString()}</td>
                <td>{list.client_name}</td>
                <td><strong>{list.team_name}</strong></td>
                <td>{list.product ? `${list.product.name} (#${list.product.code})` : 'Diseño eliminado'}</td>
                <td>{list.players_data.length} jug.</td>
                <td>
                  <button className="admin-btn" style={{ marginRight: '0.5rem' }} onClick={() => setSelectedList(list)}>
                    <Eye size={16} /> Ver
                  </button>
                  <button className="admin-btn" style={{ marginRight: '0.5rem', backgroundColor: 'var(--primary)', color: '#000' }} onClick={() => downloadCSV(list)}>
                    <Download size={16} /> CSV
                  </button>
                  <button className="admin-btn-danger" onClick={() => deleteList(list.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Visor de Lista */}
      {selectedList && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', 
            width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Lista: {selectedList.team_name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#888' }}>Cliente: {selectedList.client_name} | {new Date(selectedList.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedList(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Talla</th>
                    <th>Nombre</th>
                    <th>Número</th>
                    <th>Pantaloneta</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedList.players_data.map((p, i) => (
                    <tr key={i}>
                      <td style={{ color: '#888' }}>{i + 1}</td>
                      <td>{p.talla}</td>
                      <td>{p.nombre}</td>
                      <td>{p.numero}</td>
                      <td>{p.pantaloneta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="admin-btn" style={{ backgroundColor: 'var(--primary)', color: '#000' }} onClick={() => downloadCSV(selectedList)}>
                <Download size={18} /> Descargar CSV
              </button>
              <button className="admin-btn" onClick={() => setSelectedList(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListManager;
