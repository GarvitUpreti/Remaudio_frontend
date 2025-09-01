// src/components/SongListItem.jsx
import React from 'react';
import { FaPlayCircle, FaEllipsisH } from 'react-icons/fa';

const SongListItem = ({ song, index }) => {
  return (
    <>
      {/* Mobile Layout */}
      <div className="block sm:hidden p-3 border-b border-light-border bg-tertiary-bg hover:bg-gray-800 transition-colors duration-200 cursor-pointer rounded-lg mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Song Number/Index */}
            <span className="text-secondary-text text-sm w-6 text-center flex-shrink-0">
              {index ? index + 1 : song.id}
            </span>
            
            {/* Song Info */}
            <div className="min-w-0 flex-1">
              <div className="font-bold text-primary-text text-sm truncate mb-0.5">
                {song.title}
              </div>
              <div className="text-xs text-secondary-text truncate">
                {song.artist}
              </div>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <span className="text-xs text-secondary-text">
              {song.duration}
            </span>
            <FaPlayCircle 
              className="text-lg text-secondary-text hover:text-accent transition-colors duration-200 cursor-pointer" 
              title="Play Song" 
            />
            <FaEllipsisH 
              className="text-base text-secondary-text hover:text-accent transition-colors duration-200 cursor-pointer" 
              title="More Options" 
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:grid sm:grid-cols-[40px_3fr_2fr_80px_80px] lg:grid-cols-[50px_4fr_3fr_100px_100px] gap-2 sm:gap-4 py-2 sm:py-3 border-b border-light-border items-center transition-colors duration-200 cursor-pointer hover:bg-tertiary-bg">
        {/* Track Number */}
        <div className="flex items-center justify-center">
          <span className="text-secondary-text text-sm sm:text-base text-center">
            {index !== undefined ? index + 1 : song.id}
          </span>
        </div>

        {/* Song Title & Artist */}
        <div className="flex flex-col min-w-0 pr-2">
          <div className="font-bold text-primary-text text-sm sm:text-base truncate">
            {song.title}
          </div>
          <div className="text-xs sm:text-sm text-secondary-text truncate">
            {song.artist}
          </div>
        </div>

        {/* Album - Hidden on smaller screens, shown on medium+ */}
        <div className="hidden md:block text-secondary-text text-xs sm:text-sm truncate">
          {song.album}
        </div>

        {/* Duration */}
        <div className="text-right text-secondary-text text-xs sm:text-sm">
          {song.duration}
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-2 sm:space-x-3 lg:space-x-4">
          <FaPlayCircle 
            className="text-base sm:text-lg lg:text-xl text-secondary-text cursor-pointer transition-colors duration-200 hover:text-accent" 
            title="Play Song" 
          />
          <FaEllipsisH 
            className="text-sm sm:text-base lg:text-lg text-secondary-text cursor-pointer transition-colors duration-200 hover:text-accent" 
            title="More Options" 
          />
        </div>
      </div>
    </>
  );
};

export default SongListItem;