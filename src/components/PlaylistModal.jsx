import React, { useState, useEffect } from 'react';

const PlaylistModal = ({ playlist, isOpen, onClose, onUpdatePlaylist }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [songs, setSongs] = useState([]);

  // Update state when playlist changes
  useEffect(() => {
    if (playlist) {
      setPlaylistName(playlist.name || '');
      setSongs(playlist.songs || []);
    }
  }, [playlist]);

  if (!isOpen || !playlist) return null;

  const handleSaveEdit = async () => {
    try {
      await onUpdatePlaylist(playlist.id, { name: playlistName });
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
  };

  const handleCancelEdit = () => {
    setPlaylistName(playlist.name);
    setSongs(playlist.songs || []);
    setIsEditMode(false);
  };

  const removeSong = async (songId) => {
    try {
      const updatedSongs = songs.filter(song => song.id !== songId);
      setSongs(updatedSongs);
      // Add API call here to persist the change if needed
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  const handlePlayAll = () => {
    console.log('Playing all songs from:', playlist.name);
    // Add your play logic here
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-5"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700 relative">
          <button 
            className="absolute top-5 right-5 text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition-all duration-200"
            onClick={onClose}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
          
          <div className="flex items-center gap-5 mb-5">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white text-3xl">
              🎵
            </div>
            
            <div className="flex-1">
              {isEditMode ? (
                <input 
                  className="bg-gray-700 text-white text-3xl font-bold p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="Playlist name"
                />
              ) : (
                <h2 className="text-white text-3xl font-bold mb-2">{playlist.name}</h2>
              )}
              <p className="text-gray-400 text-base">{songs.length} songs</p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            {isEditMode ? (
              <>
                <button 
                  className="text-gray-400 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  onClick={handleSaveEdit}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  onClick={handlePlayAll}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Play All
                </button>
                <button 
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  onClick={() => setIsEditMode(true)}
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {!songs || songs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-xl mb-4">No songs in this playlist yet</p>
              <p>Add some songs to get started!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {songs.map((song, index) => (
                <div 
                  key={song.id} 
                  className="grid grid-cols-[40px_50px_1fr_auto_auto] items-center gap-4 py-3 px-0 rounded-lg hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex justify-center items-center text-gray-400 font-medium">
                    {isEditMode ? (
                      <button 
                        className="text-red-400 hover:bg-red-900 hover:text-red-300 p-1 rounded transition-colors"
                        onClick={() => removeSong(song.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-md flex items-center justify-center text-white">
                    🎵
                  </div>
                  
                  <div className="min-w-0">
                    <div className="text-white font-medium text-base mb-1 truncate">
                      {song.name || song.title || 'Unknown Title'}
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      {song.artist || 'Unknown Artist'}
                    </div>
                  </div>
                  
                  <div className="text-gray-400 text-sm font-medium">
                    {song.duration || '0:00'}
                  </div>
                  
                  {!isEditMode && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="text-gray-400 hover:text-white hover:bg-gray-600 p-2 rounded-md transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 8c1.1 0 2-.9 2 2s-.9 2-2 2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;