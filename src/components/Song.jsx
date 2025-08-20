import React from "react";

const Song = ({ song, onPlay }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDisplayArtist = (artist) => {
    return artist === "Unknown Artist" ? "Unknown" : artist;
  };

  return (
    <div
      className="bg-gray-900 p-4 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-between"
      onClick={() => onPlay(song)}
    >
      <div className="flex items-center space-x-4">
        {/* Cover Image or Placeholder */}
        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
          {song.coverImgURL ? (
            <img
              src={song.coverImgURL}
              alt={song.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <svg
              className="w-6 h-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
        </div>

        {/* Song Info */}
        <div>
          <h3 className="text-white font-medium">
            {song.name.replace('.mp3', '')}
          </h3>
          <p className="text-gray-400 text-sm">
            {getDisplayArtist(song.artist)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Date Added */}
        <span className="text-gray-400 text-sm">
          {song.duration}
        </span>
        
        {/* Play Button */}
        <button 
          className="text-blue-400 hover:text-blue-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(song);
          }}
        >
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Song;