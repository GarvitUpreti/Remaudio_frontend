// src/hooks/useFollowerMultiplay.js
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../contexts/SocketContext';
import { syncFromMultiplay, leaveMultiplayRoom } from '../store/musicSlice';

const nowMs = () => performance.now();

export const useFollowerMultiplay = () => {
  const { socket, networkStats } = useSocket();
  const dispatch = useDispatch();
  const { multiplay } = useSelector(state => state.music);
  const audioRef = useRef(null); // We'll pass this from the audio component
  const throttleRef = useRef(false);
  const performanceRef = useRef({
    avgProcessingDelay: 150, // Start with 150ms estimate
    measurements: []
  });

  // Function to measure actual audio processing delay
  const measureAudioDelay = (targetTime) => {
    const measureStart = nowMs();
    
    // Use requestAnimationFrame to measure when audio actually updates
    requestAnimationFrame(() => {
      if (audioRef.current) {
        const actualDelay = nowMs() - measureStart;
        
        // Store delay measurements (keep last 5)
        performanceRef.current.measurements.push(actualDelay);
        if (performanceRef.current.measurements.length > 5) {
          performanceRef.current.measurements.shift();
        }
        
        // Update average processing delay
        const measurements = performanceRef.current.measurements;
        performanceRef.current.avgProcessingDelay = 
          measurements.reduce((a, b) => a + b, 0) / measurements.length;
        
        console.log(`⏱️ Audio processing delay: ${actualDelay.toFixed(1)}ms | Avg: ${performanceRef.current.avgProcessingDelay.toFixed(1)}ms`);
      }
    });
  };

  useEffect(() => {
    if (!socket || !multiplay.isActive || multiplay.role !== 'follower') return;

    const handleSyncEvent = (data) => {
      if (!data || throttleRef.current) return;

      const eventReceiveTime = nowMs(); // Capture immediately
      
      const {
        currentSong,
        currentVolume,
        currentlyPlayingOn: hostPlaybackTime,
        isPlaying,
        repeatMode,
        action,
      } = data;

      // Calculate network delay from RTT
      let networkDelay = 0;
      if (networkStats.averageRtt > 0) {
        networkDelay = networkStats.averageRtt / 2000; // Convert to seconds
      }

      // Estimate total processing delay (React + Audio)
      const processingDelay = performanceRef.current.avgProcessingDelay / 1000; // Convert to seconds
      
      // Device-specific compensation
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const deviceCompensation = isMobile ? 0.05 : 0.02; // Extra mobile delay
      
      // Calculate predictive playback time
      let predictivePlaybackTime;
      
      switch (action) {
        case 'play':
        case 'resume':
          // Predict where host will be when our audio actually starts
          predictivePlaybackTime = hostPlaybackTime + networkDelay + processingDelay + deviceCompensation;
          break;
          
        case 'newSong':
          // For new songs, add minimal compensation
          predictivePlaybackTime = hostPlaybackTime + + networkDelay + processingDelay + deviceCompensation;
          break;
          
        case 'pause':
        case 'seek':
          predictivePlaybackTime = hostPlaybackTime + + networkDelay + processingDelay + deviceCompensation;
          break;
        case 'volume':
          // Use exact time for these actions
          predictivePlaybackTime = hostPlaybackTime;
          break;
          
        case 'heartbeat':
        default:
          if (isPlaying) {
            // Continuous sync with full compensation
            predictivePlaybackTime = hostPlaybackTime + networkDelay + (processingDelay * 1);
          } else {
            predictivePlaybackTime = hostPlaybackTime;
          }
      }

      // Clamp to non-negative
      predictivePlaybackTime = Math.max(0, predictivePlaybackTime);

      // Enhanced debug logging
      const syncDebug = {
        action,
        hostTime: hostPlaybackTime.toFixed(3) + 's',
        networkDelay: (networkDelay * 1000).toFixed(1) + 'ms',
        processingDelay: (processingDelay * 1000).toFixed(1) + 'ms',
        deviceComp: (deviceCompensation * 1000).toFixed(1) + 'ms',
        finalTime: predictivePlaybackTime.toFixed(3) + 's',
        compensation: ((predictivePlaybackTime - hostPlaybackTime) * 1000).toFixed(1) + 'ms',
        device: isMobile ? '📱' : '💻'
      };
      
      console.log('🎯 Predictive Sync:', syncDebug);

      // Start delay measurement
      measureAudioDelay(predictivePlaybackTime);

      // Throttle updates
      throttleRef.current = true;
      setTimeout(() => {
        throttleRef.current = false;
      }, 25); // Even faster throttle

      // Dispatch with predictive timing
      dispatch(
        syncFromMultiplay({
          currentSong,
          currentVolume,
          currentlyPlayingOn: predictivePlaybackTime,
          isPlaying,
          repeatMode,
        })
      );
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
  }, [socket, dispatch, multiplay.isActive, multiplay.role, networkStats]);

  // Return ref setter for audio element
  return {
    setAudioRef: (ref) => {
      audioRef.current = ref;
    }
  };
};