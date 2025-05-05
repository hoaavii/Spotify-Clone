// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api'; // Adjusted path if needed
import Player from '../Player/Player';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import DownloadButton from '../DownloadButton/DownloadButton';
import AlbumCreator from '../AlbumCreator/AlbumCreator';
import FavoriteSongs from '../FavoriteSongs/FavoriteSongs';
import Chat from '../Chat/Chat';
import './Dashboard.css'; // Import CSS

export default function Dashboard() { // Renamed component
  const [songs, setSongs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchSongs = api.get('/songs/');
    const fetchVideos = api.get('/videos/');

    Promise.all([fetchSongs, fetchVideos])
      .then(([songsRes, videosRes]) => {
        setSongs(songsRes.data);
        setVideos(videosRes.data);
      })
      .catch(err => {
        console.error("Failed to fetch data:", err);
        setError("Could not load your music and videos. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });

  }, []); // Empty dependency array ensures this runs once on mount

  // Ensure REACT_APP_API_URL is defined in your .env file
  const baseUrl = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : '';
  // Handle cases where API URL might not be set during development
   if (!baseUrl && process.env.NODE_ENV === 'development') {
       console.warn("REACT_APP_API_URL is not set. Using relative paths.");
   }


  if (loading) {
    return <div className="loading-indicator">Loading your music...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container"> {/* Use className for styling */}
      <h1>Your Dashboard</h1>

      {/* Maybe wrap creators in their own section */}
      <section className="user-actions">
         <AlbumCreator />
         <FavoriteSongs />
      </section>


      <section className="media-section">
        <h2>Songs</h2>
        {songs.length > 0 ? (
          songs.map(s => (
            <div key={s.id} className="media-item song-item">
              <div className="media-info">
                 <strong>{s.title}</strong> — <span className="artist-name">{s.artist}</span>
              </div>
              <Player src={`${baseUrl}${s.audio_file}`} />
              <DownloadButton
                fileUrl={`${baseUrl}${s.audio_file}`}
                filename={`${s.title || 'song'}.mp3`} // Add fallback filename
              />
            </div>
          ))
        ) : (
          <p>No songs found.</p>
        )}
      </section>

      <section className="media-section">
        <h2>Videos</h2>
        {videos.length > 0 ? (
          videos.map(v => (
            <div key={v.id} className="media-item video-item">
               <div className="media-info">
                  <strong>{v.title}</strong> — <span className="artist-name">{v.artist}</span>
               </div>
              <VideoPlayer src={`${baseUrl}${v.video_file}`} />
              <DownloadButton
                fileUrl={`${baseUrl}${v.video_file}`}
                filename={`${v.title || 'video'}.mp4`} // Add fallback filename
              />
            </div>
          ))
        ) : (
          <p>No videos found.</p>
        )}
      </section>

      {/* Chat might be better positioned elsewhere (e.g., sidebar, dedicated page) */}
      <Chat />
    </div>
  );
}