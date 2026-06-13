import { Router } from "express";
import {
  createCertificate,
  deleteCertificate,
  getCertificate,
  listCertificates,
  updateCertificate
} from "../controllers/certificateController.js";
import { permit } from "../middleware/auth.js";

export const certificateRoutes = Router();

certificateRoutes
  .route("/")
  .get(permit("certificates:read"), listCertificates)
  .post(permit("certificates:create"), createCertificate);

certificateRoutes
  .route("/:id")
  .get(permit("certificates:read"), getCertificate)
  .put(permit("certificates:update"), updateCertificate)
  .delete(permit("certificates:delete"), deleteCertificate);
