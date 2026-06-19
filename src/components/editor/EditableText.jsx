import React, { useState, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import './Editor.css';

const EditableText = ({ id, defaultText, isHtml = false, as: Component = 'span', className = '', style = {} }) => {
  const { content, isEditMode, updateContent } = useSite();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(defaultText);

  const currentText = content[id] !== undefined ? content[id] : defaultText;

  useEffect(() => {
    if (!isEditing) {
      setValue(currentText);
    }
  }, [currentText, isEditing]);

  const handleSave = () => {
    updateContent(id, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(currentText);
    setIsEditing(false);
  };

  if (!isEditMode) {
    if (isHtml) {
      return <Component className={className} style={style} dangerouslySetInnerHTML={{ __html: currentText }} />;
    }
    return <Component className={className} style={style}>{currentText}</Component>;
  }

  if (isEditing) {
    return (
      <div className={`editable-field active ${className}`} style={{ ...style, position: 'relative', display: 'inline-block', width: '100%' }}>
        {isHtml ? (
          <textarea 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            className="editor-input"
            rows={3}
            autoFocus
          />
        ) : (
          <input 
            type="text" 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            className="editor-input"
            autoFocus
          />
        )}
        <div className="editor-actions">
          <button onClick={handleSave} className="editor-btn save"><Check size={16} /></button>
          <button onClick={handleCancel} className="editor-btn cancel"><X size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={`editable-field ${className}`} style={{ ...style, position: 'relative', display: 'inline-block' }} onClick={() => setIsEditing(true)}>
      <div className="editable-overlay">
        <Edit2 size={24} color="#FFF" />
      </div>
      {isHtml ? (
        <Component dangerouslySetInnerHTML={{ __html: currentText }} />
      ) : (
        <Component>{currentText}</Component>
      )}
    </div>
  );
};

export default EditableText;
