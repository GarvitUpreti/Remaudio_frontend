// src/components/SongListItem.jsx
import React from 'react';
import { FaPlayCircle, FaEllipsisH } from 'react-icons/fa';

const SongListItem = ({ song }) => {
  return (
    <div className="grid grid-cols-[40px_3fr_2fr_80px_80px] gap-4 py-2 border-b border-light-border items-center transition-colors duration-200 cursor-pointer hover:bg-tertiary-bg">
      <div className="flex items-center pl-2">
        <span className="text-secondary-text mr-4 text-center w-5">{song.id}.</span>
        <div className="flex flex-col">
          <div className="font-bold text-primary-text truncate">{song.title}</div>
          <div className="text-sm text-secondary-text truncate">{song.artist}</div>
        </div>
      </div>
      <div className="text-secondary-text text-sm truncate">{song.album}</div>
      <div className="text-right text-secondary-text text-sm">{song.duration}</div>
      <div className="flex justify-center space-x-4">
        <FaPlayCircle className="text-xl text-secondary-text cursor-pointer transition-colors duration-200 hover:text-accent" title="Play Song" />
        <FaEllipsisH className="text-xl text-secondary-text cursor-pointer transition-colors duration-200 hover:text-accent" title="More Options" />
      </div>
    </div>
  );
};

export default SongListItem;