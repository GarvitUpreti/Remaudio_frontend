// src/hooks/useHostMultiplay.js
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../contexts/SocketContext';

export const useHostMultiplay = () => {
  const { socket } = useSocket();
  const musicState = useSelector(state => state.music);
  const { multiplay } = musicState;

  const prevStateRef = useRef();
  const lastEmitTimeRef = useRef(0);
  const heartbeatRef = useRef();

  const sendMultiplayEvent = (action = 'heartbeat') => {
    if (!socket || !multiplay.isActive || multiplay.role !== 'host') return;

    // Prevent too frequent emissions
    const now = performance.now();
    if (now - lastEmitTimeRef.current < 30) return; // Reduced to 30ms for better responsiveness
    lastEmitTimeRef.current = now;

    const payload = {
      roomId: multiplay.roomId,
      currentSong: musicState.currentSong,
      currentVolume: musicState.currentVolume,
      currentlyPlayingOn: musicState.currentlyPlayingOn,
      isPlaying: musicState.isPlaying,
      repeatMode: musicState.repeatMode,
      action,
    };

    console.log(`🚀 Host [${action}]`, {
      time: payload.currentlyPlayingOn.toFixed(3) + 's',
      playing: payload.isPlaying,
      song: payload.currentSong?.name || 'None'
    });

    socket.emit('playback_event', payload);
  };

  // Enhanced state change detection
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
      return;
    }

    let action = null;

    // Detect changes more precisely
    if (currentState.currentSong !== prevState.currentSong) {
      action = 'newSong';
    } else if (currentState.isPlaying !== prevState.isPlaying) {
      action = currentState.isPlaying ? 'play' : 'pause';
    } else if (Math.abs(currentState.currentlyPlayingOn - prevState.currentlyPlayingOn) > 1.0) {
      // Reduced threshold from 1.5s to 1.0s for better seek detection
      action = 'seek';
    } else if (Math.abs(currentState.currentVolume - prevState.currentVolume) > 0.01) {
      // More sensitive volume detection
      action = 'volume';
    }

    if (action) {
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

};