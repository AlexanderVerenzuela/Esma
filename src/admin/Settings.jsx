import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, Lock, Mail } from 'lucide-react';

const Settings = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentEmail(user.email);
        setNewEmail(user.email);
      }
    });
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      setMessage('¡Contraseña actualizada correctamente!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Error al actualizar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setEmailMessage('');

    if (newEmail === currentEmail) {
      setEmailError('El nuevo correo es igual al actual.');
      return;
    }

    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;
      
      setEmailMessage('Petición enviada. Si Supabase tiene activada la confirmación segura, deberás revisar ambos correos (antiguo y nuevo) para aceptar el cambio antes de que se haga efectivo.');
    } catch (err) {
      setEmailError('Error al actualizar el correo: ' + err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Configuración de la Cuenta</h1>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        
        {/* Email Update Card */}
        <div className="admin-card">
          <h2><Mail size={18} style={{ marginRight: '10px', display: 'inline-block', verticalAlign: 'middle' }} /> Cambiar Correo de Acceso</h2>
          <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>Actualiza el correo con el que inicias sesión en este panel.</p>
          
          {emailMessage && <div style={{ backgroundColor: 'rgba(50, 255, 50, 0.1)', border: '1px solid rgba(50, 255, 50, 0.3)', color: '#4ade80', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{emailMessage}</div>}
          {emailError && <div className="login-error">{emailError}</div>}
          
          <form onSubmit={handleUpdateEmail} className="admin-form">
            <div className="form-group">
              <label>Correo Actual</label>
              <input 
                type="text" 
                value={currentEmail} 
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            </div>
            <div className="form-group">
              <label>Nuevo Correo</label>
              <input 
                type="email" 
                value={newEmail} 
                onChange={e => setNewEmail(e.target.value)}
                placeholder="tu@nuevo-correo.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={emailLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Save size={18} />
              {emailLoading ? 'Actualizando...' : 'Guardar Correo'}
            </button>
          </form>
        </div>

        {/* Password Update Card */}
        <div className="admin-card">
          <h2><Lock size={18} style={{ marginRight: '10px', display: 'inline-block', verticalAlign: 'middle' }} /> Cambiar Contraseña</h2>
          <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>Ingresa una nueva contraseña para la cuenta administradora.</p>
          
          {message && <div style={{ backgroundColor: 'rgba(50, 255, 50, 0.1)', border: '1px solid rgba(50, 255, 50, 0.3)', color: '#4ade80', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{message}</div>}
          {error && <div className="login-error">{error}</div>}
          
          <form onSubmit={handleUpdatePassword} className="admin-form">
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 caracteres"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Vuelve a escribir la contraseña"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <Save size={18} />
              {loading ? 'Actualizando...' : 'Guardar Contraseña'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
