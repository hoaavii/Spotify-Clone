// src/components/Login/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async e => {
    e.preventDefault();
    if (!username || !password) {
      setError('Enter both username and password.');
      return;
    }
    setLoading(true);

    try {
      // 1) Get JWT tokens
      const { data: tokenData } = await api.post('/auth/token/', { username, password });
      localStorage.setItem('access_token',  tokenData.access);
      localStorage.setItem('refresh_token', tokenData.refresh);

      // 2) Fetch current user profile
      const { data: me } = await api.get('/auth/user/');
      // me: { id, username, email, is_staff, account_status }
      localStorage.setItem('uid',      String(me.id));
      localStorage.setItem('username', me.username);
      localStorage.setItem('is_admin', me.is_staff ? 'true' : 'false');

      // 3) Notify listeners (Header, etc.)
      window.dispatchEvent(new CustomEvent('authChange'));

      // 4) Redirect to discover page
      navigate('/discover');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h3 className="login-title">Member Login</h3>
      <form className="login-form" onSubmit={handleLogin}>
        {error && <div className="message error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="username-input" className="form-label">Username</label>
          <input
            id="username-input"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="form-input"
            disabled={loading}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password-input" className="form-label">Password</label>
          <input
            id="password-input"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="form-input"
            disabled={loading}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="form-button" disabled={loading}>
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>
      <div className="register-link">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </div>
    </div>
  );
}
