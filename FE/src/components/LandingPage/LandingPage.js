// src/components/LandingPage/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
// Import icons (example using react-icons/fa)
import { FaMusic, FaVideo, FaListAlt, FaComments, FaUserPlus, FaSearch, FaPlay, FaHeadphones } from 'react-icons/fa';
import './LandingPage.css'; // Import CSS

export default function LandingPage() {
  return (
    <div className="landing-page"> {/* Changed main container class */}

 

      {/* --- Hero Section --- */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Your Ultimate Music & Video Hub</h1>
          <p className="subtitle">
            Discover, stream, and share millions of songs and videos. Create personalized albums and connect with fellow enthusiasts. All in one place.
          </p>
          <div className="cta-buttons">
            {/* Link points to register page */}
            <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
            {/* Optionally keep login or remove */}
            {/* <Link to="/login" className="btn btn-secondary btn-lg">Login</Link> */}
          </div>
        </div>
        {/* Optional: Add a hero image or background via CSS */}
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="features-section">
        <h2>Why Choose Us?</h2>
        <p className="section-intro">Explore the features that make our platform the best place for your music and video needs.</p>
        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-item">
            <div className="feature-icon"><FaMusic /></div>
            <h3>Vast Music Library</h3>
            <p>Access millions of songs across various genres. From the latest hits to timeless classics, find it all here.</p>
          </div>
          {/* Feature 2 */}
          <div className="feature-item">
            <div className="feature-icon"><FaVideo /></div>
            <h3>Music Video Streaming</h3>
            <p>Watch high-quality music videos from your favorite artists. Stay updated with the latest visual releases.</p>
          </div>
          {/* Feature 3 */}
          <div className="feature-item">
            <div className="feature-icon"><FaListAlt /></div>
            <h3>Custom Album Creation</h3>
            <p>Organize your favorite tracks and videos into personalized albums. Curate your perfect collection.</p>
          </div>
          {/* Feature 4 */}
          <div className="feature-item">
            <div className="feature-icon"><FaComments /></div>
            <h3>Community Chat</h3>
            <p>Connect with other users. Discuss music, share discoveries, and be part of a vibrant community.</p>
          </div>
           {/* Feature 5 */}
           <div className="feature-item">
            <div className="feature-icon"><FaSearch /></div>
            <h3>Powerful Search</h3>
            <p>Quickly find any song, artist, video, or album with our intuitive and powerful search engine.</p>
          </div>
           {/* Feature 6 */}
           <div className="feature-item">
            <div className="feature-icon"><FaPlay /></div>
            <h3>Seamless Playback</h3>
            <p>Enjoy uninterrupted, high-fidelity audio and video streaming across all your devices.</p>
          </div>
        </div>
      </section>

      {/* --- How It Works Section --- */}
      <section className="how-it-works-section">
        <h2>Get Started in 3 Easy Steps</h2>
        <div className="steps-container">
          {/* Step 1 */}
          <div className="step-item">
             <div className="step-icon-wrapper"><div className="step-number">1</div><FaUserPlus className="step-icon-main"/></div>
             <h3>Sign Up</h3>
             <p>Create your free account in seconds to unlock all features.</p>
          </div>
           {/* Step 2 */}
           <div className="step-item">
             <div className="step-icon-wrapper"><div className="step-number">2</div><FaSearch className="step-icon-main"/></div>
             <h3>Explore</h3>
             <p>Search or browse our extensive library of music and videos.</p>
          </div>
           {/* Step 3 */}
           <div className="step-item">
             <div className="step-icon-wrapper"><div className="step-number">3</div><FaPlay className="step-icon-main"/></div>
             <h3>Listen & Watch</h3>
             <p>Stream your favorites, create albums, and connect with others.</p>
          </div>
        </div>
      </section>

        {/* --- Final Call to Action Section --- */}
        <section className="cta-final-section">
            <h2>Ready to Dive In?</h2>
            <p>Join thousands of users enjoying the ultimate media experience.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Sign Up For Free</Link>
        </section>

      {/* --- Footer --- */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} Spotify Clone. All rights reserved.</p>
        {/* Add other footer links if needed: Terms, Privacy, Contact */}
      </footer>
    </div>
  );
}