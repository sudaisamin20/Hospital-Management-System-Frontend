import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type User, type AuthState, type Role } from "./authTypes";
import type { RootState } from "../../app/store";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.role = action.payload.role;
      localStorage.setItem("user", JSON.stringify(action.payload));
      localStorage.setItem("authToken", action.payload.token || "");
    },

    // Logout reducer
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
    },

    // Update user role
    updateRole: (state, action: PayloadAction<Role>) => {
      if (state.user) {
        state.user.role = action.payload;
        state.role = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },

    // Load user from localStorage on app startup
    loadUser: (state, action: PayloadAction<User | null>) => {
      if (action.payload) {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.role = action.payload.role;
      }
    },

    // Create new user (used by admin when creating doctor/receptionist)
    createUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.role = action.payload.role;
      localStorage.setItem("user", JSON.stringify(action.payload));
      localStorage.setItem("authToken", action.payload.token || "");
    },

    // Update user profile information
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

export const {
  login,
  logout,
  updateRole,
  loadUser,
  createUser,
  updateUserProfile,
} = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectRole = (state: RootState) => state.auth.role;

export default authSlice.reducer;
