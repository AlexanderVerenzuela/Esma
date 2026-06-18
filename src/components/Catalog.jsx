import React, { useState, useEffect } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Catalog.css';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'todos', name: 'Todos' }]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: catData, error: catError } = await supabase.from('categories').select('*');
      if (catError) throw catError;
      setCategories([{ id: 'todos', name: 'Todos' }, ...catData]);

      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (name)
        `)
        .order('created_at', { ascending: false });
      
      if (prodError) throw prodError;

      const formatted = prodData.map(p => ({
        ...p,
        category: p.categories?.name,
        image: p.main_image
      }));
      setProducts(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'Todos' || p.category === activeCategory;
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
          {categories.map(c => (
            <button
              key={c.id}
              className={`filter-btn ${activeCategory === c.name ? 'active' : ''}`}
              onClick={() => setActiveCategory(c.name)}
            >
              {c.name.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="catalog-grid">
          {filteredProducts.map((item) => (
            <div className="catalog-card" key={item.id}>
              <div className="card-tag">{item.category}</div>
              <div className="catalog-image">
                <img src={item.image} alt={item.name} />
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
