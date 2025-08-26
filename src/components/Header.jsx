import React, { useState } from 'react';
import { useSelector } from "react-redux";
import logo from '../assets/remaudio_logo.png';
import { useNavigate } from "react-router-dom";

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const user = useSelector((state) => state.user.user);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  console.log("User in Header:", user);
  console.log(user?.profilePic);

  const openProfile = (route) => {
    setProfileMenuOpen(false);
    navigate(route);

  };
  
  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-600 shadow-lg backdrop-blur-sm ">
      <div className="px-6 py-2 flex items-center justify-between">
        {/* Left Section - Logo and Menu Button */}
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden mr-4 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <div className="space-y-1.5">
              <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isSidebarOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-6 h-0.5 bg-current transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
            </div>
          </button>

          <div className="flex items-center group cursor-pointer">
            <div className="relative">
              <img 
                src={logo} 
                className="w-14 h-14 object-cover drop-shadow-lg group-hover:scale-105 transition-transform duration-200" 
                alt="Remaudio Logo" 
              />
              <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-200"></div>
            </div>
            <span className="text-5xl md:text-3xl -ml-2 mt-1 font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-blue-500 transition-all duration-200">
              emaudio
            </span>
          </div>
        </div>

        {/* Right Section - User Profile */}
        <div className="flex items-center space-x-4">
          {/*
           Search Icon (optional) 
          <button className="hidden md:flex p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

           Notifications Icon (optional) 
          <button className="hidden md:flex p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-6.5-6.5M15 17v-3a6 6 0 10-12 0v3m12 0H9m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </button>
          */}

          {/* Profile Section */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors duration-200">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                
                <div className="relative">
                  {user && user.profilePic ? (
                    <img
                      key={user.profilePic}
                      src={user.profilePic}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-blue-500 transition-all duration-200 shadow-lg"
                      onError={(e) => {
                        console.log("Image failed to load:", user.profilePic);
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHRleHQgeD0iMjAiIHk9IjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsIj5VPC90ZXh0Pgo8L3N2Zz4=';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-gray-600 group-hover:border-blue-400 transition-all duration-200 shadow-lg">
                      <span className="text-white text-sm font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                </div>
              </div>

              {/* Dropdown arrow */}
              <svg 
                className={`w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-all duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-16 w-64 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <p className="font-semibold">{user?.name || 'User'}</p>
                  <p className="text-blue-100 text-sm">{user?.email || 'user@example.com'}</p>
                </div>
                
                <div onClick={() => openProfile('/userProfile')} className="py-2">
                  <button className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile Settings</span>
                  </button>
                  
                  <button className="w-full px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Preferences</span>
                  </button>
                  
                  <hr className="my-2 border-gray-600" />
                  
                  <button className="w-full px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;