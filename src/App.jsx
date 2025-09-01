import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { logout, setUser } from "./store/userSlice";
import { setPlaylists } from "./store/playlistSlice";
import { setSongs } from "./store/songSlice";

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

const MultiplayProvider = ({ children }) => {
  useHostMultiplay();
  useFollowerMultiplay();
  
  return (
    <>
      {children}
      <MultiplayStatus />
    </>
  );
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userEmail = localStorage.getItem("userEmail");

    if (!token || !userEmail) {
      dispatch(logout());
      setLoading(false);
      return;
    }

    const restoreSession = async () => {
      try {
        // ✅ Fetch user
        const userRes = await axios.get(`${API_URL}/user/email/${userEmail}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userId = userRes.data.id;
        localStorage.setItem("userId", userId);

        // ✅ Fetch songs + playlists in parallel
        const [songsRes, playlistsRes] = await Promise.all([
          axios.get(`${API_URL}/songs/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/playlists/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // ✅ Dispatch everything to Redux
        dispatch(setUser(userRes.data));
        dispatch(setSongs(songsRes.data));
        dispatch(setPlaylists(playlistsRes.data));

      } catch (err) {
        console.error("❌ Failed to restore session:", err);
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [dispatch, API_URL]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Auth3 />;
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <MultiplayProvider>
        <MainLayout />
      </MultiplayProvider>
    </div>
  );
};

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentSong } = useSelector(state => state.music);

  // Close sidebar when clicking outside on mobile
  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) { // md breakpoint
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Header - Fixed at top */}
      <Header 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Mobile overlay for sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main content */}
        <main 
          className={`flex-1 bg-gray-800 overflow-y-auto transition-all duration-300 ${
            currentSong ? 'pb-20 sm:pb-24 md:pb-20' : 'pb-4'
          }`}
          onClick={closeSidebarOnMobile}
        >
          <div className="min-h-full">
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
          </div>
        </main>
      </div>

      {/* Music Player - Fixed at bottom */}
      <MusicPlayer />
    </>
  );
};

export default App;