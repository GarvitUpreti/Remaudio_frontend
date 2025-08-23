// store/playlistSlice.js
import { createSlice } from "@reduxjs/toolkit";

const playlistSlice = createSlice({
  name: "playlists",
  initialState: {
    list: [], // all user playlists
    selected: null, // active playlist
  },
  reducers: {
    setPlaylists: (state, action) => {
      state.list = action.payload;
    },
    addPlaylist: (state, action) => {
      state.list.push(action.payload);
    },
    removePlaylist: (state, action) => {
      state.list = state.list.filter(p => p.id !== action.payload);
    },
    setSelectedPlaylist: (state, action) => {
      state.selected = action.payload;
    },
  },
});

export const { setPlaylists, addPlaylist, removePlaylist, setSelectedPlaylist } = playlistSlice.actions;
export default playlistSlice.reducer;
