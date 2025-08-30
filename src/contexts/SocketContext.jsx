// src/contexts/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [networkStats, setNetworkStats] = useState({
    rtt: 0,
    averageRtt: 0,
    jitter: 0,
    lastUpdated: null
  });

  const rttMeasurements = useRef([]);
  const rttIntervalRef = useRef();

  // RTT Measurement Function
  const measureRTT = () => {
    if (!socket || !isConnected) return;

    const pingStart = performance.now();
    const timeoutId = setTimeout(() => {
      console.warn('RTT measurement timeout');
    }, 5000);

    socket.emit('rtt_ping', { timestamp: pingStart });

    const handlePong = (data) => {
      clearTimeout(timeoutId);
      const pingEnd = performance.now();
      const rtt = pingEnd - pingStart;

      // Store RTT measurements (keep last 10)
      rttMeasurements.current.push(rtt);
      if (rttMeasurements.current.length > 10) {
        rttMeasurements.current.shift();
      }

      // Calculate average and jitter
      const measurements = rttMeasurements.current;
      const averageRtt = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const jitter = measurements.length > 1
        ? Math.sqrt(measurements.reduce((sum, val) => sum + Math.pow(val - averageRtt, 2), 0) / measurements.length)
        : 0;

      setNetworkStats({
        rtt,
        averageRtt,
        jitter,
        lastUpdated: Date.now()
      });

      console.log(`📊 RTT: ${rtt.toFixed(1)}ms | Avg: ${averageRtt.toFixed(1)}ms | Jitter: ${jitter.toFixed(1)}ms`);

      socket.off('rtt_pong', handlePong);
    };

    socket.on('rtt_pong', handlePong);
  };

  useEffect(() => {
    console.log('🔌 Initializing socket connection...');

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);

      // Start RTT measurements every 5 seconds (instead of 10)
      measureRTT(); // Initial measurement
      rttIntervalRef.current = setInterval(measureRTT, 5000);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      if (rttIntervalRef.current) {
        clearInterval(rttIntervalRef.current);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
      measureRTT(); // Measure RTT after reconnection
    });

    setSocket(newSocket);

    return () => {
      console.log('🧹 Cleaning up socket connection...');
      if (rttIntervalRef.current) {
        clearInterval(rttIntervalRef.current);
      }
      newSocket.close();
    };
  }, []);

  const value = {
    socket,
    isConnected,
    connectionError,
    networkStats,
    measureRTT
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};