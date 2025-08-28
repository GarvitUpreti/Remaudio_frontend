// src/hooks/useFollowerMultiplay.js
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../contexts/SocketContext';
import { syncFromMultiplay, leaveMultiplayRoom } from '../store/musicSlice';

const nowMs = () =>
  (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

export const useFollowerMultiplay = () => {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const { multiplay } = useSelector(state => state.music);
  const isUpdatingRef = useRef(false); // Prevent flickering

  useEffect(() => {
    if (!socket || !multiplay.isActive || multiplay.role !== 'follower') return;

    const handleSyncEvent = (data) => {
      if (!data) return;

      const {
        timestamp: hostSendTime, // host's monotonic stamp (ms)
        currentSong,
        currentVolume,
        currentlyPlayingOn: hostPlaybackTime, // seconds
        isPlaying,
        repeatMode,
        action, // play/pause/seek/newSong/volume/heartbeat
      } = data;

      // ⚠️ Do as little work as possible before we capture follower's "apply time".
      // Capture follower time at the LAST moment, right before we compute + dispatch.
      const followerApplyTime = nowMs(); // follower's monotonic stamp (ms)
      const networkDelay = (followerApplyTime - hostSendTime) / 1000; // seconds

      let adjustedPlaybackTime;
      switch (action) {
        case 'play':
        case 'resume':
          adjustedPlaybackTime = hostPlaybackTime + networkDelay + 120;
          break;
        case 'newSong':
          adjustedPlaybackTime = hostPlaybackTime + networkDelay ; // Add small buffer to account for delays
          break;
        case 'pause':
          // When host paused, clock shouldn't advance on follower.
          adjustedPlaybackTime = hostPlaybackTime;
          break;
        case 'seek':
          // If you know seek happens while playing, you could add networkDelay.
          // Keeping your prior intent: apply host time without advancing.
          adjustedPlaybackTime = hostPlaybackTime;
          break;
        case 'volume':
          adjustedPlaybackTime =  hostPlaybackTime;
          break;
        default:
          // Heartbeat or unknown → advance only if playing.
          adjustedPlaybackTime = isPlaying ? hostPlaybackTime + networkDelay : hostPlaybackTime;
      }

      adjustedPlaybackTime = Math.max(0, adjustedPlaybackTime);

      // Add the requested +0.2 seconds before dispatch (and clamp to >= 0)
      const playbackToDispatch = Math.max(0, adjustedPlaybackTime);

      // Prevent rapid updates that cause flickering
      if (!isUpdatingRef.current) {
        isUpdatingRef.current = true;

        // Debug (optional)
        // console.log(
        //   `📡 Delay: ${networkDelay.toFixed(3)}s | Host: ${hostPlaybackTime.toFixed(3)}s | ` +
        //   `Adj: ${adjustedPlaybackTime.toFixed(3)}s | Disp: ${playbackToDispatch.toFixed(3)}s | Action: ${action}`
        // );

        dispatch(
          syncFromMultiplay({
            currentSong,
            currentVolume,
            currentlyPlayingOn: playbackToDispatch,
            isPlaying,
            repeatMode,
          })
        );

        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 100);
      }
    };

    const handleRoomClosed = (data) => {
      dispatch(leaveMultiplayRoom());
      alert(`Room was closed: ${data?.reason || 'Host disconnected'}`);
    };

    socket.on('sync_event', handleSyncEvent);
    socket.on('room_closed', handleRoomClosed);

    return () => {
      socket.off('sync_event', handleSyncEvent);
      socket.off('room_closed', handleRoomClosed);
    };
  }, [socket, dispatch, multiplay.isActive, multiplay.role]);
};
