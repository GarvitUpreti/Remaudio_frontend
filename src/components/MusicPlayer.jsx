import React, { useRef, useEffect } from 'react';

const MusicPlayer = ({
  currentSong,
  isPlaying,
  setIsPlaying,
  volume,
  setVolume,
  currentTime,
  setCurrentTime,
  duration,
  setDuration
}) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-4">
      <audio
        ref={audioRef}
        src={currentSong.audioURL}  // ✅ Fixed: changed from .url to .audioURL
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1">
          <div className="text-blue-400 mr-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v9.28l-1.47-1.47L9.5 12l2.5 2.5L14.5 12l-1.03-1.19L12 3zm0 12.72l-2.47 2.47L7.5 16L12 11.5 16.5 16l-2.03 2.19L12 15.72z"/>
            </svg>
          </div>
          
          <div>
            <div className="text-white font-medium">
              {currentSong.name.replace(/\.[^/.]+$/, "")}  {/* ✅ Removes file extension */}
            </div>
            <div className="text-gray-400 text-sm">{currentSong.artist}</div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="text-white hover:text-blue-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white hover:text-blue-400"
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          
          <button className="text-white hover:text-blue-400">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-4 flex-1 justify-end">
          <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
          
          <div 
            className="flex-1 bg-gray-700 h-1 rounded-full cursor-pointer max-w-xs"
            onClick={handleSeek}
          >
            <div 
              className="bg-blue-500 h-1 rounded-full"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
          </div>
          
          <span className="text-sm text-gray-400">{formatTime(duration)}</span>
          
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;