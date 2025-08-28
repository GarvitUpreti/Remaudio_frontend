import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/userSlice';

const Sidebar = ({ isOpen }) => { // ✅ Remove setIsAuthenticated and setUser props
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Songs', path: '/songs' },
    { name: 'Playlists', path: '/playlists' },
    { name: 'Upload Songs', path: '/upload' },
    { name: 'Multiplay', path: '/multiplay' },
  ];

  const handleLogout = () => {
    console.log('Logout clicked');
    
    // Clear all localStorage items
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    console.log('LocalStorage cleared');
    
    // ✅ Only dispatch to Redux - this will trigger App component re-render
    dispatch(logout());
    console.log('Logout dispatched to Redux');
  };

  return (
    <aside className={`bg-gray-900 w-64 border-r border-gray-700 ${
      isOpen ? 'block' : 'hidden'
    } md:block`}>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.name}
          </button>
        ))}
        
        <div className="border-t border-gray-700 pt-4 mt-4">
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Logout
          </button>
          
          <button
            onClick={() => navigate('/developer')}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              location.pathname === '/developer'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            Developer's Note
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;