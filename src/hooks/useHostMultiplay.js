import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../contexts/SocketContext';

const nowMs = () =>
  (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

export const useHostMultiplay = () => {
  const { socket } = useSocket();
  const musicState = useSelector(state => state.music);
  const { multiplay } = musicState;

  const heartbeatRef = useRef();
  const prevStateRef = useRef();
  const lastActionRef = useRef('heartbeat');

  const sendMultiplayEvent = (action = 'heartbeat') => {
    if (!socket || !multiplay.isActive || multiplay.role !== 'host') return;

    // Stamp time at the LAST moment before emitting.
    const stamp = nowMs() 

    // Read the latest state right before emit as well.
    const payload = {
      roomId: multiplay.roomId,
      // host monotonic clock (ms)
      timestamp: stamp,
      // snapshot of state to mirror on followers
      currentSong: musicState.currentSong,
      currentVolume: musicState.currentVolume,
      currentlyPlayingOn: musicState.currentlyPlayingOn, // seconds
      isPlaying: musicState.isPlaying,
      repeatMode: musicState.repeatMode,
      action, // play/pause/seek/newSong/volume/heartbeat
    };

    // Debug (optional)
    // console.log(`🚀 Host emit [${action}] @${payload.timestamp}ms`, {
    //   time: payload.currentlyPlayingOn,
    //   playing: payload.isPlaying,
    // });

    socket.emit('playback_event', payload);
  };

  // Detect specific actions and send appropriate events
  useEffect(() => {
    if (!multiplay.isActive || multiplay.role !== 'host') return;

    const currentState = {
      currentSong: musicState.currentSong?.id || null,
      currentVolume: musicState.currentVolume,
      currentlyPlayingOn: musicState.currentlyPlayingOn,
      isPlaying: musicState.isPlaying,
      repeatMode: musicState.repeatMode,
    };

    const prevState = prevStateRef.current;

    if (!prevState) {
      prevStateRef.current = currentState;
      // Optionally send an initial snapshot so early followers sync immediately
      // sendMultiplayEvent('init');
      return;
    }

    let action = 'update';

    if (currentState.currentSong !== prevState.currentSong) {
      action = 'newSong';
    } else if (currentState.isPlaying !== prevState.isPlaying) {
      action = currentState.isPlaying ? 'play' : 'pause';
    } else if (Math.abs(currentState.currentlyPlayingOn - prevState.currentlyPlayingOn) > 2) {
      action = 'seek'; // jumped more than 2s
    } else if (currentState.currentVolume !== prevState.currentVolume) {
      action = 'volume';
    }

    if (action !== 'update') {
      lastActionRef.current = action;
      sendMultiplayEvent(action);
      prevStateRef.current = currentState;
    }
  }, [
    musicState.currentSong,
    musicState.currentVolume,
    musicState.currentlyPlayingOn,
    musicState.isPlaying,
    musicState.repeatMode,
    multiplay.isActive,
    multiplay.role,
  ]);

  // Heartbeat (every 5 seconds)
  useEffect(() => {
    if (!multiplay.isActive || multiplay.role !== 'host') {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      return;
    }

    // heartbeatRef.current = setInterval(() => {
    //   sendMultiplayEvent('heartbeat');
    // }, 5000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [multiplay.isActive, multiplay.role]);
};
