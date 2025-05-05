import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import api from '../../services/api';
import './Register.css'; // Import the CSS file

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // State for confirm password
  const [error, setError] = useState(''); // State for error messages
  const [successMessage, setSuccessMessage] = useState(''); // State for success message
  const [loading, setLoading] = useState(false); // State for loading indicator
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setSuccessMessage(''); // Clear previous success messages

    // Basic Client-Side Validation
    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // Optional: Add more validation (e.g., password complexity) here

    setLoading(true); // Set loading state

    try {
      await api.post('/auth/register/', {
        username,
        password,
      });
      setSuccessMessage('Registration successful! Redirecting to login...');
      // Clear form fields on success
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      // Redirect after a short delay to allow user to see the message
      setTimeout(() => {
        navigate('/login');
      }, 2000); // 2-second delay
    } catch (err) {
      console.error('Registration error:', err);
      // Try to get a specific error message from the backend response
      const errorMessage = err.response?.data?.detail || // Example: if backend returns { detail: '...' }
                           err.response?.data?.message || // Example: if backend returns { message: '...' }
                           'Registration failed. The username might already be taken, or the server is unavailable.';
      setError(errorMessage);
    } finally {
      setLoading(false); // Reset loading state regardless of success or failure
    }
  };

  return (
    <div className="register-container">
      <h3 className="register-title">Create Account</h3>

      <form className="register-form" onSubmit={handleRegister}>
        {/* Display Error Message */}
        {error && <div className="message error-message">{error}</div>}

        {/* Display Success Message */}
        {successMessage && <div className="message success-message">{successMessage}</div>}

        <div className="form-group">
          <label htmlFor="username-input" className="form-label">Username</label>
          <input
            id="username-input" // Added id for label association
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            className="form-input" // Use CSS class
            disabled={loading} // Disable input when loading
            required // HTML5 basic validation
          />
        </div>

        <div className="form-group">
          <label htmlFor="password-input" className="form-label">Password</label>
          <input
            id="password-input" // Added id for label association
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="form-input" // Use CSS class
            disabled={loading} // Disable input when loading
            required // HTML5 basic validation
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password-input" className="form-label">Confirm Password</label>
          <input
            id="confirm-password-input" // Added id for label association
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className="form-input" // Use CSS class
            disabled={loading} // Disable input when loading
            required // HTML5 basic validation
          />
        </div>

        <button
            type="submit" // Explicitly set type to submit for the form
            className="form-button" // Use CSS class
            onClick={handleRegister} // Keep onClick for direct call if needed, though onSubmit is primary
            disabled={loading} // Disable button when loading
        >
          {loading ? 'Registering...' : 'Register'} {/* Show loading text */}
        </button>
      </form>

       {/* Link to Login Page */}
      <div className="login-link">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </div>
  );
}