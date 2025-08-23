// store/songSlice.js
import { createSlice } from "@reduxjs/toolkit";

const songSlice = createSlice({
  name: "songs",
  initialState: {
    list: [], // all songs for the user
    current: null, // currently playing song
  },
  reducers: {
    setSongs: (state, action) => {
      state.list = action.payload;
    },
    addSong: (state, action) => {
      state.list.push(action.payload);
    },
    removeSong: (state, action) => {
      state.list = state.list.filter(s => s.id !== action.payload);
    },
    setCurrentSong: (state, action) => {
      state.current = action.payload;
    },
  },
});

export const { setSongs, addSong, removeSong, setCurrentSong } = songSlice.actions;
export default songSlice.reducer;
