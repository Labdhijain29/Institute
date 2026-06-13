import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api/client.js";

export const fetchOffers = createAsyncThunk("offers/fetchAll", async (search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await api(`/offers${query}`);
  return data.items || [];
});

export const createOffer = createAsyncThunk("offers/create", async (values) => {
  return api("/offers", {
    method: "POST",
    body: JSON.stringify(values)
  });
});

export const updateOffer = createAsyncThunk("offers/update", async ({ id, values }) => {
  return api(`/offers/${id}`, {
    method: "PUT",
    body: JSON.stringify(values)
  });
});

export const deleteOffer = createAsyncThunk("offers/delete", async (id) => {
  await api(`/offers/${id}`, { method: "DELETE" });
  return id;
});

const offersSlice = createSlice({
  name: "offers",
  initialState: {
    items: [],
    loading: false,
    saving: false,
    error: ""
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to load offer letters";
      })
      .addCase(createOffer.pending, (state) => {
        state.saving = true;
        state.error = "";
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.saving = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Unable to generate offer letter";
      })
      .addCase(updateOffer.pending, (state) => {
        state.saving = true;
        state.error = "";
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(updateOffer.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Unable to update offer letter";
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  }
});

export default offersSlice.reducer;
