import React, { useState, useEffect, useRef } from 'react';
import { setSongs, setCurrentSong, setIsPlaying } from "../store/musicSlice";
import { useDispatch, useSelector } from "react-redux";

const PlaylistModal = ({ playlist, isOpen, onClose, onUpdatePlaylist }) => {

  const dispatch = useDispatch();
  const { currentSong, isPlaying } = useSelector((state) => state.music);

  const [isEditMode, setIsEditMode] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [songs, setLocalSongs] = useState([]);
  const [originalName, setOriginalName] = useState('');
  const [originalSongs, setOriginalSongs] = useState([]);
  const [deletedSongIds, setDeletedSongIds] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update state when playlist changes
  useEffect(() => {
    if (playlist) {
      const name = playlist.name || '';
      const songsList = playlist.songs || [];

      setPlaylistName(name);
      setLocalSongs(songsList);
      setOriginalName(name);
      setOriginalSongs(songsList);
      setDeletedSongIds([]);
      if (playlist?.songs) {
        dispatch(setSongs(playlist.songs));
      } else {
        dispatch(setSongs([]));
      }
    }
  }, [playlist, dispatch]);

  if (!isOpen || !playlist) return null;

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

  const handleclick = (song) => {
    dispatch(setCurrentSong(song));
    dispatch(setIsPlaying(true));
    dispatch(setSongs(songs));
  }

  const handlePlayButtonClick = (e, song) => {
    e.stopPropagation();
    handleclick(song);
  };

  const handleSaveEdit = async () => {
    try {
      const updates = {
        songIdsToAdd: [],
        songIdsToRemove: deletedSongIds.length > 0 ? deletedSongIds : []
      };

      // Check if name changed
      if (playlistName !== originalName && playlistName.trim() !== '') {
        updates.name = playlistName.trim();
      }

      await onUpdatePlaylist(playlist.id, updates);

      // Update original values after successful save
      setOriginalName(playlistName);
      setOriginalSongs(songs);
      setDeletedSongIds([]);

      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
  };

  const handleCancelEdit = () => {
    // Reset to original values
    setPlaylistName(originalName);
    setLocalSongs(originalSongs);
    setDeletedSongIds([]);
    setIsEditMode(false);
  };

  const removeSong = (songId) => {
    try {
      // Remove song from current list
      const updatedSongs = songs.filter(song => song.id !== songId);
      setLocalSongs(updatedSongs);

      // Add to deleted songs list if it was in the original playlist
      const wasInOriginal = originalSongs.some(song => song.id === songId);
      if (wasInOriginal && !deletedSongIds.includes(songId)) {
        setDeletedSongIds(prev => [...prev, songId]);
      }
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      dispatch(setSongs(songs));
      dispatch(setCurrentSong(songs[0]));
      dispatch(setIsPlaying(true));
      onClose();
    }
  };

  // Check if there are any changes to enable/disable save button
  const hasChanges = () => {
    return playlistName !== originalName || deletedSongIds.length > 0;
  };

  const isCurrentSong = (song) => {
    return currentSong && currentSong.id === song.id;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-xs sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700 relative">
          <button
            className="absolute top-3 right-3 sm:top-5 sm:right-5 text-gray-400 hover:text-white hover:bg-gray-700 p-1.5 sm:p-2 rounded-lg transition-all duration-200"
            onClick={onClose}
          >
            <svg width="20" height="20" sm:width="24" sm:height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>

          {/* Mobile Header Layout */}
          <div className="block sm:hidden mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                🎵
              </div>
              <div className="flex-1 min-w-0 pr-8">
                {isEditMode ? (
                  <input
                    className="bg-gray-700 text-white text-lg font-bold p-2 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="Playlist name"
                  />
                ) : (
                  <h2 className="text-white text-lg font-bold mb-1 truncate">{playlist.name}</h2>
                )}
                <p className="text-gray-400 text-sm">{songs.length} song{songs.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex gap-2">
              {isEditMode ? (
                <>
                  <button
                    className="text-gray-400 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-1"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-1 ${hasChanges()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    onClick={handleSaveEdit}
                    disabled={!hasChanges()}
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors flex-1"
                    onClick={handlePlayAll}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play All
                  </button>
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    onClick={() => setIsEditMode(true)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Desktop Header Layout */}
          <div className="hidden sm:block">
            <div className="flex items-center gap-4 lg:gap-5 mb-4 lg:mb-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-2xl sm:text-3xl">
                🎵
              </div>

              <div className="flex-1 min-w-0">
                {isEditMode ? (
                  <input
                    className="bg-gray-700 text-white text-xl sm:text-2xl lg:text-3xl font-bold p-2 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder="Playlist name"
                  />
                ) : (
                  <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{playlist.name}</h2>
                )}
                <p className="text-gray-400 text-sm sm:text-base">{songs.length} song{songs.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {isEditMode ? (
                <>
                  <button
                    className="text-gray-400 hover:bg-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors ${hasChanges()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    onClick={handleSaveEdit}
                    disabled={!hasChanges()}
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold flex items-center gap-2 transition-colors"
                    onClick={handlePlayAll}
                  >
                    <svg width="18" height="18" sm:width="20" sm:height="20" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play All
                  </button>
                  <button
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors"
                    onClick={() => setIsEditMode(true)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 pb-4 sm:pb-6">
          {!songs || songs.length === 0 ? (
            <div className="text-center py-8 sm:py-12 lg:py-16 text-gray-400">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4">🎵</div>
              <p className="text-lg sm:text-xl mb-2 sm:mb-4">No songs in this playlist yet</p>
              <p className="text-sm sm:text-base">Add some songs to get started!</p>
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-2 mt-3 sm:mt-0">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  className={`p-3 sm:p-4 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-between group
                    ${isCurrentSong(song)
                      ? "bg-blue-900/30 border border-blue-500/50 hover:bg-blue-900/40"
                      : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  onClick={() => !isEditMode && handleclick(song)}
                >
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                    {/* Track Number or Remove Button */}
                    <div className="flex justify-center items-center text-gray-400 font-medium w-5 sm:w-6 flex-shrink-0">
                      {isEditMode ? (
                        <button
                          className="text-red-400 hover:bg-red-900 hover:text-red-300 p-1 rounded transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSong(song.id);
                          }}
                        >
                          <svg width="14" height="14" sm:width="16" sm:height="16" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-xs sm:text-sm">{index + 1}</span>
                      )}
                    </div>

                    {/* Cover Image */}
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {song.coverImgURL ? (
                        <img
                          src={song.coverImgURL}
                          alt={song.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg
                          className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      )}

                      {/* Overlay for play state */}
                      {isCurrentSong(song) && isPlaying && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <div className="flex space-x-0.5 sm:space-x-1">
                            <div className="w-0.5 sm:w-1 h-2 sm:h-3 bg-blue-400 rounded animate-pulse"></div>
                            <div
                              className="w-0.5 sm:w-1 h-3 sm:h-4 bg-blue-400 rounded animate-pulse"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-0.5 sm:w-1 h-1.5 sm:h-2 bg-blue-400 rounded animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                            <div
                              className="w-0.5 sm:w-1 h-2 sm:h-3 bg-blue-400 rounded animate-pulse"
                              style={{ animationDelay: "0.3s" }}
                            ></div>
                          </div>
                        </div>
                      )}
                      {isCurrentSong(song) && !isPlaying && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Song Info */}
                    <div className="min-w-0 flex-1">
                      <div
                        className={`font-medium transition-colors mb-0.5 sm:mb-1 truncate text-sm sm:text-base ${isCurrentSong(song) ? "text-blue-400" : "text-white"
                          }`}
                      >
                        {song.name?.replace(/\.[^/.]+$/, "") || song.title || 'Unknown Title'}
                      </div>
                      <div className="text-gray-400 text-xs sm:text-sm truncate">
                        {getDisplayArtist(song.artist || 'Unknown Artist')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-4 relative flex-shrink-0" ref={openMenuId === song.id ? menuRef : null}>
                    {/* Duration */}
                    <span className="text-gray-400 text-xs sm:text-sm min-w-[2.5rem] sm:min-w-[3rem] text-right">
                      {formatDuration(song.duration)}
                    </span>

                    {!isEditMode && (
                      <>
                        {/* Play Button */}
                        <button
                          className={`transition-all duration-200 p-1 ${isCurrentSong(song)
                              ? "text-blue-400 hover:text-blue-300 opacity-100"
                              : "text-gray-400 hover:text-blue-400 opacity-0 group-hover:opacity-100"
                            }`}
                          onClick={(e) => handlePlayButtonClick(e, song)}
                        >
                          {isCurrentSong(song) && isPlaying ? (
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          )}
                        </button>

                        {/* More options button - Hidden on mobile in edit mode */}
                        <button
                          className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hidden sm:block"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === song.id ? null : song.id);
                          }}
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === song.id && (
                          <div className="absolute right-0 top-8 sm:top-10 bg-gray-800 text-white rounded-lg shadow-xl py-2 w-40 sm:w-48 z-20 border border-gray-700 animate-fade-in">
                            <button
                              className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-700 text-sm sm:text-base transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSong(song.id);
                                setOpenMenuId(null);
                              }}
                            >
                              Remove from Playlist
                            </button>
                            <button
                              className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-700 text-sm sm:text-base transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Add to Another Playlist", song.name);
                                setOpenMenuId(null);
                              }}
                            >
                              Add to Playlist
                            </button>
                            <button
                              className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-700 text-sm sm:text-base transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Edit", song.name);
                                setOpenMenuId(null);
                              }}
                            >
                              Edit Song
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .animate-fade-in { 
          animation: fade-in 0.2s ease-out;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.1);
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }

        @media (max-width: 640px) {
          .overflow-y-auto::-webkit-scrollbar {
            width: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default PlaylistModal;