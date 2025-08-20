// src/components/MainContent.jsx
import React from 'react';
import SongListItem from './SongListItem';

const MainContent = ({ songs }) => {
  return (
    <main className="flex-1 p-5 bg-primary-bg pb-player-h"> {/* pb-player-h for padding at bottom */}
      {/* Table-like header for the song list */}
      <div className="grid grid-cols-[40px_3fr_2fr_80px_80px] gap-4 py-2 border-b border-border-color mb-3 font-bold text-sm uppercase text-secondary-text">
        <span className="text-center">#</span>
        <span>Title</span>
        <span>Album</span>
        <span className="text-right">Duration</span>
        <span className="text-center"></span> {/* Empty for actions column */}
      </div>

      {/* The actual list of songs */}
      <div className="song-list">
        {songs.map(song => (
          <SongListItem key={song.id} song={song} />
        ))}
        {/* Add a little padding at the bottom so the last song isn't hidden by the player controls */}
        <div className="h-20"></div> {/* Adjust height as needed */}
      </div>
    </main>
  );
};

export default MainContent;