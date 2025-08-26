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

  dispatch(setSongs(songlist))

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
      <div className="p-6 flex justify-center items-center">
        <div className="text-white">Loading songs...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Your Songs</h1>
        <div className="text-gray-400 text-sm">
          {reduxSongs.length} {reduxSongs.length === 1 ? 'song' : 'songs'}
        </div>
      </div>

      {reduxSongs.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-600 mb-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <p className="text-xl mb-4">No songs found</p>
          <p>Upload some songs to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reduxSongs.map((song) => (
            <Song
              key={song.id}
              song={song}
              onPlay={handlePlaySong}
              isCurrentSong={currentSong?.id === song.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Songs;