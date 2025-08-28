import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // ✅ Remove BrowserRouter import
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { setUser, logout } from "./store/userSlice";
import { setPlaylists} from "./store/playlistSlice";
import { setSongs} from "./store/songSlice";
import { useHostMultiplay } from './hooks/useHostMultiplay';
import { useFollowerMultiplay } from './hooks/useFollowerMultiplay';

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
import UserProfile from './pages/UserProfile';
import Multiplay from './pages/Multiplay';
import MultiplayStatus from './components/MultiplayStatus';

// Multiplay hooks wrapper component
const MultiplayProvider = ({ children }) => {
  // Initialize multiplay hooks globally
  useHostMultiplay();
  useFollowerMultiplay();
  
  return (
    <>
      {children}
      {/* Global multiplay status that appears on all pages */}
      <MultiplayStatus />
    </>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');
    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');

    if (!token || !userEmail) {
      setTimeout(() => {
        setLoading(false);
        dispatch(logout());
      }, 2000);
      return;
    }

    try {
      // Fetch all data concurrently
      const [songsResponse, playlistsResponse, userResponse] = await Promise.all([
        axios.get(`${API_URL}/songs/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/playlists/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/user/email/${userEmail}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Dispatch all data
      dispatch(setSongs(songsResponse.data));
      dispatch(setPlaylists(playlistsResponse.data));
      dispatch(setUser(userResponse.data));
      
      console.log('All data loaded successfully');
      
    } catch (error) {
      console.error('Data loading failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      dispatch(logout());
    } finally {
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

  // Show main app if authenticated - ✅ Remove double Router and SocketProvider
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <MultiplayProvider>
        <MainLayout user={user} />
      </MultiplayProvider>
    </div>
  );
};

const MainLayout = ({ user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />

        <main className="flex-1 bg-gray-800 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/songs" element={<Songs />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/developer" element={<DeveloperNote />} />
            <Route path="/userProfile" element={<UserProfile />} />
            <Route path="/multiplay" element={<Multiplay />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      <MusicPlayer />
    </>
  );
};

export default App;