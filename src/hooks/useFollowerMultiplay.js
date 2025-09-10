// src/hooks/useFollowerMultiplay.js
import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocket } from '../contexts/SocketContext';
import { syncFromMultiplay, leaveMultiplayRoom } from '../store/musicSlice';

const nowMs = () => performance.now();

export const useFollowerMultiplay = () => {
  const { socket, networkStats } = useSocket();
  const dispatch = useDispatch();
  const { multiplay } = useSelector(state => state.music);
  const audioRef = useRef(null);
  const throttleRef = useRef(false);
  const lastSyncRef = useRef({ time: 0, action: null });
  
  // Enhanced performance tracking
  const performanceRef = useRef({
    avgProcessingDelay: 120, // More aggressive initial estimate
    measurements: [],
    networkJitter: 0,
    adaptiveMultiplier: 1.0,
    consecutiveGoodSyncs: 0,
    deviceProfile: null
  });

  // Device profiling for better compensation
  const getDeviceProfile = useCallback(() => {
    if (performanceRef.current.deviceProfile) return performanceRef.current.deviceProfile;
    
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    
    const profile = {
      type: isMobile ? 'mobile' : 'desktop',
      browser: isChrome ? 'chrome' : isSafari ? 'safari' : 'other',
      isIOS,
      baseCompensation: isMobile ? 0.08 : 0.03,
      processingMultiplier: isIOS ? 1.3 : isMobile ? 1.2 : 1.0,
      networkTolerance: isMobile ? 0.15 : 0.08
    };
    
    performanceRef.current.deviceProfile = profile;
    console.log('📱 Device Profile:', profile);
    return profile;
  }, []);

  // Adaptive performance measurement with machine learning approach
  const measureAudioDelay = useCallback((targetTime, action) => {
    const measureStart = nowMs();

    requestAnimationFrame(() => {
      if (audioRef.current) {
        const actualDelay = nowMs() - measureStart;
        const measurements = performanceRef.current.measurements;
        
        // Weight recent measurements more heavily
        const weight = action === 'play' || action === 'resume' ? 1.5 : 1.0;
        measurements.push({ delay: actualDelay, weight, action });
        
        if (measurements.length > 10) {
          measurements.shift();
        }

        // Weighted average calculation
        const totalWeight = measurements.reduce((sum, m) => sum + m.weight, 0);
        const weightedSum = measurements.reduce((sum, m) => sum + (m.delay * m.weight), 0);
        performanceRef.current.avgProcessingDelay = weightedSum / totalWeight;

        // Adaptive multiplier based on sync success
        const perf = performanceRef.current;
        if (actualDelay < perf.avgProcessingDelay * 0.8) {
          perf.consecutiveGoodSyncs++;
          if (perf.consecutiveGoodSyncs > 3) {
            perf.adaptiveMultiplier = Math.max(0.7, perf.adaptiveMultiplier - 0.05);
          }
        } else if (actualDelay > perf.avgProcessingDelay * 1.3) {
          perf.consecutiveGoodSyncs = 0;
          perf.adaptiveMultiplier = Math.min(1.5, perf.adaptiveMultiplier + 0.1);
        }

        console.log(`⏱️ Audio delay: ${actualDelay.toFixed(1)}ms | Avg: ${perf.avgProcessingDelay.toFixed(1)}ms | Multiplier: ${perf.adaptiveMultiplier.toFixed(2)} | Good syncs: ${perf.consecutiveGoodSyncs}`);
      }
    });
  }, []);

  // Advanced network delay calculation with jitter compensation
  const calculateNetworkDelay = useCallback(() => {
    if (!networkStats.averageRtt || networkStats.averageRtt <= 0) return 0;
    
    // Base network delay (one-way trip)
    let networkDelay = networkStats.averageRtt / 2000;
    
    // Calculate jitter compensation
    if (networkStats.jitter) {
      const jitterCompensation = networkStats.jitter / 2000;
      networkDelay += jitterCompensation * 0.5; // Add half jitter as buffer
      performanceRef.current.networkJitter = jitterCompensation;
    }
    
    return networkDelay;
  }, [networkStats]);

  // Smart predictive timing with context awareness
  const calculatePredictiveTime = useCallback((hostTime, action, isPlaying) => {
    const deviceProfile = getDeviceProfile();
    const networkDelay = calculateNetworkDelay();
    const processingDelay = (performanceRef.current.avgProcessingDelay * performanceRef.current.adaptiveMultiplier) / 1000;
    
    let compensationMultiplier = 1.0;
    let baseCompensation = deviceProfile.baseCompensation;
    
    // Action-specific compensation strategies
    switch (action) {
      case 'play':
      case 'resume':
        // Critical: Audio pipeline restart requires maximum compensation
        compensationMultiplier = 1.4;
        baseCompensation *= 1.5;
        
        // Extra compensation for mobile devices
        if (deviceProfile.type === 'mobile') {
          baseCompensation += 0.03;
        }
        break;
        
      case 'newSong':
        // Song loading requires significant compensation
        compensationMultiplier = 1.2;
        baseCompensation *= 1.3;
        break;
        
      case 'seek':
        // Seeking can be unpredictable, use moderate compensation
        compensationMultiplier = 1.1;
        break;
        
      case 'pause':
        // Pausing is usually immediate, minimal compensation needed
        compensationMultiplier = 0.3;
        baseCompensation *= 0.5;
        break;
        
      case 'volume':
        // Volume changes are immediate
        return hostTime;
        
      case 'heartbeat':
      default:
        if (isPlaying) {
          // Continuous sync during playback
          compensationMultiplier = 0.8;
        } else {
          // No playback, minimal compensation
          compensationMultiplier = 0.2;
        }
        break;
    }
    
    // Calculate final predictive time
    const totalNetworkDelay = networkDelay * (action === 'heartbeat' ? 0.5 : 1.0);
    const totalProcessingDelay = processingDelay * compensationMultiplier * deviceProfile.processingMultiplier;
    
    const predictiveTime = hostTime + totalNetworkDelay + totalProcessingDelay + baseCompensation;
    
    // Prevent negative time and extreme values
    const clampedTime = Math.max(0, Math.min(predictiveTime, hostTime + 2.0));
    
    return clampedTime;
  }, [getDeviceProfile, calculateNetworkDelay]);

  // Enhanced throttling with action priority
  const shouldThrottle = useCallback((action) => {
    if (throttleRef.current) return true;
    
    const lastSync = lastSyncRef.current;
    const timeSinceLastSync = nowMs() - lastSync.time;
    
    // Priority actions bypass throttling
    const priorityActions = ['play', 'pause', 'resume', 'newSong', 'seek'];
    if (priorityActions.includes(action)) {
      return timeSinceLastSync < 10; // Very short throttle for priority actions
    }
    
    // Regular throttling for other actions
    return timeSinceLastSync < 30;
  }, []);

  useEffect(() => {
    if (!socket || !multiplay.isActive || multiplay.role !== 'follower') return;

    const handleSyncEvent = (data) => {
      if (!data) return;
      
      const receiveTime = nowMs();
      const {
        currentSong,
        currentVolume,
        currentlyPlayingOn: hostPlaybackTime,
        isPlaying,
        repeatMode,
        action = 'heartbeat',
      } = data;

      // Enhanced throttling check
      if (shouldThrottle(action)) {
        return;
      }

      // Calculate predictive playback time
      const predictivePlaybackTime = calculatePredictiveTime(hostPlaybackTime, action, isPlaying);

      // Enhanced debug logging
      const deviceProfile = getDeviceProfile();
      const networkDelay = calculateNetworkDelay();
      const processingDelay = performanceRef.current.avgProcessingDelay / 1000;
      
      const syncDebug = {
        action: action,
        device: `${deviceProfile.type === 'mobile' ? '📱' : '💻'} ${deviceProfile.browser}`,
        hostTime: hostPlaybackTime.toFixed(3) + 's',
        predictedTime: predictivePlaybackTime.toFixed(3) + 's',
        compensation: ((predictivePlaybackTime - hostPlaybackTime) * 1000).toFixed(1) + 'ms',
        networkDelay: (networkDelay * 1000).toFixed(1) + 'ms',
        processingDelay: (processingDelay * 1000).toFixed(1) + 'ms',
        multiplier: performanceRef.current.adaptiveMultiplier.toFixed(2),
        jitter: (performanceRef.current.networkJitter * 1000).toFixed(1) + 'ms'
      };

      console.log('🎯 Advanced Sync:', syncDebug);

      // Measure performance
      measureAudioDelay(predictivePlaybackTime, action);

      // Update last sync tracking
      lastSyncRef.current = { time: receiveTime, action };

      // Apply intelligent throttling
      throttleRef.current = true;
      const throttleDelay = ['play', 'pause', 'resume', 'newSong'].includes(action) ? 15 : 35;
      setTimeout(() => {
        throttleRef.current = false;
      }, throttleDelay);

      // Dispatch the sync
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

    // Connection quality monitoring
    const handleNetworkChange = () => {
      console.log('🌐 Network change detected, resetting performance metrics');
      performanceRef.current.measurements = [];
      performanceRef.current.adaptiveMultiplier = 1.0;
      performanceRef.current.consecutiveGoodSyncs = 0;
    };

    socket.on('sync_event', handleSyncEvent);
    socket.on('room_closed', handleRoomClosed);
    socket.on('connect', handleNetworkChange);
    socket.on('reconnect', handleNetworkChange);

    return () => {
      socket.off('sync_event', handleSyncEvent);
      socket.off('room_closed', handleRoomClosed);
      socket.off('connect', handleNetworkChange);
      socket.off('reconnect', handleNetworkChange);
    };
  }, [socket, dispatch, multiplay.isActive, multiplay.role, networkStats, calculatePredictiveTime, shouldThrottle, measureAudioDelay]);

  // Return enhanced ref setter with initialization
  return {
    setAudioRef: useCallback((ref) => {
      audioRef.current = ref;
      
      // Initialize performance tracking when audio element is set
      if (ref && !performanceRef.current.initialized) {
        performanceRef.current.initialized = true;
        console.log('🎵 Audio element initialized for multiplay sync');
      }
    }, [])
  };
};