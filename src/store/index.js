// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import playlistReducer from "./playlistSlice";
import songReducer from "./songSlice";
import musicReducer from "./musicSlice";

export const store = configureStore({
  reducer: {
    music: musicReducer,
    user: userReducer,
    playlists: playlistReducer,
    songs: songReducer,
  },
});
