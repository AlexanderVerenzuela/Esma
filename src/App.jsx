import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicSite from './PublicSite';
import ListGenerator from './components/ListGenerator';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import ProductManager from './admin/ProductManager';
import CategoryManager from './admin/CategoryManager';
import TeamManager from './admin/TeamManager';
import ListManager from './admin/ListManager';
import Settings from './admin/Settings';
import QuoteGenerator from './admin/QuoteGenerator';
import { SiteProvider } from './context/SiteContext';
import SuperAdminLayout from './admin/SuperAdminLayout';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  React.useEffect(() => {
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <SiteProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicSite />} />
          <Route path="/armar-lista/:productId" element={<ListGenerator />} />
          <Route path="/superadmin" element={<SuperAdminLayout />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="lists" element={<ListManager />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="teams" element={<TeamManager />} />
            <Route path="settings" element={<Settings />} />
            <Route path="quotes" element={<QuoteGenerator />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SiteProvider>
  );
}

export default App;
