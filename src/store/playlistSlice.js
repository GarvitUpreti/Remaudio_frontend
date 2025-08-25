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
    updatePlaylist: (state, action) => {
      const { playlistId, updatedPlaylist } = action.payload;
      const index = state.list.findIndex(p => p.id === playlistId);
      if (index !== -1) {
        state.list[index] = updatedPlaylist;
      }
      // Also update selected playlist if it's the one being updated
      if (state.selected && state.selected.id === playlistId) {
        state.selected = updatedPlaylist;
      }
    },
    setSelectedPlaylist: (state, action) => {
      state.selected = action.payload;
    },
  },
});

export const { 
  setPlaylists, 
  addPlaylist, 
  removePlaylist, 
  updatePlaylist,
  setSelectedPlaylist 
} = playlistSlice.actions;

export default playlistSlice.reducer;