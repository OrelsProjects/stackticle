import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SyncPhase = "idle" | "fetching-publications" | "fetching-posts" | "saving" | "done" | "error";

export interface SyncState {
  phase: SyncPhase;
  message: string | null;
  error: string | null;
  progress: { done: number; total: number } | null;
}

const initialState: SyncState = {
  phase: "idle",
  message: null,
  error: null,
  progress: null,
};

const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    start(state, action: PayloadAction<{ phase: SyncPhase; message?: string }>) {
      state.phase = action.payload.phase;
      state.message = action.payload.message ?? null;
      state.error = null;
    },
    progress(state, action: PayloadAction<{ done: number; total: number; message?: string }>) {
      state.progress = { done: action.payload.done, total: action.payload.total };
      if (action.payload.message) state.message = action.payload.message;
    },
    success(state) {
      state.phase = "done";
      state.message = null;
      state.error = null;
      state.progress = null;
    },
    fail(state, action: PayloadAction<string>) {
      state.phase = "error";
      state.error = action.payload;
      state.progress = null;
    },
    reset(state) {
      state.phase = "idle";
      state.message = null;
      state.error = null;
      state.progress = null;
    },
  },
});

export const { start, progress, success, fail, reset } = syncSlice.actions;
export default syncSlice.reducer;
