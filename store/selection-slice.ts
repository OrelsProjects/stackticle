import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SelectionState {
  ids: number[]; // Substack post ids
}

const initialState: SelectionState = { ids: [] };

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    toggle(state, action: PayloadAction<number>) {
      const id = action.payload;
      const i = state.ids.indexOf(id);
      if (i === -1) state.ids.push(id);
      else state.ids.splice(i, 1);
    },
    set(state, action: PayloadAction<number[]>) {
      state.ids = Array.from(new Set(action.payload));
    },
    clear(state) {
      state.ids = [];
    },
  },
});

export const { toggle, set, clear } = selectionSlice.actions;
export default selectionSlice.reducer;
