import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'donor' | 'hospital' | 'admin' | 'super_admin' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  userId?: string;
  fullName?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  role: null,
  userId: undefined,
  fullName: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ role: UserRole; userId?: string; fullName: string }>) {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.userId = action.payload.userId;
      state.fullName = action.payload.fullName;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.role = null;
      state.userId = undefined;
      state.fullName = undefined;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;


