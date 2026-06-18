import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Users, LogOut, Settings } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Login from './Login';
import './Admin.css';

const AdminLayout = () => {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>Cargando...</div>;
  }

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>ESMA ADMIN</h2>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/products" className={location.pathname === '/admin/products' ? 'active' : ''}>
            <Package size={20} /> Productos
          </Link>
          <Link to="/admin/categories" className={location.pathname === '/admin/categories' ? 'active' : ''}>
            <Tags size={20} /> Categorías
          </Link>
          <Link to="/admin/teams" className={location.pathname === '/admin/teams' ? 'active' : ''}>
            <Users size={20} /> Equipos
          </Link>
          <Link to="/admin/settings" className={location.pathname === '/admin/settings' ? 'active' : ''}>
            <Settings size={20} /> Configuración
          </Link>
          <a href="#" className="admin-logout" onClick={handleLogout}>
            <LogOut size={20} /> Cerrar Sesión
          </a>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h3>Panel de Administración</h3>
          <div style={{color: '#888', fontSize: '0.9rem'}}>{session.user.email}</div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
