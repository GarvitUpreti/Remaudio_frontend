// store/musicSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  songs: [], // Array of song objects
  currentSong: null, // Current song object
  currentVolume: 0.7, // Volume level (0-1)
  currentlyPlayingOn: 0, // Current time in seconds
  isPlaying: false, // Is currently playing
  repeatMode: 'none', // 'none', 'all', 'one'
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setSongs: (state, action) => {
      state.songs = action.payload;
    },
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload;
      state.currentlyPlayingOn = 0; // Reset time when changing song
    },
    setCurrentVolume: (state, action) => {
      state.currentVolume = action.payload;
    },
    setCurrentlyPlayingOn: (state, action) => {
      state.currentlyPlayingOn = action.payload;
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setRepeatMode: (state, action) => {
      state.repeatMode = action.payload;
    },
    playNextSong: (state) => {
      if (!state.currentSong || state.songs.length === 0) return;
      
      const currentIndex = state.songs.findIndex(song => song.id === state.currentSong.id);
      if (currentIndex === -1) return;
      
      let nextIndex;
      if (state.repeatMode === 'one') {
        // Stay on the same song
        nextIndex = currentIndex;
      } else if (state.repeatMode === 'all') {
        // Loop to beginning if at end
        nextIndex = currentIndex === state.songs.length - 1 ? 0 : currentIndex + 1;
      } else {
        // No repeat - stop at end
        nextIndex = currentIndex === state.songs.length - 1 ? currentIndex : currentIndex + 1;
        if (nextIndex === currentIndex && currentIndex === state.songs.length - 1) {
          state.isPlaying = false;
          return;
        }
      }
      
      state.currentSong = state.songs[nextIndex];
      state.currentlyPlayingOn = 0;
    },
    playPreviousSong: (state) => {
      if (!state.currentSong || state.songs.length === 0) return;
      
      const currentIndex = state.songs.findIndex(song => song.id === state.currentSong.id);
      if (currentIndex === -1) return;
      
      const prevIndex = currentIndex === 0 ? state.songs.length - 1 : currentIndex - 1;
      state.currentSong = state.songs[prevIndex];
      state.currentlyPlayingOn = 0;
    },
  },
});

export const {
  setSongs,
  setCurrentSong,
  setCurrentVolume,
  setCurrentlyPlayingOn,
  setIsPlaying,
  setRepeatMode,
  playNextSong,
  playPreviousSong,
} = musicSlice.actions;

export default musicSlice.reducer;