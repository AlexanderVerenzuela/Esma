import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicSite from './PublicSite';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import ProductManager from './admin/ProductManager';
import CategoryManager from './admin/CategoryManager';
import TeamManager from './admin/TeamManager';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="teams" element={<TeamManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
