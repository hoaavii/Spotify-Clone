// src/components/Dashboard/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    user_count:    0,
    sale_count:    0,
    total_revenue: 0,
   songs_count:   0,
   albums_count:  0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin-stats/')
      .then(res => setStats(res.data))
      .catch(() => setError('Cannot load stats.'));
  }, []);

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div><strong>Users:</strong>          <span>{stats.user_count}</span></div>
      <div><strong>Favorites:</strong>     <span>{stats.sale_count}</span></div>
      <div><strong>Total Revenue:</strong> <span>${stats.total_revenue.toLocaleString()}</span></div>
     <div><strong>Songs Total:</strong>   <span>{stats.songs_count}</span></div>
     <div><strong>Albums Total:</strong>  <span>{stats.albums_count}</span></div>
    </div>
  );
}
