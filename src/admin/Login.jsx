import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, ArrowLeft } from 'lucide-react';
import './Admin.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@esmasportwear.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (onLogin) onLogin(data.session);
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Contraseña o correo incorrecto' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>ESMA <span>ADMIN</span></h2>
        <p>Panel de control exclusivo</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} />
            {loading ? 'Verificando...' : 'Acceder al Panel'}
          </button>
        </form>
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <a href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='#888'}>
            <ArrowLeft size={16} /> Volver a la Tienda
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
