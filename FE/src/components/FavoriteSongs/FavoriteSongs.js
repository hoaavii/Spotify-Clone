import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './FavoriteSongs.css'; // Import the CSS file

export default function FavoriteSongs() {
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true); // Optional: Add loading state
  const [error, setError] = useState(null); // Optional: Add error state

  useEffect(() => {
    setLoading(true); // Start loading
    setError(null); // Clear previous errors
    api.get('/favorites/')
      .then(res => {
        setFavs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch favorites:", err);
        setError("Could not load favorites."); // Set error message
        setLoading(false);
      });
  }, []); // Empty dependency array means run once on mount

  return (
    // Use className instead of inline style
    <div className="favorites-container">
      <h3 className="favorites-title">Favorites</h3>

      {/* Optional: Display Loading State */}
      {loading && <div className="favorites-empty">Loading favorites...</div>}

      {/* Optional: Display Error State */}
      {error && !loading && <div className="favorites-empty error-message">{error}</div>}

      {/* Display Favorites List or Empty Message */}
      {!loading && !error && (
        favs.length > 0 ? (
          // Optional: Add a wrapper div if needed: <div className="favorites-list">
          favs.map(f => (
            // Add className to each item
            <div key={f.id} className="favorite-item">
              {f.song} {/* Assuming f.song contains the song name */}
            </div>
          ))
          // Optional: Close wrapper div: </div>
        ) : (
          // Display message when favs array is empty
          <div className="favorites-empty">
            You haven't added any favorite songs yet.
          </div>
        )
      )}
    </div>
  );
}