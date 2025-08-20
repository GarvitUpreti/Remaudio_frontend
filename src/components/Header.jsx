import React from 'react';

const Header = ({ user, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden mr-4 text-white"
        >
          <div className="space-y-1">
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </div>
        </button>
        
        <div className="flex items-center">
          <span className="text-2xl font-bold text-white mr-1">R</span>
          <span className="text-2xl font-bold text-blue-500">emaudio</span>
        </div>
      </div>

      <div className="flex items-center">
        <button className="md:hidden mr-4 text-white">
          <div className="space-y-1">
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </div>
        </button>
        
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
          {user?.name?.charAt(0).toUpperCase() || 'M'}
        </div>
      </div>
    </header>
  );
};

export default Header;