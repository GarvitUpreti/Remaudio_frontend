import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeSong, setSongs } from "../store/songSlice";
import { updatePlaylist } from "../store/playlistSlice";
import { updateUser } from "../store/userSlice";
import AddToPlaylistModal from "../components/AddToPlaylistModal"; // Add this import

const Song = ({ song, onPlay, isCurrentSong }) => {
  const { isPlaying } = useSelector((state) => state.music);
  const { list: playlists } = useSelector((state) => state.playlists);
  const { list: songs } = useSelector((state) => state.songs); // Add this line
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", artist: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef(null);
  const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false); // Add this state

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
      const response = await fetch(`http://localhost:3000/songs/${song.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete song');
      }

      // Remove song from Redux state
      dispatch(removeSong(song.id));

      // Update user's songs list
      if (user && user.songs) {
        const updatedUserSongs = user.songs.filter(s => s.id !== song.id);
        dispatch(updateUser({ songs: updatedUserSongs }));
      }

      // Remove song from all playlists that contain it
      playlists.forEach(playlist => {
        if (playlist.songs && playlist.songs.some(s => s.id === song.id)) {
          const updatedSongs = playlist.songs.filter(s => s.id !== song.id);
          dispatch(updatePlaylist({
            playlistId: playlist.id,
            updatedPlaylist: { ...playlist, songs: updatedSongs }
          }));
        }
      });

      alert('Song deleted successfully!');
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSong = (e) => {
    e.stopPropagation();
    setEditForm({
      name: song.name.replace(/\.[^/.]+$/, ""), // Remove file extension
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

      const response = await fetch(`http://localhost:3000/songs/${song.id}`, {
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

      // Update song in songs list - Fix: use component-level songs instead of useSelector
      const updatedSongsList = songs.map(s =>
        s.id === song.id ? updatedSong : s
      );
      dispatch(setSongs(updatedSongsList));

      // Update user's songs list
      if (user && user.songs) {
        const updatedUserSongs = user.songs.map(s =>
          s.id === song.id ? updatedSong : s
        );
        dispatch(updateUser({ songs: updatedUserSongs }));
      }

      // Update song in all playlists that contain it
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
    e.stopPropagation();
    setAddToPlaylistModalOpen(true); // Open the modal instead of console.log
    setMenuOpen(false);
  };

  return (
    <>
      <div
        className={`p-4 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-between group
        ${isCurrentSong
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
              className={`font-medium transition-colors ${isCurrentSong ? "text-blue-400" : "text-white"
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
            className={`transition-all duration-200 ${isCurrentSong
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
                className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleDeleteSong}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Song'}
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
                onClick={handleAddToPlaylist}
              >
                Add to Playlist
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold text-white mb-4">Edit Song</h2>
            <form onSubmit={handleUpdateSong}>
              <div className="mb-4">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Song Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter artist name"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={addToPlaylistModalOpen}
        onClose={() => setAddToPlaylistModalOpen(false)}
        song={song}
      />
    </>
  );
}

export default Song;