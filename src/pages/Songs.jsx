import React, { useState, useEffect } from "react";
import Song from "../components/Song";
import { useSelector, useDispatch } from "react-redux";
import { setSongs, setCurrentSong, setIsPlaying } from "../store/musicSlice";

const Songs = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  
  // Get data from Redux store
  const songlist = useSelector((state) => state.songs.list); 
  const { songs: reduxSongs, currentSong } = useSelector((state) => state.music);

  // Update Redux store when user songs change
  useEffect(() => {
    if (songlist) {
      dispatch(setSongs(songlist));
    } else {
      dispatch(setSongs([]));
    }
    setLoading(false);
  }, [songlist, dispatch]);

  const handlePlaySong = (song) => {
    // Set the current song in Redux
    dispatch(setCurrentSong(song));
    // Start playing
    dispatch(setIsPlaying(true));
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:p-6 flex justify-center items-center min-h-screen">
        <div className="text-white text-lg">Loading songs...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:p-6 pb-24 sm:pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Songs</h1>
        <div className="text-gray-400 text-sm bg-gray-800 px-3 py-1 rounded-full">
          {reduxSongs.length} {reduxSongs.length === 1 ? 'song' : 'songs'}
        </div>
      </div>

      {reduxSongs.length === 0 ? (
        <div className="text-center text-gray-400 mt-12 px-4">
          <div className="mb-4">
            <svg
              className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-600 mb-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <p className="text-lg sm:text-xl mb-4">No songs found</p>
          <p className="text-sm sm:text-base">Upload some songs to get started!</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {reduxSongs.map((song, index) => (
            <div 
              key={song.id}
              className={`transform transition-all duration-200 ${
                currentSong?.id === song.id ? 'scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
            >
              <Song
                song={song}
                onPlay={handlePlaySong}
                isCurrentSong={currentSong?.id === song.id}
                index={index}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Add some bottom padding for mobile to account for potential bottom navigation */}
      <div className="h-8 sm:h-0"></div>
    </div>
  );
};

export default Songs;