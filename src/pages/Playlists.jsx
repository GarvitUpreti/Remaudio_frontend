import React, { useState, useEffect } from 'react';

const Playlists = (prop) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      
        setPlaylists(prop.playlists);
      
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
      const response = await fetch('http://localhost:3000/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newPlaylistName,
          description: ''
        })
      });

      if (response.ok) {
        const newPlaylist = await response.json();
        setPlaylists([...playlists, newPlaylist]);
        setNewPlaylistName('');
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      const response = await fetch(`http://localhost:3000/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setPlaylists(playlists.filter(p => p.id !== playlistId));
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
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
      {playlists.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-xl mb-4">No playlists yet</p>
          <p>Create your first playlist to organize your music!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
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
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                Open Playlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;