import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'donor' | 'hospital' | 'admin' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  fullName?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  role: null,
  fullName: undefined,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ role: UserRole; fullName: string }>) {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.fullName = action.payload.fullName;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.role = null;
      state.fullName = undefined;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;


