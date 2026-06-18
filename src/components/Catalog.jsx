import React, { useState, useEffect } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import './Catalog.css';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('TODAS');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('http://localhost:3000/api/products'),
        fetch('http://localhost:3000/api/categories')
      ]);
      const prods = await prodRes.json();
      const cats = await catRes.json();
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'TODAS' || p.categoryName === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <section className="section catalog-section" id="catalogo">
      <div className="container">
        <div className="catalog-header">
          <div>
            <span className="subtitle">COLECCIÓN</span>
            <h2>NUESTROS DISEÑOS</h2>
          </div>
          <div className="catalog-header-text">
            <p>Cada modelo se personaliza con nombre, número y escudo a elección.</p>
          </div>
        </div>

        <div className="catalog-search-wrapper">
          <div className="search-box">
            <Search size={20} color="#888" />
            <input
              type="text"
              placeholder="Buscar diseño por nombre o código..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="catalog-filters">
          <button
            className={`filter-btn ${activeCategory === 'TODAS' ? 'active' : ''}`}
            onClick={() => setActiveCategory('TODAS')}
          >
            TODAS
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`filter-btn ${activeCategory === c.name ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.name)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="catalog-grid">
          {filteredProducts.map((item) => (
            <div className="catalog-card" key={item.id}>
              <div className="card-tag">{item.categoryName}</div>
              <div className="catalog-image">
                <img src={item.mainImage} alt={item.name} />
              </div>
              <div className="catalog-info">
                <div>
                  <span className="design-id">DISEÑO #{item.code}</span>
                  <h3>{item.name}</h3>
                </div>
                <div className="arrow-btn">
                  <ArrowRight size={20} color="#000" />
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div style={{ color: '#888', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
              No se encontraron diseños.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Catalog;
