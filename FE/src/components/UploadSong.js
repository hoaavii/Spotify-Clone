// src/components/UploadSong/UploadSong.jsx
import React, { useState } from 'react';
import api from '../../services/api';
import './UploadSong.css'; // Import the CSS file

export default function UploadSong() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (error) setError(''); // Clear error on new file selection
    if (successMessage) setSuccessMessage(''); // Clear success message
  };

  const handleUpload = (event) => {
    event.preventDefault(); // Prevent default form submission if wrapped in <form>

    if (!title.trim() || !artist.trim() || !file) {
      setError("Please provide title, artist, and select a file.");
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccessMessage('');

    const formData = new FormData();
    // Correctly append the state *values*
    formData.append('title', title.trim());
    formData.append('artist', artist.trim());
    formData.append('audio_file', file);
     // You might need to append owner ID here too depending on your backend
     const ownerId = localStorage.getItem('uid');
     if (ownerId) {
        formData.append('owner', ownerId);
     } else {
        console.warn("Owner ID not found for song upload.");
        // Handle this case appropriately - maybe prevent upload or use a default?
     }


    api.post('/songs/', formData, {
      headers: {
        // Important for file uploads with FormData
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(() => {
        setSuccessMessage('Uploaded successfully – pending approval.');
        // Clear form on success
        setTitle('');
        setArtist('');
        setFile(null);
        // Clear the file input visually (requires accessing the input ref, complex)
        // Easiest might be to reset the form if wrapped in <form> or force re-render via key prop change
         document.getElementById('song-file-input').value = null; // Direct DOM manipulation (use ref ideally)

      })
      .catch(err => {
        console.error("Upload failed:", err);
        const errorMessage = err.response?.data?.detail ||
                             err.response?.data?.audio_file?.[0] || // Example specific error
                             "Upload failed. Please check the file and details.";
        setError(errorMessage);
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <div className="upload-song-container">
      <h3 className="upload-title">Upload New Song</h3>

      {error && <p className="upload-message error">{error}</p>}
      {successMessage && <p className="upload-message success">{successMessage}</p>}

      {/* Wrap in form for better structure, prevent default submit */}
      <form className="upload-form" onSubmit={handleUpload}>

        <div className="form-group">
            <label htmlFor="song-title-input" className="upload-label">Song Title</label>
            <input
                id="song-title-input"
                type="text"
                placeholder="Enter song title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="upload-input"
                disabled={isUploading}
                required
            />
        </div>

         <div className="form-group">
            <label htmlFor="artist-name-input" className="upload-label">Artist Name</label>
            <input
                id="artist-name-input"
                type="text"
                placeholder="Enter artist name"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                className="upload-input"
                disabled={isUploading}
                required
             />
        </div>

        <div className="form-group">
            <label htmlFor="song-file-input" className="upload-label">Audio File</label>
             {/* Hidden actual file input */}
            <input
                id="song-file-input"
                type="file"
                accept="audio/*" // Accept only audio files
                onChange={handleFileChange}
                className="upload-input-file" // Hidden via CSS
                disabled={isUploading}
                required
            />
            {/* Custom styled label acting as button */}
            <label htmlFor="song-file-input" className="upload-file-label">
                {isUploading ? 'Uploading...' : (file ? 'Change File' : 'Choose File')}
            </label>
            {/* Display selected file name */}
            {file && <span className="file-name-display">{file.name}</span>}
        </div>


        <button
          type="submit" // Use submit type for form
          className="upload-button"
          disabled={!title.trim() || !artist.trim() || !file || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Song'}
        </button>
      </form>
    </div>
  );
}