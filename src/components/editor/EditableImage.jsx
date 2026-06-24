import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Loader } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { supabase } from '../../supabaseClient';
import './Editor.css';

const EditableImage = ({ id, defaultSrc, className = '', style = {}, isBackground = false, children }) => {
  const { content, isEditMode, updateContent } = useSite();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const currentSrc = content[id] !== undefined ? content[id] : defaultSrc;

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // We use the 'images' bucket since it's already public and working
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      
      updateContent(id, data.publicUrl);
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (isEditMode) {
      fileInputRef.current?.click();
    }
  };

  if (isBackground) {
    return (
      <div 
        className={`${className} ${isEditMode ? 'editable-bg' : ''}`} 
        style={{ ...style, backgroundImage: `url(${currentSrc})`, position: 'relative' }}
        onClick={handleClick}
      >
        {isEditMode && (
          <div className="editable-bg-btn" title="Cambiar imagen de fondo">
            {isUploading ? <Loader className="spin" size={20} color="#FFF" /> : <ImageIcon size={20} color="#FFF" />}
            <span style={{marginLeft: '8px', fontSize: '12px', fontWeight: 'bold'}}>FONDO</span>
          </div>
        )}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleUpload}
        />
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
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleUpload}
      />
    </div>
  );
};

export default EditableImage;
