import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

const Song = ({ song, onPlay, isCurrentSong }) => {
  const { isPlaying } = useSelector((state) => state.music);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDisplayArtist = (artist) => {
    return artist === "Unknown Artist" ? "Unknown" : artist;
  };

  const formatDuration = (duration) => {
    if (typeof duration === "string" && duration.includes(":")) return duration;
    if (typeof duration === "number") {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return duration || "0:00";
  };

  const handleSongClick = () => {
    onPlay(song);
  };

  const handlePlayButtonClick = (e) => {
    e.stopPropagation();
    onPlay(song);
  };

  return (
    <div
      className={`p-4 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-between group
        ${
          isCurrentSong
            ? "bg-blue-900/30 border border-blue-500/50 hover:bg-blue-900/40"
            : "bg-gray-900 hover:bg-gray-800"
        }`}
      onClick={handleSongClick}
    >
      <div className="flex items-center space-x-4">
        {/* Cover Image */}
        <div className="relative w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
          {song.coverImgURL ? (
            <img
              src={song.coverImgURL}
              alt={song.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <svg
              className="w-6 h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}

          {/* Overlay for play state */}
          {isCurrentSong && isPlaying && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="flex space-x-1">
                <div className="w-1 h-3 bg-blue-400 rounded animate-pulse"></div>
                <div
                  className="w-1 h-4 bg-blue-400 rounded animate-pulse"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1 h-2 bg-blue-400 rounded animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-1 h-3 bg-blue-400 rounded animate-pulse"
                  style={{ animationDelay: "0.3s" }}
                ></div>
              </div>
            </div>
          )}
          {isCurrentSong && !isPlaying && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <svg
                className="w-4 h-4 text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Song Info */}
        <div>
          <h3
            className={`font-medium transition-colors ${
              isCurrentSong ? "text-blue-400" : "text-white"
            }`}
          >
            {song.name.replace(/\.[^/.]+$/, "")}
          </h3>
          <p className="text-gray-400 text-sm">
            {getDisplayArtist(song.artist)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 relative" ref={menuRef}>
        {/* Duration */}
        <span className="text-gray-400 text-sm min-w-[3rem] text-right">
          {formatDuration(song.duration)}
        </span>

        {/* Play Button */}
        <button
          className={`transition-all duration-200 ${
            isCurrentSong
              ? "text-blue-400 hover:text-blue-300 opacity-100"
              : "text-gray-400 hover:text-blue-400 opacity-0 group-hover:opacity-100"
          }`}
          onClick={handlePlayButtonClick}
        >
          {isCurrentSong && isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* More options button */}
        <button
          className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 top-8 bg-gray-800 text-white rounded-lg shadow-lg py-2 w-40 z-10">
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
              onClick={() => console.log("Delete", song.name)}
            >
              Delete Song
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
              onClick={() => console.log("Add to Playlist", song.name)}
            >
              Add to Playlist
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-700"
              onClick={() => console.log("Edit", song.name)}
            >
              Edit Song
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Song;
