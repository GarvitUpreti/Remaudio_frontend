import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeSong, setSongs } from "../store/songSlice";
import { updatePlaylist } from "../store/playlistSlice";
import { updateUser } from "../store/userSlice";
import AddToPlaylistModal from "../components/AddToPlaylistModal";
import MarqueeText from "./MarqueeText"; // Add this import

const Song = ({ song, onPlay, isCurrentSong }) => {
  const { isPlaying } = useSelector((state) => state.music);
  const { list: playlists } = useSelector((state) => state.playlists);
  const { list: songs } = useSelector((state) => state.songs);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", artist: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef(null);
  const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const DEFAULT_SONG_ID = 2; // Change this to 2

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

  const handleDeleteSong = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    setMenuOpen(false);

    try {
      const accessToken = localStorage.getItem('accessToken');
      let response;
      if (parseInt(song.id) === DEFAULT_SONG_ID) { // Change this to 3
        alert("Default song will disapear as soon as you upload your first personal song.");

      } else {
        response = await fetch(`${API_URL}/songs/${song.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      

      if (!response.ok) {
        throw new Error('Failed to delete song');
      }
    }

      dispatch(removeSong(song.id));

      if (user && user.songs) {
        const updatedUserSongs = user.songs.filter(s => s.id !== song.id);
        dispatch(updateUser({ songs: updatedUserSongs }));
      }

      playlists.forEach(playlist => {
        if (playlist.songs && playlist.songs.some(s => s.id === song.id)) {
          const updatedSongs = playlist.songs.filter(s => s.id !== song.id);
          dispatch(updatePlaylist({
            playlistId: playlist.id,
            updatedPlaylist: { ...playlist, songs: updatedSongs }
          }));
        }
      });

      // alert('Song deleted successfully!');
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSong = (e) => {
    if (song.id == DEFAULT_SONG_ID) {
      alert("Default song cannot be edited please upload a personal song for this feature.");
      setMenuOpen(false);
      return;
    }
    e.stopPropagation();
    setEditForm({
      name: song.name.replace(/\.[^/.]+$/, ""),
      artist: song.artist
    });
    setEditModalOpen(true);
    setMenuOpen(false);
  };

  const handleUpdateSong = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      const updateData = {};

      if (editForm.name.trim() && editForm.name.trim() !== song.name.replace(/\.[^/.]+$/, "")) {
        updateData.name = editForm.name.trim();
      }

      if (editForm.artist.trim() && editForm.artist.trim() !== song.artist) {
        updateData.artist = editForm.artist.trim();
      }

      if (Object.keys(updateData).length === 0) {
        setEditModalOpen(false);
        setIsUpdating(false);
        return;
      }

      const response = await fetch(`${API_URL}/songs/${song.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update song');
      }

      const updatedSong = await response.json();

      const updatedSongsList = songs.map(s =>
        s.id === song.id ? updatedSong : s
      );
      dispatch(setSongs(updatedSongsList));

      if (user && user.songs) {
        const updatedUserSongs = user.songs.map(s =>
          s.id === song.id ? updatedSong : s
        );
        dispatch(updateUser({ songs: updatedUserSongs }));
      }

      playlists.forEach(playlist => {
        if (playlist.songs && playlist.songs.some(s => s.id === song.id)) {
          const updatedPlaylistSongs = playlist.songs.map(s =>
            s.id === song.id ? updatedSong : s
          );
          dispatch(updatePlaylist({
            playlistId: playlist.id,
            updatedPlaylist: { ...playlist, songs: updatedPlaylistSongs }
          }));
        }
      });

      setEditModalOpen(false);
      alert('Song updated successfully!');
    } catch (error) {
      console.error('Error updating song:', error);
      alert('Failed to update song. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddToPlaylist = (e) => {
    if (song.id == DEFAULT_SONG_ID) {
      alert("Default song cannot be added to playlists please upload a personal song for this feature.");
      setMenuOpen(false);
      return;
    }
    e.stopPropagation();
    setAddToPlaylistModalOpen(true);
    setMenuOpen(false);
  };

  return (
    <>
      <div
        className={`p-3 sm:p-4 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-between group
        ${isCurrentSong
            ? "bg-blue-900/30 border border-blue-500/50 hover:bg-blue-900/40"
            : "bg-gray-900 hover:bg-gray-800"
          }`}
        onClick={handleSongClick}
      >
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
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
            {isCurrentSong && isPlaying && (
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
            {isCurrentSong && !isPlaying && (
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

          {/* Song Info with Marquee */}
          <div className="min-w-0 flex-1">
            <MarqueeText
              text={song.name.replace(/\.[^/.]+$/, "")}
              className={`font-medium transition-colors text-sm sm:text-base ${isCurrentSong ? "text-blue-400" : "text-white"
                }`}
            />
            <MarqueeText
              text={getDisplayArtist(song.artist)}
              className="text-gray-400 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 relative flex-shrink-0" ref={menuRef}>
          {/* Duration */}
          <span className="text-gray-400 text-xs sm:text-sm min-w-[2.5rem] sm:min-w-[3rem] text-right">
            {formatDuration(song.duration)}
          </span>

          {/* Play Button */}
          <button
            className={`transition-all duration-200 p-1 ${isCurrentSong
              ? "text-blue-400 hover:text-blue-300 opacity-100"
              : "text-gray-400 hover:text-blue-400 opacity-0 group-hover:opacity-100"
              }`}
            onClick={handlePlayButtonClick}
          >
            {isCurrentSong && isPlaying ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* More options button - CHANGED: Always visible */}
          <button
            className="text-gray-400 hover:text-white transition-all duration-200 p-1"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>

          {/* Dropdown Menu - Use fixed positioning with very high z-index */}
          {menuOpen && (
            <div
              className="fixed bg-gray-800 text-white rounded-lg shadow-2xl py-2 w-36 sm:w-40 border border-gray-700 animate-fade-in"
              style={{
                top: menuRef.current ? menuRef.current.getBoundingClientRect().bottom + 4 : 0,
                left: menuRef.current ? menuRef.current.getBoundingClientRect().right - 160 : 0,
                zIndex: 999999,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
              }}
            >
              <button
                className={`w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-700 text-sm transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleDeleteSong}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Song'}
              </button>
              <button
                className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-700 text-sm transition-colors"
                onClick={handleAddToPlaylist}
              >
                Add to Playlist
              </button>
              <button
                className="w-full text-left px-3 sm:px-4 py-2 hover:bg-gray-700 text-sm transition-colors"
                onClick={handleEditSong}
              >
                Edit Song
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Edit Song Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-sm sm:max-w-md lg:max-w-lg animate-fade-in">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Edit Song</h2>
              <form onSubmit={handleUpdateSong}>
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Song Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 sm:py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Enter song name"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Artist
                  </label>
                  <input
                    type="text"
                    value={editForm.artist}
                    onChange={(e) => setEditForm(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full px-3 py-2 sm:py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Enter artist name"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 px-4 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm sm:text-base font-medium"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm sm:text-base font-medium ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={addToPlaylistModalOpen}
        onClose={() => setAddToPlaylistModalOpen(false)}
        song={song}
      />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .animate-fade-in { 
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

export default Song;