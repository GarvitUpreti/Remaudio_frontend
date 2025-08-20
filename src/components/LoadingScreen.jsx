import React from 'react'
import logo from '../assets/remaudio_logo.png'; // ✅ correct

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

export default LoadingScreen