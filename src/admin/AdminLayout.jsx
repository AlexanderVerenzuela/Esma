import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Users, LogOut } from 'lucide-react';
import './Admin.css';

const AdminLayout = () => {
  const location = useLocation();

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
          <a href="/" className="admin-logout">
            <LogOut size={20} /> Volver a la Web
          </a>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h3>Panel de Administración</h3>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
