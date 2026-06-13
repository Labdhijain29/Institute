import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api/client.js";

export const fetchReceipts = createAsyncThunk("receipts/fetchAll", async () => {
  const data = await api("/receipts");
  return data.items || [];
});

export const fetchReceipt = createAsyncThunk("receipts/fetchOne", async (id) => {
  return api(`/receipts/${id}`);
});

export const updateReceipt = createAsyncThunk("receipts/update", async ({ id, values }) => {
  return api(`/receipts/${id}`, {
    method: "PUT",
    body: JSON.stringify(values)
  });
});

const receiptsSlice = createSlice({
  name: "receipts",
  initialState: {
    items: [],
    selected: null,
    loading: false,
    saving: false,
    error: ""
  },
  reducers: {
    clearSelected(state) {
      state.selected = null;
      state.error = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReceipts.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to load receipts";
      })
      .addCase(fetchReceipt.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to load receipt";
      })
      .addCase(updateReceipt.pending, (state) => {
        state.saving = true;
        state.error = "";
      })
      .addCase(updateReceipt.fulfilled, (state, action) => {
        state.saving = false;
        state.selected = action.payload;
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(updateReceipt.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Unable to save receipt";
      });
  }
});

export const { clearSelected } = receiptsSlice.actions;
export default receiptsSlice.reducer;
