import React, { useState, useEffect } from 'react';
import { supabase, getTenantId } from '../supabaseClient';
import { Download, Eye, X } from 'lucide-react';
import * as XLSX from 'xlsx';
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
      const tenantId = await getTenantId();
      const { data, error } = await supabase
        .from('team_lists')
        .select(`
          *,
          product:design_id (name)
        `)
        .eq('tenant_id', tenantId)
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
        const tenantId = await getTenantId();
        const { error } = await supabase
          .from('team_lists')
          .delete()
          .eq('id', id)
          .eq('tenant_id', tenantId);
        if (error) throw error;
        setLists(lists.filter(l => l.id !== id));
      } catch (err) {
        console.error(err);
        alert('Error al eliminar');
      }
    }
  };

  const downloadExcel = (list) => {
    const data = list.players_data.map((p, index) => ({
      'Nº': index + 1,
      'Talla': p.talla || '',
      'Nombre en Camiseta': p.nombre || '',
      'Número': p.numero || '',
      'Short': p.pantaloneta || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jugadores");
    
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 10 },
      { wch: 30 },
      { wch: 10 },
      { wch: 10 }
    ];

    XLSX.writeFile(workbook, `${list.team_name.replace(/\s+/g, '_')}_lista.xlsx`);
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
                <td>{list.product ? list.product.name : 'Diseño eliminado'}</td>
                <td>{list.players_data.length} jug.</td>
                <td>
                  <button className="admin-btn" style={{ marginRight: '0.5rem' }} onClick={() => setSelectedList(list)}>
                    <Eye size={16} /> Ver
                  </button>
                  <button className="admin-btn" style={{ marginRight: '0.5rem', backgroundColor: '#107c41', color: '#fff', borderColor: '#107c41' }} onClick={() => downloadExcel(list)}>
                    <Download size={16} /> Excel
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
                    <th>Short</th>
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
              <button className="admin-btn" style={{ backgroundColor: '#107c41', color: '#fff', borderColor: '#107c41' }} onClick={() => downloadExcel(selectedList)}>
                <Download size={18} /> Descargar Excel
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
