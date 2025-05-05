import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import Player from '../Player/Player'
import './UserDashboard.css'; // <-- Import the CSS file

export default function UserDashboard() {
  const [favorites, setFavorites] = useState([])
  const [topFavs,   setTopFavs]   = useState([])
  const [loadingFavorites, setLoadingFavorites] = useState(true); // Added loading state
  const [loadingTopFavs, setLoadingTopFavs] = useState(true);     // Added loading state
  const [error, setError] = useState('');                         // Added error state

  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    setError(''); // Clear previous errors

    api.get('/favorites/')
      .then(r => { if (isMounted) setFavorites(r.data); })
      .catch(() => { if (isMounted) setError(prev => prev + ' Failed to load your favorites.'); })
      .finally(() => { if (isMounted) setLoadingFavorites(false); });

    api.get('/top-favorites/')
      .then(r => { if (isMounted) setTopFavs(r.data); })
      .catch(() => { if (isMounted) setError(prev => prev + ' Failed to load top favorites.'); })
      .finally(() => { if (isMounted) setLoadingTopFavs(false); });

    // Cleanup function
    return () => { isMounted = false; };
  }, [])

  // Optional: Add basic loading/error display
  const renderList = (title, items, isLoading) => (
    <section>
      <h2>{title}</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : items.length > 0 ? (
        items.map(item => (
          <div key={item.id}>
            {/* Use optional chaining in case song or artist is missing */}
            <strong>{item.song?.title || item.title || 'Unknown Title'}</strong>
            {item.artist && ` — ${item.artist}`} {/* Display artist only if present */}
            <Player src={item.song?.audio_file || item.audio_file} />
          </div>
        ))
      ) : (
        <p>No {title.toLowerCase()} found.</p> /* Handle empty state */
      )}
    </section>
  );

  return (
    <div className="user-dashboard">
      <h1>Your Dashboard</h1>

      {error && <div className="error">{error}</div>} {/* Display general errors */}

      {renderList("Your Favorites", favorites, loadingFavorites)}
      {renderList("Top Favorites", topFavs, loadingTopFavs)}

    </div>
  )
}

// Add a basic error style to UserDashboard.css if you use the error state
/*
.error {
  color: #D8000C;
  background-color: #FFD2D2;
  border: 1px solid #D8000C;
  padding: 10px 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  text-align: center;
}
*/