// src/pages/DiscoveryPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Player from '../components/Player/Player';
import './DiscoveryPage.css';

export default function DiscoveryPage() {
  const [songs, setSongs]             = useState([]);
  const [topFavs, setTopFavs]         = useState([]);
  const [favorites, setFavorites]     = useState([]);      // <-- user’s favorites (song IDs)
  const [query, setQuery]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [loadingTop, setLoadingTop]   = useState(false);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [error, setError]             = useState('');
  const [errorTop, setErrorTop]       = useState('');
  const [errorFavs, setErrorFavs]     = useState('');

  // Filter state
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [filterAlbum,   setFilterAlbum]   = useState('ALL');
  const [filterArtist,  setFilterArtist]  = useState('ALL');

  useEffect(() => {
    fetchDiscover();
    fetchTopFavorites();
    fetchFavorites();
  }, []);

  function fetchDiscover() {
    setLoading(true); setError(''); setSongs([]);
    api.get('/songs/discover/')
      .then(res => setSongs(res.data))
      .catch(() => setError('Could not load discovery songs.'))
      .finally(() => setLoading(false));
  }

  function fetchTopFavorites() {
    setLoadingTop(true); setErrorTop(''); setTopFavs([]);
    api.get('/top-favorites/')
      .then(res => setTopFavs(res.data))
      .catch(() => setErrorTop('Could not load top favorites.'))
      .finally(() => setLoadingTop(false));
  }

  function fetchFavorites() {
    setLoadingFavs(true); setErrorFavs(''); setFavorites([]);
    api.get('/favorites/')
      .then(res => {
        // each favorite has a .song field
        setFavorites(res.data.map(f => f.song));
      })
      .catch(() => setErrorFavs('Could not load your favorites.'))
      .finally(() => setLoadingFavs(false));
  }

  function handleSearch(e) {
    e.preventDefault();
    setLoading(true); setError(''); setSongs([]);
    const endpoint = query.trim()
      ? `/songs/search/?q=${encodeURIComponent(query.trim())}`
      : '/songs/discover/';
    api.get(endpoint)
      .then(res => setSongs(res.data || []))
      .catch(() => setError('Search failed.'))
      .finally(() => setLoading(false));
  }

  function clearSearch() {
    setQuery('');
    fetchDiscover();
  }

  // Apply filters before grouping
  const filteredSongs = songs.filter(s => {
    if (showLikedOnly && !favorites.includes(s.id)) return false;
    if (filterAlbum !== 'ALL' && s.album !== filterAlbum)     return false;
    if (filterArtist !== 'ALL' && s.artist !== filterArtist)  return false;
    return true;
  });

  // Build dropdown options
  const albumOptions  = Array.from(
    new Set(songs.map(s => s.album).filter(a => a && a.trim()))
  );
  const artistOptions = Array.from(
    new Set(songs.map(s => s.artist).filter(a => a && a.trim()))
  );

  // Group for display
  const grouped = filteredSongs.reduce((acc, song) => {
    const key = song.album?.trim() || '— Various Artists / Singles —';
    (acc[key] = acc[key]||[]).push(song);
    return acc;
  }, {});

  return (
    <div className="discovery-page">
      {/* Search */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search songs..."
        />
        <button type="submit" disabled={loading||!query.trim()}>
          {loading && query ? 'Searching…' : 'Search'}
        </button>
        {query && <button type="button" onClick={clearSearch}>Clear</button>}
      </form>

      {/* Filters */}
      <div className="discovery-filters">
        <label>
          <input
            type="checkbox"
            checked={showLikedOnly}
            onChange={e => setShowLikedOnly(e.target.checked)}
            disabled={loadingFavs}
          /> Show only my liked songs
        </label>

        <label>
          Album:
          <select
            value={filterAlbum}
            onChange={e => setFilterAlbum(e.target.value)}
          >
            <option value="ALL">All</option>
            {albumOptions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>

        <label>
          Artist:
          <select
            value={filterArtist}
            onChange={e => setFilterArtist(e.target.value)}
          >
            <option value="ALL">All</option>
            {artistOptions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>

        {(errorFavs || loadingFavs) && (
          <span className="small-note">
            {loadingFavs ? 'Loading favorites…' : errorFavs}
          </span>
        )}
      </div>

      {/* Top Favorites */}
      <section className="top-favorites-section">
        <h2>🔥 Top Favorites</h2>
        {loadingTop
          ? <p>Loading…</p>
          : errorTop
            ? <p className="error">{errorTop}</p>
            : topFavs.length
              ? (
                <div className="top-favorites-list">
                  {topFavs.map(s => (
                    <Link
                      key={s.id}
                      to={`/songs/${s.id}`}
                      className="top-fav-item card"
                    >
                      <div className="track-info">
                        <strong>{s.title}</strong>
                        <span>{s.artist}</span>
                      </div>
                      <Player
  src={s.audio_file}
  title={s.title}
  artist={s.artist}
/>
                    </Link>
                  ))}
                </div>
              )
              : <p>No favorites yet.</p>
        }
      </section>

      <hr/>

      <h1>{ query.trim() ? `Search: "${query}"` : 'Discover New Music' }</h1>
      {error && <p className="error">{error}</p>}

      {/* Discovery List */}
      {loading
        ? <p>Loading songs…</p>
        : Object.keys(grouped).length > 0
          ? Object.entries(grouped).map(([album, tracks]) => (
              <section key={album}>
                {album !== '— Various Artists / Singles —' && (
                  <h3>{album}</h3>
                )}
                <div className="track-list">
                  {tracks.map(s => (
                    <Link
                      key={s.id}
                      to={`/songs/${s.id}`}
                      className="song-item"
                    >
                      <div className="track-info">
                        <strong>{s.title}</strong>
                        <span>{s.artist}</span>
                      </div>
                      <Player
  src={s.audio_file}
  title={s.title}
  artist={s.artist}
/>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          : <p>No songs match your filters.</p>
      }
    </div>
  );
}
