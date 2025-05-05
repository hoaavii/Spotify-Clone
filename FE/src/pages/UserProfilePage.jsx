// src/pages/UserProfilePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './UserProfilePage.css';

export default function UserProfilePage() {
  const [userInfo, setUserInfo]     = useState(null);
  const [favorites, setFavorites]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/users/me/'),      // returns { id, username, email, is_staff, account_status: { plan, amount, paid_at } }
      api.get('/favorites/')      // list of this user’s favorites
    ])
    .then(([uRes, favRes]) => {
      setUserInfo(uRes.data);
      setFavorites(favRes.data);
    })
    .catch(() => setError('Failed to load profile.'))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading profile…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <div className="user-profile-page">
      <h1>Welcome, {userInfo.username}</h1>

      <section className="account-status">
        <h2>Subscription</h2>
        {userInfo.account_status
          ? (
            <p>
              Plan: <strong>{userInfo.account_status.plan}</strong><br/>
              Paid on: {new Date(userInfo.account_status.paid_at).toLocaleDateString()}
            </p>
          )
          : <p>You have no active subscription.</p>
        }
      </section>

      <section className="favorites-summary">
        <h2>Your Favorites</h2>
        <p>You’ve favorited <strong>{favorites.length}</strong> songs.</p>
        <ul>
          {favorites.map(f => (
            <li key={f.id}>{f.song_title || `Song ID ${f.song}`}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
