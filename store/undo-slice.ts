import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface PendingDelete {
  id: string; // local toast id
  publicationId: string;
  newsletterUrl: string;
  postIds: number[]; // Substack post ids
  expiresAt: number; // epoch ms
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
  },
});

export const { enqueue, dismiss, clear } = undoSlice.actions;
export default undoSlice.reducer;
