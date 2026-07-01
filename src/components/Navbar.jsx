import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { getTenantSlug } from '../supabaseClient';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [tenantSlug, setTenantSlug] = useState('default');

  useEffect(() => {
    setTenantSlug(getTenantSlug());
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled glass' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="brand">
          {tenantSlug === 'demo' ? (
            <span style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '2px', color: 'var(--primary)', fontFamily: 'sans-serif' }}>SPORTSWEAR</span>
          ) : (
            <img src="/images/logo.png" alt="ESMA Sportwear" className="nav-logo" />
          )}
        </Link>
        
        {/* Mobile Toggle */}
        <div className="mobile-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>

        <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
          <li><a href="#catalogo" onClick={toggleMenu}>Catálogo</a></li>
          <li><a href="#equipos" onClick={toggleMenu}>Equipos</a></li>
          <li><a href="#contacto" className="nav-btn" onClick={toggleMenu}>Contacto</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
