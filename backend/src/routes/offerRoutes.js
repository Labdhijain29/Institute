import { Router } from "express";
import { createOffer, deleteOffer, getOffer, listOffers, updateOffer } from "../controllers/offerController.js";
import { permit } from "../middleware/auth.js";

export const offerRoutes = Router();

offerRoutes
  .route("/")
  .get(permit("offers:read"), listOffers)
  .post(permit("offers:create"), createOffer);

offerRoutes
  .route("/:id")
  .get(permit("offers:read"), getOffer)
  .put(permit("offers:update"), updateOffer)
  .delete(permit("offers:delete"), deleteOffer);
