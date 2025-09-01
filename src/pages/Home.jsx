import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector} from "react-redux";

const Home = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <div className="px-4 py-6 sm:p-6 min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Hero Section */}
      <div className="text-center mb-8 sm:mb-12 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3 sm:mb-4 animate-pulse-slow px-2">
          Welcome to Remaudio
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 animate-slide-up px-4">
          Your personal music streaming experience
        </p>
        <div className="mt-4 sm:mt-6">
          <div className="inline-block animate-bounce">
            <div className="text-2xl sm:text-4xl">🎵</div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        <div 
          onClick={() => handleCardClick('/songs')}
          className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300 animate-slide-in-left border border-gray-700 hover:border-purple-500 cursor-pointer"
        >
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:animate-pulse">🎼</div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-purple-400 transition-colors">Your Music</h3>
          <p className="text-sm sm:text-base text-gray-400 group-hover:text-gray-300 transition-colors">Listen to your uploaded songs and discover your favorites</p>
          <div className="mt-3 sm:mt-4 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"></div>
        </div>
        
        <div 
          onClick={() => handleCardClick('/playlists')}
          className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 animate-slide-in-up border border-gray-700 hover:border-blue-500 cursor-pointer"
        >
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:animate-pulse">📚</div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-blue-400 transition-colors">Playlists</h3>
          <p className="text-sm sm:text-base text-gray-400 group-hover:text-gray-300 transition-colors">Create and manage your custom playlists for every mood</p>
          <div className="mt-3 sm:mt-4 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"></div>
        </div>
        
        <div 
          onClick={() => handleCardClick('/upload')}
          className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 animate-slide-in-right border border-gray-700 hover:border-green-500 cursor-pointer sm:col-span-2 lg:col-span-1"
        >
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 group-hover:animate-pulse">⬆️</div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-green-400 transition-colors">Upload</h3>
          <p className="text-sm sm:text-base text-gray-400 group-hover:text-gray-300 transition-colors">Add new songs to your library and expand your collection</p>
          <div className="mt-3 sm:mt-4 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"></div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-gray-700 animate-fade-in-up">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 sm:mb-8">Your Music Journey</h2>
        <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
          <div className="animate-counter">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-400 mb-1 sm:mb-2">{user?.songs?.length || 0}</div>
            <div className="text-xs sm:text-sm lg:text-base text-gray-300">Current Songs</div>
          </div>
          <div className="animate-counter" style={{animationDelay: '0.2s'}}>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400 mb-1 sm:mb-2">{user?.playlists?.length || 0}</div>
            <div className="text-xs sm:text-sm lg:text-base text-gray-300">Current Playlists</div>
          </div>
          <div className="animate-counter" style={{animationDelay: '0.4s'}}>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-400 mb-1 sm:mb-2">0</div>
            <div className="text-xs sm:text-sm lg:text-base text-gray-300">Hours Listened</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes counter {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-slide-up { animation: slide-up 1s ease-out 0.2s both; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out; }
        .animate-slide-in-up { animation: slide-in-up 0.8s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out 0.6s both; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-counter { animation: counter 0.8s ease-out both; }
      `}</style>
    </div>
  );
};

export default Home;