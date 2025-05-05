import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [isAdmin, setIsAdmin]   = useState(localStorage.getItem('is_admin') === 'true');

  // Listen for login/logout events
  useEffect(() => {
    const onAuthChange = () => {
      setUsername(localStorage.getItem('username'));
      setIsAdmin(localStorage.getItem('is_admin') === 'true');
    };
    window.addEventListener('authChange', onAuthChange);
    return () => window.removeEventListener('authChange', onAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('uid');
    localStorage.removeItem('username');
    localStorage.removeItem('is_admin');
    window.dispatchEvent(new CustomEvent('authChange'));
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="logo-container">
        <Link to="/" className="logo-link">SpotifyClone</Link>
      </div>
      <nav className="navigation">
        {username && !isAdmin && (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/discover"  className="nav-link">Discover</Link>
            <Link to="/profile"   className="nav-link">Profile</Link>
            <Link to="/upgrade"   className="nav-link">Upgrade</Link>
            <Link to="/chat/user" className="nav-link">Chat Admin</Link>
            <Link to="/upload/song"  className="nav-link">Upload Song</Link>
            <Link to="/upload/video" className="nav-link">Upload Video</Link>
          </>
        )}
        {username && isAdmin && (
          <>
            <Link to="/admin/dashboard"     className="nav-link">Admin Dashboard</Link>
            <Link to="/chat/admin"          className="nav-link">Chat Users</Link>
            <Link to="/profile"             className="nav-link">Profile</Link>
            <Link to="/upload/song"         className="nav-link">Upload Song</Link>
            <Link to="/upload/video"        className="nav-link">Upload Video</Link>
            <Link to="/admin/approve-songs" className="nav-link">Approve Songs</Link>
          </>
        )}
      </nav>
      <div className="user-actions">
        {username ? (
          <>
            <span className="welcome-message">
              Welcome, <strong>{username}</strong>!
            </span>
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn btn-login">Login</Link>
            <Link to="/register" className="btn btn-register">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
