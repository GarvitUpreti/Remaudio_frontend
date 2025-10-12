import React, { useState } from 'react'; // ✅ Removed useEffect
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { addPlaylist, removePlaylist, updatePlaylist } from '../store/playlistSlice';
import PlaylistModal from '../components/PlaylistModal';

const Playlists = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const playlists = useSelector((state) => state.playlists.list);
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const dispatch = useDispatch();

  // ❌ REMOVED: loading state (not needed, playlists already loaded in Auth3)
  // ❌ REMOVED: fetchPlaylists (empty function)
  // ❌ REMOVED: useEffect (unnecessary)

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/playlists`,
        { name: newPlaylistName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // ✅ Just add to Redux - no user update needed
      dispatch(addPlaylist(response.data));
      setNewPlaylistName("");
      setShowCreateForm(false);

    } catch (error) {
      console.error("Error creating playlist:", error.response?.data || error.message);
      alert("Failed to create playlist. Please try again.");
    }
  };

  // ❌ REMOVED: updateUserInRedux function (not needed anymore)

  const deletePlaylist = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await axios.delete(
        `${API_URL}/playlists/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // ✅ Just remove from Redux - no user update needed
      dispatch(removePlaylist(playlistId));

    } catch (error) {
      console.error("Error deleting playlist:", error.response?.data || error.message);
      alert("Failed to delete playlist. Please try again.");
    }
  };

  const openPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    setIsModalOpen(true);
  };

  const handleUpdatePlaylist = async (playlistId, updatedData) => {
    try {
      const response = await axios.patch(
        `${API_URL}/playlists/${playlistId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        dispatch(updatePlaylist({
          playlistId: playlistId,
          updatedPlaylist: response.data
        }));
        setSelectedPlaylist(response.data);
      }
    } catch (error) {
      console.error('Error updating playlist:', error.response?.data || error.message);
      throw error;
    }
  };

  // ✅ No loading state check needed - playlists already loaded from Auth3
  return (
    <div className="px-4 py-6 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Playlists</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:px-4 sm:py-2 rounded-lg transition-colors font-medium"
        >
          Create Playlist
        </button>
      </div>

      {/* Create Playlist Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Create New Playlist</h2>
            <form onSubmit={createPlaylist}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                autoFocus
              />
              <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4 sm:gap-0">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 sm:py-2 rounded-lg transition-colors font-medium"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPlaylistName('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 sm:py-2 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlists Grid */}
      {playlists?.length === 0 ? (
        <div className="text-center text-gray-400 mt-12 px-4">
          <div className="text-4xl sm:text-6xl mb-4">🎵</div>
          <p className="text-lg sm:text-xl mb-4">No playlists yet</p>
          <p className="text-sm sm:text-base">Create your first playlist to organize your music!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="bg-gray-900 rounded-lg p-4 sm:p-6 hover:bg-gray-800 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-xl sm:text-2xl">
                  🎵
                </div>
                <button
                  onClick={() => deletePlaylist(playlist.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors p-2 -m-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <h3 className="text-white font-semibold text-base sm:text-lg mb-2 truncate">{playlist.name}</h3>
              <p className="text-gray-400 text-sm mb-4">
                {playlist.songs?.length || 0} songs
              </p>

              <button
                onClick={() => openPlaylist(playlist)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-2 rounded-lg transition-colors font-medium"
              >
                Open Playlist
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Playlist Modal */}
      <PlaylistModal
        playlist={selectedPlaylist}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdatePlaylist={handleUpdatePlaylist}
      />
    </div>
  );
};

export default Playlists;