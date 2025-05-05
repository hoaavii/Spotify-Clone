// src/components/TopFavorites/TopFavorites.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './TopFavorites.css'; // Import the CSS file

export default function TopFavorites() { // Renamed component
  const [topFavs, setTopFavs] = useState([]); // Renamed state variable
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('/top-favorites/')
      .then(res => {
        setTopFavs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch top favorites:", err);
        setError("Could not load top favorites.");
        setLoading(false);
      });
  }, []); // Runs once on mount

  return (
    <div className="top-favorites-container"> {/* Class for container */}
      <h3 className="top-favorites-title">Top Favorites</h3> {/* Class for title */}

      {loading && <div className="top-favorites-loading">Loading...</div>}
      {error && <div className="top-favorites-error">{error}</div>}

      {!loading && !error && (
        topFavs.length > 0 ? (
          <div className="top-favorites-list"> {/* Optional wrapper for list */}
            {topFavs.map((song) => ( // Renamed map variable
              <div key={song.id} className="top-favorite-item"> {/* Class for item */}
                {song.title} {/* Assuming API returns 'title' */}
              </div>
            ))}
          </div>
        ) : (
          <div className="top-favorites-empty">No top favorites found yet.</div>
        )
      )}
    </div>
  );
}