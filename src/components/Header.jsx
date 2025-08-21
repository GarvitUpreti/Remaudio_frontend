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
          <img src={logo} className="w-14 h-14 object-cover" alt="" />
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

        {user?.profilePic && (
          <img
            src={user.profilePic}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
      </div>
    </header>
  );
};

export default Header;