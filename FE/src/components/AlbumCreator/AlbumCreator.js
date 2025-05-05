import React, { useState } from 'react';
import api from '../../services/api';
import './AlbumCreator.css'; // Import the CSS file

export default function AlbumCreator() {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false); // Add loading state
  const [error, setError] = useState(''); // Add error state

  const handleCreate = () => {
    if (!name.trim()) return; // Prevent creating empty name albums

    setIsCreating(true); // Disable button while creating
    setError(''); // Clear previous errors

    // Hardcoding owner ID is usually not ideal.
    // Get it from localStorage or context if available after login.
    const ownerId = localStorage.getItem('uid'); // Example: Assuming 'uid' is stored
    if (!ownerId) {
        setError("User not identified. Cannot create album.");
        setIsCreating(false);
        return;
    }

    api.post('/albums/', { name: name.trim(), owner: ownerId }) // Use trimmed name and dynamic owner ID
      .then(() => {
        alert(`Album "${name.trim()}" created successfully!`); // Provide feedback
        setName(''); // Clear input on success
        // Avoid page reload if possible. Update state elsewhere or fetch new list.
        // For now, keeping reload as per original logic, but alert is better feedback.
        window.location.reload();
      })
      .catch(err => {
          console.error("Failed to create album:", err);
          const errorMessage = err.response?.data?.name?.[0] || // Check for specific DRF validation errors
                               err.response?.data?.detail ||
                               "Failed to create album. Please try again.";
          setError(errorMessage); // Show error message to user
      })
      .finally(() => {
          setIsCreating(false); // Re-enable button
      });
  };

   const handleInputChange = (e) => {
       setName(e.target.value);
       if (error) setError(''); // Clear error when user types
   }

  return (
    // Use className for the container
    <div className="album-creator-container">
        <h4 className="album-creator-title">Create a New Album</h4>
        {error && <p style={{ color: '#f44336', fontSize: '0.9em', marginTop: '-10px', marginBottom: '10px' }}>{error}</p>} {/* Display error */}
        {/* Wrap input and button for flex layout */}
        <div className="album-creator-form">
            <input
                type="text"
                value={name}
                onChange={handleInputChange}
                placeholder="New album name"
                className="album-name-input" // Apply class
                disabled={isCreating} // Disable input during creation
            />
            <button
                onClick={handleCreate}
                className="create-album-button" // Apply class
                // Disable button if input is empty or creation is in progress
                disabled={!name.trim() || isCreating}
            >
                {isCreating ? 'Creating...' : 'Create Album'}
            </button>
        </div>
    </div>
  );
}