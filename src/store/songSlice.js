import { createSlice } from "@reduxjs/toolkit";

const defaultSong = {
  id: 2,
  name: "Bye Bye Bye - Default Song, it will be removed as soon as you add your first song",
  audioURL: "https://res.cloudinary.com/dxkalcupm/video/upload/v1760184239/remaudio/songs/file_n70wnh.mp3",
  cloudinary_public_id: "remaudio/songs/file_n70wnh",
  artist: "Unknown Artist",
  createdAt: new Date(),
  updatedAt: new Date(),
  coverImgURL: null,
  duration: "3:20",
  playlists: [],
  user: null,
};

const songSlice = createSlice({
  name: "songs",
  initialState: {
    list: [defaultSong], // start with default
    current: null,
  },
  reducers: {
    setSongs: (state, action) => {
      let songs = action.payload || [];

      // If real songs exist, remove default
      const hasRealSongs = songs.some(song => song.id !== defaultSong.id);
      if (hasRealSongs) {
        songs = songs.filter(song => song.id !== defaultSong.id);
      }

      // If list is empty after filtering, keep default
      if (songs.length === 0) {
        state.list = [defaultSong];
      } else {
        state.list = songs;
      }
    },

    addSong: (state, action) => {
      const newSong = action.payload;

      // Remove default if it exists
      state.list = state.list.filter(song => song.id !== defaultSong.id);

      state.list.push(newSong);
    },

    removeSong: (state, action) => {
      state.list = state.list.filter(s => s.id !== action.payload);

      // If list is empty after removing, add default
      if (state.list.length === 0) {
        state.list = [defaultSong];
      }
    },

    setCurrentSong: (state, action) => {
      state.current = action.payload;
    },
  },
});

export const { setSongs, addSong, removeSong, setCurrentSong } = songSlice.actions;
export default songSlice.reducer;
