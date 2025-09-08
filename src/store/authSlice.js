import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    refreshToken: null, // ✅ Store refresh token in memory only
    isRefreshing: false,
  },
  reducers: {
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    clearRefreshToken: (state) => {
      state.refreshToken = null;
    },
    setRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
  },
});

export const { setRefreshToken, clearRefreshToken, setRefreshing } = authSlice.actions;
export default authSlice.reducer;