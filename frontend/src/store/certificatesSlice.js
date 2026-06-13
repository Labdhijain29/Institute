import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api/client.js";

export const fetchCertificates = createAsyncThunk("certificates/fetchAll", async (search = "") => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await api(`/certificates${query}`);
  return data.items || [];
});

export const createCertificate = createAsyncThunk("certificates/create", async (values) => {
  return api("/certificates", {
    method: "POST",
    body: JSON.stringify(values)
  });
});

export const updateCertificate = createAsyncThunk("certificates/update", async ({ id, values }) => {
  return api(`/certificates/${id}`, {
    method: "PUT",
    body: JSON.stringify(values)
  });
});

export const deleteCertificate = createAsyncThunk("certificates/delete", async (id) => {
  await api(`/certificates/${id}`, { method: "DELETE" });
  return id;
});

const certificatesSlice = createSlice({
  name: "certificates",
  initialState: {
    items: [],
    loading: false,
    saving: false,
    error: ""
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCertificates.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCertificates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unable to load certificates";
      })
      .addCase(createCertificate.pending, (state) => {
        state.saving = true;
      })
      .addCase(createCertificate.fulfilled, (state, action) => {
        state.saving = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createCertificate.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Unable to generate certificate";
      })
      .addCase(updateCertificate.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateCertificate.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(updateCertificate.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Unable to update certificate";
      })
      .addCase(deleteCertificate.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  }
});

export default certificatesSlice.reducer;
