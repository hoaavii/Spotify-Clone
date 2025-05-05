import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './AdminApproveSongsPage.css'; // <-- Import the CSS file

export default function AdminApproveSongsPage() {
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    let isMounted = true; // Prevent state update if component unmounted
    setLoading(true);
    setError(''); // Clear previous errors

    api.get('/songs/')
      .then(res => {
        if (isMounted) {
          const all = res.data;
          setPending(all.filter(s => !s.is_approved));
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error(err);
          setError('Failed to load pending songs.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    // Cleanup function
    return () => { isMounted = false; };
  }, []);

  const approveSong = async (song) => {
    setError(''); // Clear previous errors before new action
    try {
      await api.patch(`/songs/${song.id}/`, { is_approved: true });
      // Remove from local list optimistically
      setPending(currentPending => currentPending.filter(s => s.id !== song.id));
    } catch (err) {
      console.error(err);
      setError(`Could not approve song: ${song.title}. Please try again.`); // More specific error
    }
  };

  return (
    <div className="admin-approve-page">
      <h1>Approve User‑Uploaded Songs</h1>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading pending songs...</p> /* Loading indicator */
      ) : pending.length === 0 && !error ? ( /* Check !error here */
        <p>No pending uploads.</p>
      ) : (
        <ul>
          {pending.map(s => (
            // Removed inline styles and <br/> tags
            <li key={s.id}>
              <div> {/* Optional: Wrapper for title/artist if more styling needed */}
                <strong>{s.title || 'Unknown Title'}</strong> — {s.artist || 'Unknown Artist'}
              </div>
              <audio controls src={s.audio_file} />
              <button onClick={() => approveSong(s)}>
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}