import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updatePlaylist } from '../store/playlistSlice';
import axios from 'axios';

const AddToPlaylistModal = ({ isOpen, onClose, song }) => {
  const { list: playlists } = useSelector((state) => state.playlists);
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  
  const handleAddToPlaylist = async (playlist) => {
    setIsAdding(true);
    setSelectedPlaylist(playlist.id);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await axios.patch(
        `${API_URL}/playlists/${playlist.id}`,
        {
          songIdsToAdd: [song.id]
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 200) {
        const updatedPlaylist = response.data;
        dispatch(updatePlaylist({
          playlistId: playlist.id,
          updatedPlaylist: updatedPlaylist
        }));

        // Success notification
        const successDiv = document.createElement('div');
        successDiv.innerHTML = `
          <div class="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg z-[60] flex items-center space-x-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-sm sm:text-base">Added to "${playlist.name}"!</span>
          </div>
        `;
        document.body.appendChild(successDiv);
        setTimeout(() => {
          document.body.removeChild(successDiv);
        }, 3000);

        onClose();
      }
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      
      const errorDiv = document.createElement('div');
      let errorMessage = 'Failed to add song to playlist!';
      
      if (error.response?.status === 409) {
        errorMessage = 'Song is already in this playlist!';
      }
      
      errorDiv.innerHTML = `
        <div class="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto bg-red-600 text-white px-4 sm:px-6 py-3 rounded-lg shadow-lg z-[60] flex items-center space-x-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-sm sm:text-base">${errorMessage}</span>
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 3000);
    } finally {
      setIsAdding(false);
      setSelectedPlaylist(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] sm:max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold truncate">Add to Playlist</h2>
              <p className="text-blue-100 text-sm mt-1">Choose a playlist for your song</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-500 rounded-lg transition-all duration-200 disabled:opacity-50 flex-shrink-0 ml-3"
              disabled={isAdding}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Song Info */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              {song.coverImgURL ? (
                <img
                  src={song.coverImgURL}
                  alt={song.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg"
                />
              ) : (
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-gray-300 text-xs sm:text-sm">Adding:</p>
              <p className="font-semibold text-white text-base sm:text-lg truncate">{song.name.replace(/\.[^/.]+$/, "")}</p>
              <p className="text-gray-400 text-xs sm:text-sm truncate">{song.artist || 'Unknown Artist'}</p>
            </div>
          </div>
        </div>

        {/* Playlist List */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {playlists.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <p className="text-gray-400 text-base sm:text-lg mb-2">No playlists found</p>
              <p className="text-gray-500 text-sm">Create your first playlist to add songs</p>
              <button className="mt-4 px-6 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm sm:text-base font-medium">
                Create Playlist
              </button>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              <p className="text-gray-400 text-sm font-medium mb-4">
                Select playlist ({playlists.length} available)
              </p>
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist)}
                  disabled={isAdding}
                  className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-200 flex items-center justify-between group
                    ${isAdding && selectedPlaylist === playlist.id
                      ? 'bg-blue-600 shadow-lg transform scale-[0.98] cursor-not-allowed'
                      : 'bg-gray-700 hover:bg-gray-600 hover:shadow-lg hover:transform hover:scale-[1.02]'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                    <div className="relative flex-shrink-0">
                      {playlist.coverImgURL ? (
                        <img
                          src={playlist.coverImgURL}
                          alt={playlist.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Loading indicator on playlist image */}
                      {isAdding && selectedPlaylist === playlist.id && (
                        <div className="absolute inset-0 bg-blue-600 bg-opacity-80 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold transition-colors duration-200 text-sm sm:text-base truncate ${
                        isAdding && selectedPlaylist === playlist.id ? 'text-white' : 'text-white group-hover:text-blue-300'
                      }`}>
                        {playlist.name}
                      </p>
                      <p className={`text-xs sm:text-sm transition-colors duration-200 ${
                        isAdding && selectedPlaylist === playlist.id ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-300'
                      }`}>
                        {playlist.songs?.length || 0} songs
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 flex-shrink-0 ml-3">
                    {isAdding && selectedPlaylist === playlist.id ? (
                      <div className="flex items-center space-x-2 text-blue-100">
                        <div className="w-4 h-4 border-2 border-blue-100 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs sm:text-sm font-medium hidden sm:inline">Adding...</span>
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-600 group-hover:bg-blue-600 rounded-lg transition-all duration-200">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;