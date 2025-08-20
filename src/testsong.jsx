import React, { useState, useEffect } from "react";
import Song from "../components/Song";
import { useSelector } from "react-redux";

const Songs = ({setCurrentSong }) => {
  const [localSongs, setLocalSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  //  Song

    const user = useSelector((state) => state.user.user);


    // whenever songs prop changes, update local state 
    useEffect(() => {
    if (user?.songs) {
      setLocalSongs(user.songs);
    } else {
      setLocalSongs([]);
    }
    setLoading(false);
    }, [user]); // ✅ Run whenever user changes

  const handlePlaySong = (song) => {
    setCurrentSong(song);
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
          {localSongs.length} {localSongs.length === 1 ? 'song' : 'songs'}
        </div>
      </div>

      {localSongs.length === 0 ? (
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
          {localSongs.map((song) => (
            <Song
              key={song.id}
              song={song}
              onPlay={handlePlaySong}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Songs;