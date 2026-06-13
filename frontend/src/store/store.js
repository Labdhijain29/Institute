import { configureStore } from "@reduxjs/toolkit";
import certificatesReducer from "./certificatesSlice.js";
import offersReducer from "./offersSlice.js";
import receiptsReducer from "./receiptsSlice.js";

export const store = configureStore({
  reducer: {
    certificates: certificatesReducer,
    offers: offersReducer,
    receipts: receiptsReducer
  }
});
