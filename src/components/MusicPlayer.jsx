import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentVolume,
  setCurrentlyPlayingOn,
  setIsPlaying,
  setRepeatMode,
  playNextSong,
  playPreviousSong,
} from '../store/musicSlice';

const MusicPlayer = () => {
  const dispatch = useDispatch();
  const {
    songs,
    currentSong,
    currentVolume,
    currentlyPlayingOn,
    isPlaying,
    repeatMode,
  } = useSelector((state) => state.music);

  const audioRef = useRef(null);
  const [duration, setDuration] = useState(0);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = currentVolume;
    }
  }, [currentVolume]);

  // Update audio time when currentlyPlayingOn changes externally
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentlyPlayingOn) > 1) {
      audioRef.current.currentTime = currentlyPlayingOn;
    }
  }, [currentlyPlayingOn]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      dispatch(setCurrentlyPlayingOn(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      // Replay current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      dispatch(playNextSong());
    }
  };

  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;

    if (audioRef.current && duration) {
      audioRef.current.currentTime = time;
      dispatch(setCurrentlyPlayingOn(time));
    }
  };

  const handleSkip = (seconds) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      dispatch(setCurrentlyPlayingOn(newTime));
    }
  };

  const toggleRepeatMode = () => {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    dispatch(setRepeatMode(modes[nextIndex]));
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'all':
        return (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zM17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
        );
      case 'one':
        return (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zM17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zM17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z" opacity="0.5" />
          </svg>
        );
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Marquee component for song name
  const MarqueeText = ({ text, className }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef(null);

    useEffect(() => {
      const checkOverflow = () => {
        if (textRef.current) {
          const isOverflow = textRef.current.scrollWidth > textRef.current.clientWidth;
          setIsOverflowing(isOverflow);
        }
      };

      checkOverflow();
      const timeoutId = setTimeout(checkOverflow, 100); // Small delay to ensure DOM is updated
      window.addEventListener('resize', checkOverflow);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', checkOverflow);
      };
    }, [text]);

    return (
      <div ref={textRef} className={`${className} overflow-hidden whitespace-nowrap relative`}>
        <div
          className={`${isOverflowing
              ? 'animate-marquee inline-block'
              : ''
            }`}
          style={{
            animationDuration: isOverflowing ? `${Math.max(text.length * 0.2, 8)}s` : '0s',
          }}
        >
          {text}
          {isOverflowing && <span className="ml-8">{text}</span>}
        </div>
      </div>
    );
  };

  if (!currentSong) return null;

  return (
    <>
      <style jsx>{`
        @keyframes marquee {
          0% { 
            transform: translateX(0%); 
          }
          100% { 
            transform: translateX(-100%); 
          }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-3 sm:p-3 lg:p-4 z-50">
        <audio
          ref={audioRef}
          src={currentSong.audioURL}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        {/* Mobile Layout */}
        <div className="block sm:hidden space-y-3">
          {/* Progress Bar - Top */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(currentlyPlayingOn)}
            </span>

            <div
              className="flex-1 bg-gray-700 h-1.5 rounded-full cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={handleSeek}
            >
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-100 ease-out hover:bg-blue-400"
                style={{ width: `${(currentlyPlayingOn / duration) * 100 || 0}%` }}
              />
            </div>

            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Song Info - Second Row */}
          <div className="text-center px-4">
            <MarqueeText
              text={currentSong.name.replace(/\.[^/.]+$/, "")}
              className="text-white font-medium text-base mb-1"
            />
            <MarqueeText
              text={currentSong.artist}
              className="text-gray-400 text-sm"
            />
          </div>

          {/* Controls and Volume - Third Row */}
          <div className="flex items-center justify-between">
            {/* Volume Control - Left */}
            <div className="flex items-center space-x-2">
              {/* Repeat Mode */}
              <button
                onClick={toggleRepeatMode}
                className={`transition-colors p-1 ${repeatMode !== 'none' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                title={`Repeat: ${repeatMode}`}
              >
                {getRepeatIcon()}
              </button>

              <svg className="w-4 h-4 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentVolume}
                onChange={(e) => dispatch(setCurrentVolume(parseFloat(e.target.value)))}
                className="w-16 accent-blue-500"
              />
            </div>

            {/* Playback Controls - Center */}
            <div className="flex items-center space-x-1">
              {/* Previous */}
              <button
                onClick={() => dispatch(playPreviousSong())}
                className="text-white hover:text-blue-400 transition-colors p-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* 5 sec backward */}
              <button
                onClick={() => handleSkip(-5)}
                className="text-white hover:text-blue-400 transition-colors p-1"
              >
                <div className="relative">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 18V6l-8.5 6 8.5 6z" />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 rounded px-1">
                    5
                  </span>
                </div>
              </button>

              {/* Play/Pause */}
              <button
                onClick={() => dispatch(setIsPlaying(!isPlaying))}
                className="text-white hover:text-blue-400 transition-colors p-2 bg-gray-800 rounded-full mx-2"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* 5 sec forward */}
              <button
                onClick={() => handleSkip(5)}
                className="text-white hover:text-blue-400 transition-colors p-1"
              >
                <div className="relative">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 18l8.5-6L4 6v12z" />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 rounded px-1">
                    5
                  </span>
                </div>
              </button>

              {/* Next */}
              <button
                onClick={() => dispatch(playNextSong())}
                className="text-white hover:text-blue-400 transition-colors p-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Empty space for balance */}
            <div className="w-20"></div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          {/* Progress Bar - Full Width at Top */}
          <div className="mb-3 lg:mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400 w-12 text-right">
                {formatTime(currentlyPlayingOn)}
              </span>

              <div
                className="flex-1 bg-gray-700 h-2 rounded-full cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={handleSeek}
              >
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-100 ease-out hover:bg-blue-400"
                  style={{ width: `${(currentlyPlayingOn / duration) * 100 || 0}%` }}
                />
              </div>

              <span className="text-sm text-gray-400 w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Song Info */}
            <div className="flex items-center min-w-0">
              <div className="text-blue-400 mr-3 flex-shrink-0">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v9.28l-1.47-1.47L9.5 12l2.5 2.5L14.5 12l-1.03-1.19L12 3zm0 12.72l-2.47 2.47L7.5 16L12 11.5 16.5 16l-2.03 2.19L12 15.72z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <MarqueeText
                  text={currentSong.name.replace(/\.[^/.]+$/, "")}
                  className="text-white font-medium text-sm sm:text-base"
                />
                <MarqueeText
                  text={currentSong.artist}
                  className="text-gray-400 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Playback Controls - Center */}
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 lg:space-x-4">
              {/* Previous */}
              <button
                onClick={() => dispatch(playPreviousSong())}
                className="text-white hover:text-blue-400 transition-colors p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* 5 sec backward */}
              <button
                onClick={() => handleSkip(-5)}
                className="text-white hover:text-blue-400 transition-colors p-1"
              >
                <div className="relative">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 18V6l-8.5 6 8.5 6z" />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 rounded px-1">
                    5
                  </span>
                </div>
              </button>

              {/* Play/Pause */}
              <button
                onClick={() => dispatch(setIsPlaying(!isPlaying))}
                className="text-white hover:text-blue-400 transition-colors p-2 bg-gray-800 rounded-full"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* 5 sec forward */}
              <button
                onClick={() => handleSkip(5)}
                className="text-white hover:text-blue-400 transition-colors p-1"
              >
                <div className="relative">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 18l8.5-6L4 6v12z" />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 rounded px-1">
                    5
                  </span>
                </div>
              </button>

              {/* Next */}
              <button
                onClick={() => dispatch(playNextSong())}
                className="text-white hover:text-blue-400 transition-colors p-1"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Volume and Repeat - Right Side */}
            <div className="flex items-center justify-end space-x-2 sm:space-x-3 lg:space-x-4">
              {/* Repeat Mode */}
              <button
                onClick={toggleRepeatMode}
                className={`transition-colors p-1 ${repeatMode !== 'none' ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                title={`Repeat: ${repeatMode}`}
              >
                {getRepeatIcon()}
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={currentVolume}
                  onChange={(e) => dispatch(setCurrentVolume(parseFloat(e.target.value)))}
                  className="w-16 sm:w-20 lg:w-24 accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;