import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Loader } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { supabase } from '../../supabaseClient';
import './Editor.css';

const EditableImage = ({ 
  id, 
  defaultSrc, 
  mobileId, 
  defaultMobileSrc, 
  className = '', 
  style = {}, 
  isBackground = false, 
  children 
}) => {
  const { content, isEditMode, updateContent } = useSite();
  const [isUploading, setIsUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const pcFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);

  const currentSrc = content[id] !== undefined ? content[id] : defaultSrc;
  const currentMobileSrc = mobileId ? (content[mobileId] !== undefined ? content[mobileId] : defaultMobileSrc) : null;

  const handleUpload = async (e, targetId) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${targetId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // We use the 'images' bucket since it's already public and working
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      
      updateContent(targetId, data.publicUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = (e) => {
    if (isEditMode) {
      // Trigger background changing only when clicking background controls, background container or overlay
      if (
        e.target.closest('.editable-bg-btn') || 
        e.target.classList.contains('hero-overlay') || 
        e.target.classList.contains(className.split(' ')[0]) ||
        e.target === e.currentTarget
      ) {
        e.stopPropagation();
        if (mobileId) {
          setShowMenu(true);
        } else {
          pcFileInputRef.current?.click();
        }
      }
    }
  };

  if (isBackground) {
    const inlineStyles = {
      ...style,
      '--bg-pc': `url(${currentSrc})`,
      '--bg-mobile': mobileId ? `url(${currentMobileSrc})` : `url(${currentSrc})`,
      backgroundImage: 'var(--bg-pc)',
      position: 'relative'
    };

    return (
      <div 
        className={`${className} ${isEditMode ? 'editable-bg' : ''}`} 
        style={inlineStyles}
        onClick={handleClick}
      >
        {isEditMode && (
          <div className="editable-bg-btn" title="Cambiar imagen de fondo">
            {isUploading ? <Loader className="spin" size={20} color="#FFF" /> : <ImageIcon size={20} color="#FFF" />}
            <span style={{marginLeft: '8px', fontSize: '12px', fontWeight: 'bold'}}>FONDO</span>
          </div>
        )}
        
        {/* Hidden File Inputs */}
        <input 
          type="file" 
          accept="image/*" 
          ref={pcFileInputRef} 
          style={{ display: 'none' }} 
          onChange={(e) => handleUpload(e, id)}
        />
        {mobileId && (
          <input 
            type="file" 
            accept="image/*" 
            ref={mobileFileInputRef} 
            style={{ display: 'none' }} 
            onChange={(e) => handleUpload(e, mobileId)}
          />
        )}

        {/* Modal selection chooser for PC vs Mobile Banner */}
        {showMenu && (
          <div className="editor-modal-overlay" onClick={() => setShowMenu(false)}>
            <div className="editor-modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Cambiar Imagen de Fondo</h3>
              <p>Selecciona qué versión del banner deseas cambiar:</p>
              
              <div className="editor-modal-options">
                <button className="editor-modal-btn" onClick={() => { pcFileInputRef.current?.click(); setShowMenu(false); }}>
                  <ImageIcon size={20} />
                  <span>Banner PC / Escritorio</span>
                </button>
                
                <button className="editor-modal-btn" onClick={() => { mobileFileInputRef.current?.click(); setShowMenu(false); }}>
                  <ImageIcon size={20} />
                  <span>Banner Teléfono / Móvil</span>
                </button>
              </div>
              
              <button className="editor-modal-close" onClick={() => setShowMenu(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {children}
      </div>
    );
  }

  return (
    <div className={`editable-img-wrapper ${isEditMode ? 'editable-bg' : ''} ${className}`} style={{ ...style, position: 'relative', display: 'inline-block' }} onClick={handleClick}>
      <img src={currentSrc} alt="Editable" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      {isEditMode && (
        <div className="editable-bg-overlay">
          {isUploading ? <Loader className="spin" size={32} color="#FFF" /> : <ImageIcon size={32} color="#FFF" />}
        </div>
      )}
      <input 
        type="file" 
        accept="image/*" 
        ref={pcFileInputRef} 
        style={{ display: 'none' }} 
        onChange={(e) => handleUpload(e, id)}
      />
    </div>
  );
};

export default EditableImage;

