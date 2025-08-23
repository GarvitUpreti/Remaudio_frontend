// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import playlistReducer from "./playlistSlice";
import songReducer from "./songSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    playlists: playlistReducer,
    songs: songReducer,
  },
});
