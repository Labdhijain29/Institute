import { Router } from "express";
import { permit } from "../middleware/auth.js";
import {
  createReceipt,
  deleteReceipt,
  getReceipt,
  listReceipts,
  updateReceipt
} from "../controllers/receiptController.js";

export const receiptRoutes = Router();

receiptRoutes
  .route("/")
  .get(permit("receipts:read"), listReceipts)
  .post(permit("receipts:create"), createReceipt);

receiptRoutes
  .route("/:id")
  .get(permit("receipts:read"), getReceipt)
  .put(permit("receipts:update"), updateReceipt)
  .delete(permit("receipts:delete"), deleteReceipt);
