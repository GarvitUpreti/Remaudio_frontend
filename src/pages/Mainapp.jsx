// src/App.js
import React from 'react';
// import './App.css'; // No longer needed if using Tailwind purely for styling

// Import components
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import MusicPlayerControls from '../components/MusicPlayerControls';
import MainContent from '../components/MainContent';

function Mainapp() {
  // Dummy data for songs (you would fetch this from an API in a real app)
  const songsData = [
    { id: 1, title: 'Summer Breeze', artist: 'The Chillers', album: 'Relaxation Station', duration: '3:45' },
    { id: 2, title: 'City Lights', artist: 'Urban Beats', album: 'Night Groove', duration: '4:10' },
    { id: 3, title: 'Forest Whisper', artist: 'Nature Sounds Co.', album: 'Meditative Journeys', duration: '2:59' },
    { id: 4, title: 'Electric Dreams', artist: 'Synthwave Duo', album: 'Neon Vibes', duration: '5:02' },
    { id: 5, title: 'Rainy Day Blues', artist: 'Blues Brothers', album: 'Midnight Groove', duration: '3:20' },
    { id: 6, title: 'Starlight Serenade', artist: 'Cosmic Echoes', album: 'Celestial Sounds', duration: '4:55' },
    { id: 7, title: 'Urban Pulse', artist: 'Beatniks', album: 'Concrete Jungle', duration: '3:15' },
    { id: 8, title: 'Echoes of Time', artist: 'Ancient Rhythms', album: 'Forgotten Melodies', duration: '4:30' },
    { id: 9, title: 'Whispering Wind', artist: 'Ambient Harmonies', album: 'Quiet Moments', duration: '2:40' },
    { id: 10, title: 'Digital Heartbeat', artist: 'Cybernetic Symphony', album: 'Future Grooves', duration: '3:50' },
    { id: 11, title: 'Morning Dew', artist: 'Morning Glories', album: 'Awakenings', duration: '3:05' },
    { id: 12, title: 'Cosmic Drift', artist: 'Star Sailors', album: 'Galactic Journeys', duration: '5:15' },
    { id: 13, title: 'Rooftop Serenity', artist: 'Cityscapes', album: 'Urban Escapes', duration: '4:00' },
    { id: 14, title: 'Desert Bloom', artist: 'Arid Lands', album: 'Oasis Echoes', duration: '3:30' },
    { id: 15, title: 'Deep Ocean Dive', artist: 'Aqua Dreams', album: 'Underwater Worlds', duration: '6:00' },
  ];


  return (
    <div className="h-screen w-screen flex overflow-hidden bg-primary-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <MainContent songs={songsData} /> {/* Pass song data to MainContent */}
        <MusicPlayerControls />
      </div>
    </div>
  );
}

export default Mainapp;