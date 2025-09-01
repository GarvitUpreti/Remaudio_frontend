import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../contexts/SocketContext';
import { setMultiplayRoom, leaveMultiplayRoom } from '../store/musicSlice';
import { useHostMultiplay } from '../hooks/useHostMultiplay';
import { useFollowerMultiplay } from '../hooks/useFollowerMultiplay';
import { FiUsers, FiCopy, FiLogOut, FiMusic } from 'react-icons/fi';

const Multiplay = () => {
  const { socket, isConnected } = useSocket();
  const dispatch = useDispatch();
  const { multiplay, currentSong, isPlaying } = useSelector(state => state.music);
  const [roomInput, setRoomInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize hooks
  useHostMultiplay();
  useFollowerMultiplay();

  const generateRoomId = () => {
    return `ROOM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  const createRoom = async () => {
    if (!socket || !isConnected) {
      alert('Socket not connected. Please refresh the page.');
      return;
    }

    const roomId = generateRoomId();
    setIsCreating(true);
    
    socket.emit('join_room', { roomId, role: 'host' });
    
    socket.once('join_status', (response) => {
      setIsCreating(false);
      
      if (response.message === 'joined') {
        dispatch(setMultiplayRoom({ roomId, role: 'host' }));
      } else {
        alert(`Failed to create room: ${response.message}`);
      }
    });
  };

  const joinRoom = () => {
    if (!socket || !isConnected) {
      alert('Socket not connected. Please refresh the page.');
      return;
    }

    if (!roomInput.trim()) {
      alert('Please enter a room ID');
      return;
    }

    setIsJoining(true);
    
    socket.emit('join_room', { roomId: roomInput.trim().toUpperCase(), role: 'follower' });
    
    socket.once('join_status', (response) => {
      setIsJoining(false);
      
      if (response.message === 'joined') {
        dispatch(setMultiplayRoom({ roomId: roomInput.trim().toUpperCase(), role: 'follower' }));
        setRoomInput('');
      } else {
        alert(`Failed to join room: ${response.message}`);
      }
    });
  };

  const leaveRoom = () => {
    if (socket && multiplay.roomId) {
      socket.emit('leave_room', { roomId: multiplay.roomId });
    }
    dispatch(leaveMultiplayRoom());
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(multiplay.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      joinRoom();
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-base sm:text-lg">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4 py-6 sm:p-6 pb-24 sm:pb-6">
      {/* Header with Room ID */}
      {multiplay.isActive && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-white">
            <div className="flex items-center justify-between sm:justify-start sm:space-x-2">
              <div className="flex items-center space-x-2 min-w-0">
                <FiMusic className="text-green-400 flex-shrink-0" />
                <span className="text-sm font-medium truncate">Room: {multiplay.roomId}</span>
              </div>
              <button
                onClick={copyRoomId}
                className="p-2 hover:bg-white/20 rounded transition-colors flex-shrink-0 ml-2 sm:ml-0"
                title="Copy Room ID"
              >
                <FiCopy className={`w-4 h-4 ${copied ? 'text-green-400' : 'text-gray-300'}`} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-4xl pt-16 sm:pt-20">
        {/* Main Content */}
        {!multiplay.isActive ? (
          // Room Creation/Join Interface
          <div className="text-center text-white mb-8 sm:mb-16">
            <div className="mb-8 sm:mb-14">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent px-4">
                Multiplay
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 px-4">
                Sync your music with friends in real-time
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-2xl mx-auto">
              {/* Create Room */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/20">
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiUsers className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Create Room</h3>
                  <p className="text-gray-300 mb-6 text-sm sm:text-base">
                    Start a session and become the host
                  </p>
                  <button
                    onClick={createRoom}
                    disabled={isCreating}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create Room</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Join Room */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/20">
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiMusic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Join Room</h3>
                  <p className="text-gray-300 mb-6 text-sm sm:text-base">
                    Enter a room ID to join a session
                  </p>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Enter Room ID (e.g., ROOM-ABC123)"
                      value={roomInput}
                      onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                      onKeyPress={handleInputKeyPress}
                      className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      disabled={isJoining}
                    />
                    <button
                      onClick={joinRoom}
                      disabled={isJoining || !roomInput.trim()}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      {isJoining ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                          <span>Joining...</span>
                        </>
                      ) : (
                        <span>Join Room</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiMusic className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400" />
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Real-time Sync</h4>
                <p className="text-gray-400 text-xs sm:text-sm">Perfect synchronization across all devices</p>
              </div>
              <div className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Easy Sharing</h4>
                <p className="text-gray-400 text-xs sm:text-sm">Simple room codes for instant joining</p>
              </div>
              <div className="p-4 sm:p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FiLogOut className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Host Control</h4>
                <p className="text-gray-400 text-xs sm:text-sm">Full playback control for room hosts</p>
              </div>
            </div>
          </div>
        ) : (
          // Active Room Interface
          <div className="text-white text-center">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 border border-white/20 max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Room Active</h2>
                <div className="flex items-center justify-center space-x-2 text-base sm:text-lg">
                  <span className={`px-3 py-2 rounded-full text-sm font-medium ${
                    multiplay.role === 'host' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {multiplay.role === 'host' ? '👑 Host' : '👥 Follower'}
                  </span>
                </div>
              </div>

              {/* Current Song Info */}
              {currentSong && (
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-3">
                    <FiMusic className={`w-5 h-5 flex-shrink-0 ${isPlaying ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate text-sm sm:text-base">{currentSong.title}</p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        {isPlaying ? 'Now Playing' : 'Paused'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Role-specific Messages */}
              {multiplay.role === 'host' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                  <p className="text-green-400 font-medium mb-2 text-sm sm:text-base">🎵 You're the Host</p>
                  <p className="text-xs sm:text-sm text-gray-300">
                    All music controls sync to your followers automatically
                  </p>
                </div>
              )}

              {multiplay.role === 'follower' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <p className="text-blue-400 font-medium mb-2 text-sm sm:text-base">👥 Following</p>
                  <p className="text-xs sm:text-sm text-gray-300">
                    Your music is synced with the host's playback
                  </p>
                </div>
              )}

              {/* Room Info */}
              <div className="space-y-4 mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Room ID:</span>
                    <span className="font-mono font-bold text-base sm:text-lg break-all">{multiplay.roomId}</span>
                  </div>
                  <button
                    onClick={copyRoomId}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                    title="Copy Room ID"
                  >
                    <FiCopy className={`w-4 h-4 ${copied ? 'text-green-400' : 'text-gray-300'}`} />
                  </button>
                </div>

                {copied && (
                  <p className="text-green-400 text-sm animate-fade-in">
                    Room ID copied to clipboard!
                  </p>
                )}

                {multiplay.role === 'host' && (
                  <p className="text-gray-300 text-xs sm:text-sm px-4">
                    Share this Room ID with friends so they can join your session
                  </p>
                )}
              </div>

              {/* Leave Room Button */}
              <button
                onClick={leaveRoom}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mx-auto text-sm sm:text-base"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Leave Room</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom spacer for mobile navigation */}
      <div className="h-8 sm:h-0"></div>

      {/* Custom styles for fade-in animation */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Multiplay;