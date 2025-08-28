// store/musicSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  songs: [],
  currentSong: null,
  currentVolume: 0.7,
  currentlyPlayingOn: 0,
  isPlaying: false,
  repeatMode: 'none',
  // Multiplay state
  multiplay: {
    isActive: false,
    roomId: null,
    role: null, // 'host' | 'follower'
    isInMultiplayMode: false,
  }
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
      state.currentlyPlayingOn = 0;
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
        nextIndex = currentIndex;
      } else if (state.repeatMode === 'all') {
        nextIndex = currentIndex === state.songs.length - 1 ? 0 : currentIndex + 1;
      } else {
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
    
    // Multiplay reducers
    setMultiplayRoom: (state, action) => {
      state.multiplay.isActive = true;
      state.multiplay.roomId = action.payload.roomId;
      state.multiplay.role = action.payload.role;
      state.multiplay.isInMultiplayMode = true;
    },
    
    leaveMultiplayRoom: (state) => {
      state.multiplay.isActive = false;
      state.multiplay.roomId = null;
      state.multiplay.role = null;
      state.multiplay.isInMultiplayMode = false;
    },
    
    // For followers to update their state without triggering events
    syncFromMultiplay: (state, action) => {
      const { currentSong, currentVolume, currentlyPlayingOn, isPlaying, repeatMode } = action.payload;
      state.currentSong = currentSong;
      state.currentVolume = currentVolume;
      state.currentlyPlayingOn = currentlyPlayingOn;
      state.isPlaying = isPlaying;
      state.repeatMode = repeatMode;
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
  setMultiplayRoom,
  leaveMultiplayRoom,
  syncFromMultiplay,
} = musicSlice.actions;

export default musicSlice.reducer;