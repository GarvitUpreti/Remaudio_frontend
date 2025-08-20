// store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true; // ✅ Make sure this is set
    },

    authenticated(state){
        state.isAuthenticated = true; // ✅ Ensure this is set when user is authenticated
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false; // ✅ Make sure this is set
    },
  },
});

export const { setUser, updateUser, logout } = userSlice.actions;
export default userSlice.reducer;