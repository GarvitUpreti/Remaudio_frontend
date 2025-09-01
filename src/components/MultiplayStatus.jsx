import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiMusic, FiUsers, FiExternalLink } from 'react-icons/fi';
import { leaveMultiplayRoom } from '../store/musicSlice';
import { useSocket } from '../contexts/SocketContext';

const MultiplayStatus = () => {
  const { multiplay } = useSelector(state => state.music);
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!multiplay.isActive) return null;

  const leaveRoom = () => {
    if (socket && multiplay.roomId) {
      socket.emit('leave_room', { roomId: multiplay.roomId });
    }
    dispatch(leaveMultiplayRoom());
  };

  const goToMultiplay = () => {
    navigate('/multiplay');
  };

  return (
    <div className="fixed top-16 sm:top-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50">
      <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-md rounded-lg p-3 text-white shadow-lg border border-white/10">
        <div className="flex items-center justify-between sm:space-x-3">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <FiMusic className="text-green-400 animate-pulse flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-xs font-medium truncate">
                  {multiplay.role === 'host' ? '👑 Hosting' : '👥 Following'}
                </p>
                <p className="text-xs text-gray-200 font-mono hidden sm:inline">
                  {multiplay.roomId}
                </p>
              </div>
              <p className="text-xs text-gray-200 font-mono sm:hidden truncate">
                {multiplay.roomId}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
            <button
              onClick={goToMultiplay}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              title="Go to Multiplay"
            >
              <FiExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={leaveRoom}
              className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-red-300 hover:text-red-200"
              title="Leave Room"
            >
              <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayStatus;