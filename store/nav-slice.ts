import { createSlice } from "@reduxjs/toolkit";

interface NavState {
  isNavigating: boolean;
}

const initialState: NavState = { isNavigating: false };

const navSlice = createSlice({
  name: "nav",
  initialState,
  reducers: {
    startNavigation: (state) => { state.isNavigating = true; },
    endNavigation: (state) => { state.isNavigating = false; },
  },
});

export const { startNavigation, endNavigation } = navSlice.actions;
export default navSlice.reducer;
