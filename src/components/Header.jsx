import React from 'react';
import { useSelector } from "react-redux";
import logo from '../assets/remaudio_logo.png';

const Header = ({ isSidebarOpen, setIsSidebarOpen }) => {

  const user = useSelector((state) => state.user.user);
  console.log("User in Header:", user);
  console.log(user?.profilePic)
  
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
          <img src={logo} className="w-14 h-14 object-cover -mr-2" alt="" />
          <span className="text-3xl mt-1 font-bold text-blue-500">emaudio</span>
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

        {user && user.profilePic ? (
          <img
            key={user.profilePic}
            src={user.profilePic}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              console.log("Image failed to load:", user.profilePic);
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2RjEiLz4KPHRleHQgeD0iMjAiIHk9IjI1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsIj5VPC90ZXh0Pgo8L3N2Zz4=';
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;