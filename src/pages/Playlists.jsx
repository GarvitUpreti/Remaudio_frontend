import React, { useState, useEffect } from 'react';
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from '../store/userSlice';
import PlaylistModal from '../components/PlaylistModal'; // Import the modal component

const Playlists = () => {
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      // No need to set playlists state, using user.playlists directly
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const response = await axios.post(
        "http://localhost:3000/playlists",
        {
          name: newPlaylistName,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        const newPlaylist = response.data;
        
        // Update user in Redux with the new playlist ID
        await updateUserInRedux("patch", newPlaylist.id);
        
        setNewPlaylistName("");
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error(
        "Error creating playlist:",
        error.response?.data || error.message
      );
    }
  };

  const updateUserInRedux = async (flag, newPlaylistId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User id not found in localStorage");
        return;
      }

      const url = `http://localhost:3000/user/${userId}`;
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      };

      let response;
      if (flag === "get") {
        response = await axios.get(`http://localhost:3000/user/id/${userId}`, { headers });
      } else {
        response = await axios.patch(
          url,
          {
            playlistToAdd: [newPlaylistId],
          },
          { headers }
        );
      }
      console.log(response.data);

      if (response.status === 200) {
        dispatch(setUser(response.data));
      } else {
        console.error("Failed to fetch user data");
      }
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response?.data || error.message
      );
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      const response = await axios.delete(
        `http://localhost:3000/playlists/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 204) {
        // No need to update local state, will be updated via Redux
      }

      await updateUserInRedux("get");
    } catch (error) {
      console.error(
        "Error deleting playlist:",
        error.response?.data || error.message
      );
    }
  };

  // New function to handle opening playlist modal
  const openPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    setIsModalOpen(true);
  };

  // New function to handle playlist updates from modal
  const handleUpdatePlaylist = async (playlistId, updates) => {
    try {
      const response = await axios.patch(
        `http://localhost:3000/playlists/${playlistId}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 200) {
        // Refresh user data to get updated playlists
        await updateUserInRedux("get");
      }
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-white">Loading playlists...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Your Playlists</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Create Playlist
        </button>
      </div>

      {/* Create Playlist Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold text-white mb-4">Create New Playlist</h2>
            <form onSubmit={createPlaylist}>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPlaylistName('');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playlists Grid */}
      {!user?.playlists || user.playlists.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-xl mb-4">No playlists yet</p>
          <p>Create your first playlist to organize your music!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {user.playlists.map((playlist) => (
            <div key={playlist.id} className="bg-gray-900 rounded-lg p-6 hover:bg-gray-800 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-2xl">
                  🎵
                </div>
                <button
                  onClick={() => deletePlaylist(playlist.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <h3 className="text-white font-semibold text-lg mb-2">{playlist.name}</h3>
              <p className="text-gray-400 text-sm mb-4">
                {playlist.songs?.length || 0} songs
              </p>

              <button 
                onClick={() => openPlaylist(playlist)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
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