// Update your Sidebar component to handle mobile better
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = ({ isOpen, onClose }) => {
  const { currentSong } = useSelector(state => state.music);

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/songs', icon: '🎵', label: 'Songs' },
    { path: '/playlists', icon: '📚', label: 'Playlists' },
    { path: '/upload', icon: '⬆️', label: 'Upload' },
    { path: '/multiplay', icon: '👥', label: 'Multiplay' },
    { path: '/userProfile', icon: '👤', label: 'Profile' },
    { path: '/developer', icon: '🛠️', label: 'Developer' },
  ];

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 sm:w-72 md:w-64
        bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
        border-r border-gray-600 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${currentSong ? 'bottom-20 sm:bottom-24 md:bottom-20' : 'bottom-0'}
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Navigation
            </h2>
            <button
              onClick={onClose}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700 hover:transform hover:scale-102'
                    }`
                  }
                >
                  <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span className="font-medium text-sm sm:text-base">
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-600">
          <div className="text-center text-gray-400 text-xs sm:text-sm">
            <p>Remaudio v1.0.0</p>
            <p className="mt-1">© {new Date().getFullYear()}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;