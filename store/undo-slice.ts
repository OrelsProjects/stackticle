import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface PendingDelete {
  id: string; // local toast id
  publicationId: string;
  newsletterUrl: string;
  postIds: number[]; // Substack post ids
  expiresAt: number; // epoch ms
  pausedAt?: number; // epoch ms when hovering started; undefined = running
}

export interface UndoState {
  pending: PendingDelete[];
}

const initialState: UndoState = { pending: [] };

const undoSlice = createSlice({
  name: "undo",
  initialState,
  reducers: {
    enqueue(state, action: PayloadAction<PendingDelete>) {
      state.pending.push(action.payload);
    },
    dismiss(state, action: PayloadAction<string>) {
      state.pending = state.pending.filter((p) => p.id !== action.payload);
    },
    clear(state) {
      state.pending = [];
    },
    pause(state, action: PayloadAction<string>) {
      const item = state.pending.find((p) => p.id === action.payload);
      if (item && item.pausedAt === undefined) {
        item.pausedAt = Date.now();
      }
    },
    resume(state, action: PayloadAction<string>) {
      const item = state.pending.find((p) => p.id === action.payload);
      if (item && item.pausedAt !== undefined) {
        item.expiresAt += Date.now() - item.pausedAt;
        item.pausedAt = undefined;
      }
    },
  },
});

export const { enqueue, dismiss, clear, pause, resume } = undoSlice.actions;
export default undoSlice.reducer;
