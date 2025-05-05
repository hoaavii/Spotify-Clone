// src/components/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Use Link for internal navigation
// Import social media icons
import { FaFacebookF, FaTwitter, FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa';
import './Footer.css'; // Import the CSS file

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">

        {/* Column 1: Navigation/Company Links */}
        <div className="footer-column">
          <h5>Company</h5>
          <ul className="footer-links">
            <li><Link to="/about">About</Link></li> {/* Example internal link */}
            <li><a href="/jobs" target="_blank" rel="noopener noreferrer">Jobs</a></li> {/* Example external link */}
            <li><a href="/press" target="_blank" rel="noopener noreferrer">Press</a></li>
            {/* Add more relevant links */}
          </ul>
        </div>

        {/* Column 2: Legal Links */}
        <div className="footer-column">
          <h5>Legal</h5>
          <ul className="footer-links">
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/cookies">Cookie Policy</Link></li>
          </ul>
        </div>

        {/* Column 3: Support Links */}
        <div className="footer-column">
            <h5>Support</h5>
            <ul className="footer-links">
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
            </ul>
        </div>


        {/* Column 4: Social Media Links */}
        <div className="footer-column">
          <h5>Connect</h5>
          <div className="social-links">
            {/* Replace # with your actual social media profile URLs */}
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
             <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            {/* Add other relevant social links */}
          </div>
        </div>

      </div>

      {/* Bottom Bar: Copyright Info */}
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} My Spotify Clone. Built with React.</small>
        {/* You can add more info here if needed */}
      </div>
    </footer>
  );
}