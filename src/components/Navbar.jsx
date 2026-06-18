import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled glass' : ''}`}>
      <div className="container nav-container">
        <a href="#" className="brand">
          <img src="/images/logo.png" alt="ESMA Sportwear" className="nav-logo" />
        </a>
        <ul className="nav-links">
          <li><a href="#catalogo">Catálogo</a></li>
          <li><a href="#equipos">Equipos</a></li>
          <li><a href="#contacto" className="nav-btn">Contacto</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
