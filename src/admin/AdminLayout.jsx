import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Users, LogOut, Settings, Menu, X, ClipboardList, FileText, Shield } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Login from './Login';
import './Admin.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session && (session.user.email === 'admin@esmasportwear.com' || session.user.email === 'alexmacuin@esmasportwear.com')) {
        navigate('/superadmin');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && (session.user.email === 'admin@esmasportwear.com' || session.user.email === 'alexmacuin@esmasportwear.com')) {
        navigate('/superadmin');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#fff' }}>Cargando...</div>;
  }

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  return (
    <div className="admin-container">
      {/* Mobile Header */}
      <div className="admin-mobile-topbar">
        <div className="admin-brand-mobile">ESMA ADMIN</div>
        <button className="admin-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} color="#fff" /> : <Menu size={24} color="#fff" />}
        </button>
      </div>

      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="admin-brand">
          <h2>ESMA ADMIN</h2>
        </div>
        <nav className="admin-nav">
          {(session.user.email === 'admin@esmasportwear.com' || session.user.email === 'alexmacuin@esmasportwear.com') && (
            <Link to="/superadmin" style={{ color: 'var(--primary)', fontWeight: 'bold', borderBottom: '1px solid #222', paddingBottom: '1rem', marginBottom: '0.5rem', display: 'flex', gap: '10px' }} onClick={closeMenu}>
              <Shield size={20} color="var(--primary)" /> Control Maestro
            </Link>
          )}
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''} onClick={closeMenu}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/lists" className={location.pathname === '/admin/lists' ? 'active' : ''} onClick={closeMenu}>
            <ClipboardList size={20} /> Listas de Equipos
          </Link>
          <Link to="/admin/products" className={location.pathname === '/admin/products' ? 'active' : ''} onClick={closeMenu}>
            <Package size={20} /> Productos
          </Link>
          <Link to="/admin/categories" className={location.pathname === '/admin/categories' ? 'active' : ''} onClick={closeMenu}>
            <Tags size={20} /> Categorías
          </Link>
          <Link to="/admin/teams" className={location.pathname === '/admin/teams' ? 'active' : ''} onClick={closeMenu}>
            <Users size={20} /> Equipos
          </Link>
          <Link to="/admin/quotes" className={location.pathname === '/admin/quotes' ? 'active' : ''} onClick={closeMenu}>
            <FileText size={20} /> Cotizaciones
          </Link>
          <Link to="/admin/settings" className={location.pathname === '/admin/settings' ? 'active' : ''} onClick={closeMenu}>
            <Settings size={20} /> Configuración
          </Link>
          <a href="#" className="admin-logout" onClick={handleLogout}>
            <LogOut size={20} /> Cerrar Sesión
          </a>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header admin-main-header">
          <h3>Panel de Administración</h3>
          <div style={{color: '#888', fontSize: '0.9rem', wordBreak: 'break-all'}}>{session.user.email}</div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
