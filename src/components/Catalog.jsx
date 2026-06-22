import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, ListPlus, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import EditableText from './editor/EditableText';

import './Catalog.css';

const Catalog = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'todos', name: 'Todos' }]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // Custom Modal State
  const [zoomStyle, setZoomStyle] = useState({ transform: 'scale(1)', cursor: 'zoom-in', transformOrigin: 'center center' });

  const handleCloseModal = () => {
    setSelectedImage(null);
    setZoomStyle({ transform: 'scale(1)', cursor: 'zoom-in', transformOrigin: 'center center' });
  };

  const handleToggleZoom = (e) => {
    if (zoomStyle.transform.includes('scale(1)')) {
      const { left, top, width, height } = e.target.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomStyle({ transform: 'scale(2.5)', cursor: 'zoom-out', transformOrigin: `${x}% ${y}%` });
    } else {
      setZoomStyle({ transform: 'scale(1)', cursor: 'zoom-in', transformOrigin: 'center center' });
    }
  };

  const handleMouseMove = (e) => {
    if (zoomStyle.transform.includes('scale(2.5)')) {
      const { left, top, width, height } = e.target.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomStyle(prev => ({ ...prev, transformOrigin: `${x}% ${y}%` }));
    }
  };

  const ITEMS_PER_PAGE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

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
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'Todos' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
      const y = catalogSection.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    
    // Allow the smooth scroll to start before snapping the layout height
    setTimeout(() => {
      setCurrentPage(newPage);
    }, 400);
  };

  return (
    <>
      <section className="section catalog-section" id="catalogo">
        <div className="container">
          <div className="catalog-header">
            <div>
              <span className="subtitle"><EditableText id="catalog_tag" defaultText="COLECCIÓN" /></span>
              <EditableText id="catalog_title" defaultText="NUESTROS DISEÑOS" as="h2" />
            </div>
            <div className="catalog-header-text">
              <EditableText id="catalog_subtitle" defaultText="Cada modelo se personaliza con nombre, número y escudo a elección." as="p" />
            </div>
          </div>

          <div className="catalog-search-wrapper">
            <div className="search-box">
              <Search size={20} color="#888" />
              <input
                type="text"
                placeholder="Buscar diseño por nombre..."
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
            {currentProducts.map((item) => (
              <div className="catalog-card" key={item.id}>
                <div className="card-tag">{item.category}</div>
                <div className="catalog-image" onClick={() => setSelectedImage(item)}>
                  <div className="catalog-image-overlay">
                    <span>Ver Diseño</span>
                  </div>
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="catalog-info" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexGrow: 1 }}>
                    <div>
                      {/* <span className="design-id">DISEÑO #{item.code}</span> */}
                      <h3>{item.name}</h3>
                    </div>
                  </div>
                  <button 
                    className="btn btn-outline" 
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center', marginTop: 'auto', padding: '0.5rem', fontSize: '0.9rem' }}
                    onClick={() => navigate(`/armar-lista/${item.id}`)}
                  >
                    <ListPlus size={16} /> Armar Lista
                  </button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div style={{ color: '#888', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                No se encontraron diseños.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
              <button 
                className="btn btn-outline" 
                disabled={currentPage === 1}
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              >
                Anterior
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      border: '1px solid var(--primary)',
                      backgroundColor: currentPage === i + 1 ? 'var(--primary)' : 'transparent',
                      color: currentPage === i + 1 ? '#000' : 'var(--primary)',
                      fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                className="btn btn-outline" 
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Custom Aesthetic Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={handleCloseModal}>
          <button className="image-modal-close" onClick={handleCloseModal}>
            <X size={32} />
          </button>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage.image} 
              alt={selectedImage.name} 
              style={{ ...zoomStyle, transition: zoomStyle.transform.includes('scale(1)') ? 'transform 0.3s ease' : 'none' }}
              onClick={handleToggleZoom}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                if (zoomStyle.transform.includes('scale(2.5)')) {
                   setZoomStyle(prev => ({ ...prev, transformOrigin: 'center center' }))
                }
              }}
            />
            <div className="image-modal-info">
              <h4>{selectedImage.name}</h4>
              {/* <span>DISEÑO #{selectedImage.code}</span> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Catalog;
