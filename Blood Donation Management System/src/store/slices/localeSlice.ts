import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Locale = 'en' | 'am';

interface LocaleState {
  current: Locale;
}

const initialState: LocaleState = {
  current: 'en',
};

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.current = action.payload;
    },
  },
});

export const { setLocale } = localeSlice.actions;
export default localeSlice.reducer;

