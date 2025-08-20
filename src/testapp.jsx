import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from './assets/remaudio_logo.png'; // ✅ correct
import { useDispatch } from "react-redux";
import { setUser } from "./store/userSlice";


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
import image from './assets/image.png';



const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
      const dispatch = useDispatch();


  useEffect(() => {
    // Check for existing token on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');
    const userEmail = localStorage.getItem('userEmail');
    

    // Add a minimum loading time for better UX (optional)
    const minimumLoadTime = new Promise(resolve => setTimeout(resolve, 2000));


    if (!token || !userEmail) {
      // No token or email, user needs to authenticate
      await minimumLoadTime;
      setLoading(false);
      setIsAuthenticated(false);
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


      if (response.status === 200) {
        const userData = response.data;
        setUser(userData);
        setIsAuthenticated(true);
        console.log('User data loaded:', userData);
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userEmail');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
      setIsAuthenticated(false);
    } finally {
      // Wait for minimum load time before hiding loading screen
      await minimumLoadTime;
      setLoading(false);
    }
  };

  // Loading Screen Component
  const LoadingScreen = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-800 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div>
          <div className="relative">
            {/* Logo Background Circle */}
            <div className="w-60 h-60 mx-auto rounded-full flex items-center justify-center shadow-2xl">
              {/* Logo - You can replace this with your actual logo */}
              <div className="relative w-40 h-40">
                <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
            
            {/* Animated Rings */}
            <div className="mb-8 animate-pulse absolute inset-0 w-60 h-60 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-300 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-2 border-2 border-white rounded-full animate-ping opacity-50" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-wide">
            Welcome to <span className="text-blue-300">Remaudio</span>
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-blue-200 text-lg">Loading your experience...</p>
        </div>
      </div>
    </div>
  );

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Show auth page if not authenticated
  if (isAuthenticated === false) {
    
    return <Auth3 setIsAuthenticated={setIsAuthenticated} setUser={setUser} />;
  }

  // Show main app if authenticated
  
  
  return (
    <Router>
      <div className="h-screen bg-gray-900 text-white flex flex-col">
        <MainLayout
          user={user}
          setIsAuthenticated={setIsAuthenticated}
          setUser={setUser}
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
  setIsAuthenticated,
  setUser,
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
        user={user}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsAuthenticated={setIsAuthenticated}
          setUser={setUser}
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
            <Route path="/playlists" element={<Playlists playlists={user?.playlists || []} />} />
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