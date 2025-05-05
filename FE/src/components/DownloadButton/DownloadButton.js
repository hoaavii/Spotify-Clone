import React from 'react';
import './DownloadButton.css'; // Import the CSS file

export default function DownloadButton({ fileUrl, filename }) {
  // Basic validation: ensure fileUrl is provided
  if (!fileUrl) {
    // Optionally return null or a disabled button/message
    console.warn("DownloadButton: fileUrl prop is missing.");
    return null;
    // Or: return <button disabled className="download-button">Download Unavailable</button>;
  }

  return (
    // Remove inline style, add className
    <a
      href={fileUrl}
      download={filename || true} // Use filename or default to true to trigger download
      className="download-button" // Apply the CSS class
      target="_blank" // Optional: Good practice for downloads/external links
      rel="noopener noreferrer" // Security measure for target="_blank"
    >
      Download {filename ? `"${filename}"` : ''} {/* Optionally include filename in text */}
    </a>
  );
}