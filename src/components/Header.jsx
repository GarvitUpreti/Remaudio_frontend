import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux"; // Add useDispatch here
import logo from '../assets/remaudio_logo.png';
import { useNavigate } from "react-router-dom";
import { logout, setUser } from "../store/userSlice";

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const user = useSelector((state) => state.user.user);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Add this line

  const handleSignOut = () => {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');

    // Close dropdown
    setProfileMenuOpen(false);

    // Navigate to login or home
    dispatch(logout())
  };
  const openProfile = () => {
    navigate('/userProfile');
    setProfileMenuOpen(false);
  }

  const handleHelpSupport = () => {
    const supportEmail = import.meta.env.VITE_SUPPORT_GMAIL || 'support@remaudio.com';

    const subject = 'Support Request - Remaudio';
    const body = `Hello Remaudio Support Team,

I need assistance with:

issue: 

Best regards,
${user?.name || 'User name'}
${user?.email || ''}`;

    // Close dropdown
    setProfileMenuOpen(false);

    // Create Gmail URL and open directly
    const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(supportEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open Gmail directly in new tab
    window.open(gmailUrl, '_blank');
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-600 shadow-lg backdrop-blur-sm z-50">
      <div className="px-4 sm:px-6 py-2 flex items-center justify-between">
        {/* Left Section - Logo and Menu Button */}
        <div className="flex items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden mr-3 sm:mr-4 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            <div className="space-y-1.5">
              <div className={`w-5 sm:w-6 h-0.5 bg-current transition-all duration-300 ${isSidebarOpen ? "rotate-45 translate-y-2" : ""}`}>         </div>
              <div className={`w-5 sm:w-6 h-0.5 bg-current transition-all duration-300 ${isSidebarOpen ? "opacity-0" : ""}`}></div>
              <div className={`w-5 sm:w-6 h-0.5 bg-current transition-all duration-300 ${isSidebarOpen ? "-rotate-45 -translate-y-2" : ""}`}></div>
            </div>
          </button>

          <div className="flex items-center group cursor-pointer">
            <div className="relative">
              <img
                src={logo}
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-cover drop-shadow-lg group-hover:scale-105 transition-transform duration-200"
                alt="Remaudio Logo"
              />
              <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-200"></div>
            </div>
            <span className="text-xl sm:text-2xl md:text-3xl -ml-1 sm:-ml-2 mt-0.5 sm:mt-1 font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-blue-500 transition-all duration-200">
              emaudio
            </span>
          </div>
        </div>

        {/* Right Section - User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Profile Section */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-gray-700 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs sm:text-sm font-medium text-white group-hover:text-blue-400 transition-colors duration-200 truncate max-w-24 sm:max-w-none">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200 truncate max-w-24 sm:max-w-none">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>

                <div className="relative">
                  {user && user.profilePic ? (
                    <img
                      key={user.profilePic}
                      src={user.profilePic}
                      alt="profile"
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-blue-500 transition-all duration-200 shadow-lg"
                      onError={(e) => {
                        console.log("Image failed to load:", user.profilePic);
                        const firstLetter = user?.name?.charAt(0)?.toUpperCase() || 'U';
                        const svgString = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#6366F1"/>
    <text x="20" y="25" text-anchor="middle" fill="white" font-size="16" font-family="Arial">${firstLetter}</text>
  </svg>`;
                        e.target.src = 'data:image/svg+xml;base64,' + btoa(svgString);
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-gray-600 group-hover:border-blue-400 transition-all duration-200 shadow-lg">
                      <span className="text-white text-xs sm:text-sm font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}

                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-gray-800 rounded-full"></div>
                </div>
              </div>

              {/* Dropdown arrow */}
              <svg
                className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-blue-400 transition-all duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <>
                {/* Mobile backdrop overlay */}
                <div
                  className="fixed inset-0 bg-black bg-opacity-20 z-[100] md:hidden"
                  onClick={() => setProfileMenuOpen(false)}
                ></div>

                <div className="absolute right-0 top-12 sm:top-16 w-72 sm:w-64 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-[101] overflow-hidden">
                  {/* Profile Header */}
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {user && user.profilePic ? (
                          <img
                            key={user.profilePic}
                            src={user.profilePic}
                            alt="profile"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-blue-500 transition-all duration-200 shadow-lg"
                            onError={(e) => {
                              console.log("Image failed to load:", user.profilePic);
                              const firstLetter = user?.name?.charAt(0)?.toUpperCase() || 'U';
                              const svgString = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#6366F1"/>
    <text x="20" y="25" text-anchor="middle" fill="white" font-size="16" font-family="Arial">${firstLetter}</text>
  </svg>`;
                              e.target.src = 'data:image/svg+xml;base64,' + btoa(svgString);
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-gray-600 group-hover:border-blue-400 transition-all duration-200 shadow-lg">
                            <span className="text-white text-xs sm:text-sm font-bold">
                              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-blue-700 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">{user?.name || 'User'}</p>
                        <p className="text-blue-100 text-xs sm:text-sm truncate">{user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => openProfile('/userProfile')}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile Settings</span>
                    </button>

                    <button
                      onClick={handleHelpSupport}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Help & Support</span>
                    </button>

                    <hr className="my-2 border-gray-600" />

                    <button
                      onClick={handleSignOut}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-3 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;