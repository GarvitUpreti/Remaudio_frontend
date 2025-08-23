import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "./store/userSlice";

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MusicPlayer from './components/MusicPlayer';
import Home from './pages/Home';
import Songs from './pages/Songs';
import Playlists from './pages/Playlists';
import Upload from './pages/Upload';
import DeveloperNote from './pages/DeveloperNot2';
import Auth3 from './pages/Auth3';
import LoadingScreen from './components/LoadingScreen';

const App = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');

    if (!token || !userEmail) {
      // No token or email, user needs to authenticate
      setTimeout(() => {
        setLoading(false);
        dispatch(logout());
      }, 2000);
      return;
    }

    // Validate token and fetch user data
    try {
      const response = await axios.get(
        `http://localhost:3000/user/email/${userEmail}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("API response:", response.data);
      dispatch(setUser(response.data));
      console.log('User data loaded:', response.data);
      
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
      dispatch(logout());
    } finally {
      // Add minimum loading time for better UX
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };
  

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <Auth3 />;
  }

  // Show main app if authenticated
  return (
    <Router>
      <div className="h-screen bg-gray-900 text-white flex flex-col">
        <MainLayout
          user={user}
          currentSong={currentSong}
          setCurrentSong={setCurrentSong}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          volume={volume}
          setVolume={setVolume}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          duration={duration}
          setDuration={setDuration}
        />
      </div>
    </Router>
  );
};

const MainLayout = ({
  user,
  currentSong,
  setCurrentSong,
  isPlaying,
  setIsPlaying,
  volume,
  setVolume,
  currentTime,
  setCurrentTime,
  duration,
  setDuration
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
        />

        <main className="flex-1 bg-gray-800 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/songs" 
              element={
                <Songs 
                  setCurrentSong={setCurrentSong} 
                />
              } 
            />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/developer" element={<DeveloperNote />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        volume={volume}
        setVolume={setVolume}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        duration={duration}
        setDuration={setDuration}
      />
    </>
  );
};

export default App;