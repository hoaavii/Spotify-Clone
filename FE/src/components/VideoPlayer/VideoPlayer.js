import React from 'react';
import './VideoPlayer.css';

export default function VideoPlayer({ src }) {
  return (
    <video
      className="video-player"
      controls
      src={src}
    />
  );
}
