import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Player.css'; // Import the CSS

// Helper function to format time (seconds -> MM:SS)
const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds === Infinity) {
    return '00:00';
  }
  const floorTime = Math.floor(timeInSeconds);
  const minutes = Math.floor(floorTime / 60);
  const seconds = floorTime % 60;
  return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// SVG Icons (simple examples)
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const VolumeHighIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

const VolumeMuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
  </svg>
);


export default function Player({ src, title = 'Unknown Title', artist = 'Unknown Artist' }) {
  const audioRef = useRef(null);
  const progressBarRef = useRef(null); // Ref for progress bar container

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1); // Volume from 0 to 1
  const [isMuted, setIsMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(1); // Store volume before muting
  const [error, setError] = useState('');

  // Effect to handle audio loading and metadata
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false); // Reset play state when audio ends
    const handleError = (e) => {
      console.error("Audio Error:", e);
      switch (audio.error.code) {
        case MediaError.MEDIA_ERR_ABORTED: setError('Audio playback aborted.'); break;
        case MediaError.MEDIA_ERR_NETWORK: setError('Network error caused audio download to fail.'); break;
        case MediaError.MEDIA_ERR_DECODE: setError('Audio playback aborted due to corruption or unsupported format.'); break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: setError('Audio source not supported.'); break;
        default: setError('An unknown error occurred.'); break;
      }
      setIsPlaying(false);
    };

    // Reset state when src changes
    setError('');
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    // Add event listeners
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Load the audio if src is provided
    if (src) {
        audio.load(); // Important to call load() when src changes or on initial load
    }


    // Cleanup function
    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [src]); // Re-run effect if src changes

  // Play/Pause functionality
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    setError(''); // Clear error on user interaction
    if (isPlaying) {
      audioRef.current.pause();
    } else {
       // Check if src is present before playing
      if (!audioRef.current.src) {
          setError("No audio source loaded.");
          return;
      }
      audioRef.current.play().catch(err => {
        // Handle potential play errors (e.g., user interaction needed)
        console.error("Play Error:", err);
        setError("Playback failed. Browser may require user interaction first.");
        setIsPlaying(false); // Ensure state reflects failure
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Handle seeking through the progress bar
  const handleProgressClick = (event) => {
    if (!audioRef.current || !progressBarRef.current || isNaN(duration) || duration === 0) return;

    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const clickPositionX = event.clientX - rect.left; // X position within the element.
    const progressBarWidth = progressBar.offsetWidth;
    const seekRatio = clickPositionX / progressBarWidth;
    const seekTime = duration * seekRatio;

    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime); // Update state immediately for smoother UI
  };

  // Handle volume change
  const handleVolumeChange = (event) => {
    if (!audioRef.current) return;
    const newVolume = parseFloat(event.target.value);
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    // Unmute if volume is adjusted while muted
    if (newVolume > 0 && isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
        // Mute if volume is set to 0
        audioRef.current.muted = true;
        setIsMuted(true);
    }
  };

   // Toggle Mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    const currentlyMuted = !isMuted;
    audioRef.current.muted = currentlyMuted;
    setIsMuted(currentlyMuted);

    if (currentlyMuted) {
      // Store current volume before muting (if volume > 0)
      if (volume > 0) setLastVolume(volume);
      setVolume(0); // Visually represent mute in slider
    } else {
      // Restore last volume when unmuting
      const restoreVolume = lastVolume > 0 ? lastVolume : 0.1; // Restore to last or a small default
      audioRef.current.volume = restoreVolume;
      setVolume(restoreVolume);
    }
  };


  // Calculate progress percentage for the styled bar
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="audio-player">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata" // Preload only metadata initially
        onPlay={() => setIsPlaying(true)} // Sync state if played externally/programmatically
        onPause={() => setIsPlaying(false)} // Sync state if paused externally
        className="native-audio" // Hide it visually but keep it accessible
      >
        Your browser does not support the audio element.
      </audio>

      {/* Metadata Display */}
      <div className="metadata">
        <p className="metadata-title">{title}</p>
        <p className="metadata-artist">{artist}</p>
      </div>

      {/* Custom Controls */}
      <div className="controls">
        <button
          onClick={togglePlayPause}
          className="play-pause-btn"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={!src || !!error} // Disable if no src or error occurred
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <span className="time-display">{formatTime(currentTime)}</span>

        <div
          className="progress-bar-container"
          ref={progressBarRef}
          onClick={handleProgressClick}
          role="slider"
          aria-label="Audio progress"
          aria-valuemin="0"
          aria-valuemax={duration || 0}
          aria-valuenow={currentTime}
          tabIndex="0" // Make it focusable
          onKeyDown={(e) => { // Basic keyboard seeking
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  const seekAmount = duration * 0.05; // Seek 5%
                  const newTime = e.key === 'ArrowRight'
                      ? Math.min(duration, currentTime + seekAmount)
                      : Math.max(0, currentTime - seekAmount);
                  audioRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
              }
          }}
        >
          <div
            className="progress-bar-filled"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <span className="time-display">{formatTime(duration)}</span>

        <div className="volume-control">
          <button
            onClick={toggleMute}
            className="volume-btn"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeHighIcon />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume} // Show 0 on slider when muted
            onChange={handleVolumeChange}
            className="volume-slider"
            aria-label="Volume"
          />
        </div>
      </div>
       {/* Error Message Display */}
       {error && <div className="error-message">{error}</div>}
    </div>
  );
}