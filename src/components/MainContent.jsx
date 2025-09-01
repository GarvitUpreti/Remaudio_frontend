// src/components/MainContent.jsx
import React from 'react';
import SongListItem from './SongListItem';

const MainContent = ({ songs }) => {
  return (
    <main className="flex-1 p-3 sm:p-4 lg:p-6 bg-primary-bg pb-20 sm:pb-24 lg:pb-28"> {/* Responsive padding for player */}
      {/* Table-like header - Hidden on mobile, visible on larger screens */}
      <div className="hidden sm:grid sm:grid-cols-[40px_3fr_2fr_80px_80px] lg:grid-cols-[50px_4fr_3fr_100px_100px] gap-2 sm:gap-4 py-2 sm:py-3 border-b border-border-color mb-3 sm:mb-4 font-bold text-xs sm:text-sm uppercase text-secondary-text">
        <span className="text-center">#</span>
        <span>Title</span>
        <span className="hidden md:block">Album</span>
        <span className="text-right">Duration</span>
        <span className="text-center"></span> {/* Empty for actions column */}
      </div>

      {/* Mobile header - Only visible on mobile */}
      <div className="sm:hidden mb-4 px-2">
        <h2 className="text-lg font-bold text-white mb-1">Your Music</h2>
        <p className="text-sm text-secondary-text">
          {songs.length} song{songs.length !== 1 ? 's' : ''} in your library
        </p>
      </div>

      {/* The actual list of songs */}
      <div className="song-list space-y-1 sm:space-y-0">
        {songs && songs.length > 0 ? (
          songs.map((song, index) => (
            <SongListItem key={song.id} song={song} index={index} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 text-center">
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-4 opacity-50">🎵</div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-2">
              No songs in your library
            </h3>
            <p className="text-sm sm:text-base text-secondary-text max-w-md px-4">
              Upload your first song to start building your music collection
            </p>
          </div>
        )}
        
        {/* Bottom padding to prevent overlap with player */}
        <div className="h-8 sm:h-12 lg:h-16"></div>
      </div>
    </main>
  );
};

export default MainContent;