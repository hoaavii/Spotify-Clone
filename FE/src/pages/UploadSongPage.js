// src/pages/UploadSongPage.jsx

import React, { useState } from 'react';
import api from '../services/api';
import './UploadSongPage.css';

export default function UploadSongPage() {
  const [title,      setTitle]      = useState('');
  const [artist,     setArtist]     = useState('');
  const [album,      setAlbum]      = useState('');
  const [accessTier, setAccessTier] = useState('FREE');
  const [file,       setFile]       = useState(null);
  const [message,    setMessage]    = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title || !artist || !file) {
      setMessage('Please fill title, artist, and choose a file.');
      return;
    }
    const form = new FormData();
    form.append('title',       title);
    form.append('artist',      artist);
    form.append('album',       album);
    form.append('access_tier', accessTier);
    form.append('audio_file',  file);

    setMessage('');
    try {
      const res = await api.post('/songs/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage(
        res.data.is_approved
          ? '✅ Uploaded and approved immediately.'
          : '⏳ Uploaded! Pending admin approval.'
      );
      // reset form fields
      setTitle(''); setArtist(''); setAlbum(''); setAccessTier('FREE'); setFile(null);
      // clear file input
      const fileInput = e.target.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);
      setMessage('Upload failed.');
    }
  };

  return (
    <div className="upload-page">
      <h1>Upload a Song</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Title<br/>
          <input value={title} onChange={e=>setTitle(e.target.value)} required />
        </label>

        <label>
          Artist<br/>
          <input value={artist} onChange={e=>setArtist(e.target.value)} required />
        </label>

        <label>
          Album (optional)<br/>
          <input value={album} onChange={e=>setAlbum(e.target.value)} />
        </label>

        <label>
          Access Tier<br/>
          <select value={accessTier} onChange={e=>setAccessTier(e.target.value)}>
            <option value="FREE">Free to listen</option>
            <option value="PRO">Pro only</option>
            <option value="PREMIUM">Premium only</option>
          </select>
        </label>

        <label>
          Audio File<br/>
          <input
            type="file"
            accept="audio/*"
            onChange={e=>setFile(e.target.files[0])}
            required
          />
        </label>

        <button type="submit">Upload Song</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
