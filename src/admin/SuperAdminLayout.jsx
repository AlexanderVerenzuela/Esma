import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Building2, UserPlus, ShieldAlert, ArrowLeft, LogOut, Loader, Plus, Shield } from 'lucide-react';
import './Admin.css';

const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Form states
  const [newTenant, setNewTenant] = useState({ name: '', slug: '' });
  const [newUser, setNewUser] = useState({ email: '', password: '', tenantId: '', role: 'admin' });
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session && (session.user.email === 'admin@esmasportwear.com' || session.user.email === 'alexmacuin@esmasportwear.com')) {
        fetchData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && (session.user.email === 'admin@esmasportwear.com' || session.user.email === 'alexmacuin@esmasportwear.com')) {
        fetchData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch tenants
      const { data: tenantData, error: tenantErr } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      if (tenantErr) throw tenantErr;
      setTenants(tenantData || []);

      // Fetch users associated with tenants
      const { data: userData, error: userErr } = await supabase
        .from('tenant_users')
        .select(`
          tenant_id,
          user_id,
          role,
          tenants (name, slug)
        `);
      if (userErr) throw userErr;

      // Because auth.users is protected in Supabase, we can't select email directly through normal client select,
      // but we can retrieve details, and since superadmin created them or knows the relationship, we can show details.
      // Note: We can retrieve the emails if we do a RPC or if we store user emails.
      // To make it simple, we will show the associated user IDs, or we can fetch them. Let's just list the associated relations.
      setUsers(userData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    if (!newTenant.name || !newTenant.slug) return;
    
    setActionLoading(true);
    setMessage({ text: '', isError: false });
    try {
      const slugClean = newTenant.slug.trim().toLowerCase().replace(/\s+/g, '-');
      const { data, error } = await supabase
        .from('tenants')
        .insert([{ name: newTenant.name, slug: slugClean }])
        .select();

      if (error) throw error;

      setMessage({ text: `Tenant "${newTenant.name}" creado con éxito.`, isError: false });
      setNewTenant({ name: '', slug: '' });
      fetchData();
    } catch (err) {
      setMessage({ text: 'Error creando cliente: ' + err.message, isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.tenantId) return;

    setActionLoading(true);
    setMessage({ text: '', isError: false });
    try {
      const formattedEmail = newUser.email.includes('@') ? newUser.email : `${newUser.email}@esmasportwear.com`;
      // Call Postgres RPC function
      const { data, error } = await supabase.rpc('create_tenant_user', {
        p_email: formattedEmail,
        p_password: newUser.password,
        p_tenant_id: newUser.tenantId,
        p_role: newUser.role
      });

      if (error) throw error;

      setMessage({ text: `Usuario "${newUser.email}" creado y asignado con éxito.`, isError: false });
      setNewUser({ email: '', password: '', tenantId: '', role: 'admin' });
      fetchData();
    } catch (err) {
      setMessage({ text: 'Error creando usuario: ' + err.message, isError: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff', gap: '1rem' }}>
        <Loader className="spin" size={32} color="var(--primary)" />
        <span>Cargando Panel Maestro...</span>
      </div>
    );
  }

  // Guard Clause: Only admin@esmasportwear.com and alexmacuin@esmasportwear.com are allowed
  if (!session || (session.user.email !== 'admin@esmasportwear.com' && session.user.email !== 'alexmacuin@esmasportwear.com')) {
    return (
      <div className="login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#000' }}>
        <div className="login-box" style={{ textAlign: 'center', maxWidth: '450px' }}>
          <ShieldAlert size={48} color="#ff4444" style={{ marginBottom: '1.5rem' }} />
          <h2>Acceso Denegado</h2>
          <p style={{ color: '#888', margin: '1rem 0 2rem' }}>
            No tienes los privilegios necesarios para acceder a esta sección de control maestro.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/" className="btn btn-outline" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={16} /> Ir al Inicio
            </Link>
            <button className="btn btn-primary" onClick={handleLogout} style={{ flex: 1 }}>
              Iniciar con otra Cuenta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Sidebar for Super Admin */}
      <aside className="admin-sidebar open">
        <div className="admin-brand">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem' }}>
            <Shield size={24} color="var(--primary)" /> CONTROL MAESTRO
          </h2>
        </div>
        <nav className="admin-nav">
          <div style={{ padding: '1rem', color: '#ff4444', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px' }}>
            SÚPER ADMINISTRADOR
          </div>
          <Link to="/superadmin" className="active">
            <Building2 size={20} /> Gestión de Clientes
          </Link>
          <a href="#" className="admin-logout" onClick={handleLogout}>
            <LogOut size={20} /> Cerrar Sesión
          </a>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header admin-main-header">
          <h3>Panel del Sistema (Multitenant Master)</h3>
          <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{session.user.email}</div>
        </header>

        <div className="admin-content">
          {message.text && (
            <div 
              style={{ 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem', 
                backgroundColor: message.isError ? 'rgba(255,68,68,0.1)' : 'rgba(0,255,100,0.1)', 
                color: message.isError ? '#ff4444' : '#00ff64',
                border: `1px solid ${message.isError ? '#ff4444' : '#00ff64'}` 
              }}
            >
              {message.text}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Form 1: New Tenant */}
            <div className="admin-card">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="var(--primary)" /> Crear Nuevo Cliente (Tenant)
              </h3>
              <form onSubmit={handleCreateTenant} className="admin-form">
                <div className="form-group">
                  <label>Nombre de la Empresa / Marca</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Club Deportivo San Isidro" 
                    value={newTenant.name}
                    onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Slug (Identificador URL / Subdominio)</label>
                  <input 
                    type="text" 
                    placeholder="Ej. san-isidro" 
                    value={newTenant.slug}
                    onChange={e => setNewTenant({ ...newTenant, slug: e.target.value })}
                    required
                  />
                  <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                    Debe ser único y sin espacios (solo letras, números y guiones).
                  </small>
                </div>
                <button type="submit" className="admin-btn" disabled={actionLoading} style={{ width: '100%' }}>
                  Registrar Empresa
                </button>
              </form>
            </div>

            {/* Form 2: New Admin User */}
            <div className="admin-card">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} color="var(--primary)" /> Habilitar Usuario para Cliente
              </h3>
              <form onSubmit={handleCreateUser} className="admin-form">
                <div className="form-group">
                  <label>Seleccionar Cliente</label>
                  <select 
                    value={newUser.tenantId} 
                    onChange={e => setNewUser({ ...newUser, tenantId: e.target.value })}
                    required
                  >
                    <option value="">Selecciona un cliente</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Usuario de Acceso</label>
                  <input 
                    type="text" 
                    placeholder="Ej. demo" 
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contraseña Provisional</label>
                  <input 
                    type="text" 
                    placeholder="Contraseña de ingreso" 
                    value={newUser.password}
                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="admin-btn" disabled={actionLoading} style={{ width: '100%' }}>
                  Crear y Asignar Cuenta
                </button>
              </form>
            </div>
          </div>

          {/* Tenants List */}
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Listado de Empresas / Tenants Activos</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Slug</th>
                    <th>ID de Base de Datos</th>
                    <th>Fecha de Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map(t => (
                    <tr key={t.id}>
                      <td><strong>{t.name}</strong></td>
                      <td><code style={{ color: 'var(--primary)' }}>{t.slug}</code></td>
                      <td style={{ fontSize: '0.85rem', color: '#888' }}>{t.id}</td>
                      <td>{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>No hay empresas registradas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Assignments List */}
          <div className="admin-card">
            <h3 style={{ marginBottom: '1.5rem' }}>Asociaciones de Usuarios y Roles</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID de Usuario</th>
                    <th>Empresa / Tenant</th>
                    <th>Slug</th>
                    <th>Rol asignado</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: '0.85rem', color: '#888' }}>{u.user_id}</td>
                      <td><strong>{u.tenants?.name}</strong></td>
                      <td><code style={{ color: 'var(--primary)' }}>{u.tenants?.slug}</code></td>
                      <td><span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{u.role.toUpperCase()}</span></td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center' }}>No hay usuarios asociados a clientes todavía</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminLayout;
