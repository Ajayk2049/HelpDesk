// src/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const savedUser = localStorage.getItem("user");
const savedToken = localStorage.getItem("token");

const initialState = {
  isAuthenticated: !!savedToken && !!savedUser,
  user: savedUser ? JSON.parse(savedUser) : null, // <- store only the user object
  token: savedToken || null,                       // <- store token separately
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signup: (state, action) => {
      // you may not have a token at signup yet
      state.isAuthenticated = false;
      state.user = action.payload || null;
      state.token = null;
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.removeItem("token");
    },
    login: (state, action) => {
      // server returns { message, token, user }
      const { user, token } = action.payload || {};
      state.isAuthenticated = !!token && !!user;
      state.user = user || null;
      state.token = token || null;

      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("token", token);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { signup, login, logout } = authSlice.actions;
export default authSlice.reducer;
