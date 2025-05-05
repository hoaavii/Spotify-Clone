// src/pages/UploadVideoPage.jsx

import React, { useState } from 'react';
import api from '../services/api';
import './UploadVideoPage.css';

export default function UploadVideoPage() {
  const [title,      setTitle]      = useState('');
  const [artist,     setArtist]     = useState('');
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
    form.append('access_tier', accessTier);
    form.append('video_file',  file);

    setMessage('');
    try {
      const res = await api.post('/videos/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage(
        res.data.is_approved
          ? '✅ Uploaded and approved immediately.'
          : '⏳ Uploaded! Pending admin approval.'
      );
      // reset form fields
      setTitle(''); setArtist(''); setAccessTier('FREE'); setFile(null);
      const fileInput = e.target.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);
      setMessage('Upload failed.');
    }
  };

  return (
    <div className="upload-page">
      <h1>Upload a Video</h1>
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
          Access Tier<br/>
          <select value={accessTier} onChange={e=>setAccessTier(e.target.value)}>
            <option value="FREE">Free to watch</option>
            <option value="PRO">Pro only</option>
            <option value="PREMIUM">Premium only</option>
          </select>
        </label>

        <label>
          Video File<br/>
          <input
            type="file"
            accept="video/*"
            onChange={e=>setFile(e.target.files[0])}
            required
          />
        </label>

        <button type="submit">Upload Video</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
