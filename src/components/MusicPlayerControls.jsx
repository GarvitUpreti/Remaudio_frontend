// src/components/MusicPlayerControls.jsx
import React from 'react';
import { FaMusic, FaBackward, FaPlay, FaForward, FaVolumeUp } from 'react-icons/fa';

const MusicPlayerControls = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full h-player-h bg-player-bg z-50">
    <footer className="h-player-h bg-secondary-bg border-t border-border-color p-4 flex flex-col justify-center shadow-lg z-10">
      <div className="flex items-center space-x-2 mb-2">
        <span className="text-sm text-secondary-text">2:15</span>
        <input
          type="range"
          className="flex-grow w-full h-1 bg-border-color rounded-full appearance-none cursor-pointer
                     /* Custom styling for Webkit (Chrome, Safari) */
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-accent
                     [&::-webkit-slider-thumb]:cursor-pointer
                     /* Custom styling for Mozilla Firefox */
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-accent
                     [&::-moz-range-thumb]:cursor-pointer"
          min="0"
          max="100"
          value="50"
        />
        <span className="text-sm text-secondary-text">4:35</span>
      </div>
      <div className="flex items-center justify-between">
        <FaMusic className="text-xl text-accent mr-4" />
        <div className="flex flex-col mr-auto min-w-[150px]">
          <span className="font-bold text-primary-text truncate">Song Name</span>
          <span className="text-sm text-secondary-text truncate">artist name</span>
        </div>
        <div className="flex items-center space-x-5 mr-12">
          <FaBackward className="text-2xl text-primary-text cursor-pointer transition-colors duration-200 hover:text-accent" />
          <FaPlay className="text-3xl text-accent cursor-pointer transition-colors duration-200 hover:text-primary-text" /> {/* Could be FaPause if playing */}
          <FaForward className="text-2xl text-primary-text cursor-pointer transition-colors duration-200 hover:text-accent" />
        </div>
        <div className="flex items-center space-x-2 w-36">
          <FaVolumeUp className="text-xl text-secondary-text" />
          <input
            type="range"
            className="w-full h-1 bg-border-color rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-3
                       [&::-webkit-slider-thumb]:h-3
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:bg-accent
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-moz-range-thumb]:w-3
                       [&::-moz-range-thumb]:h-3
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-accent
                       [&::-moz-range-thumb]:cursor-pointer"
            min="0"
            max="100"
            value="70"
          />
        </div>
      </div>
    </footer>
    </div>
  );
};

export default MusicPlayerControls;