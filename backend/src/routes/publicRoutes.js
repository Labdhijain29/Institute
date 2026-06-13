import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Lead } from "../models/Lead.js";

export const publicRoutes = Router();

publicRoutes.post(
  "/enquiries",
  asyncHandler(async (req, res) => {
    const { name, fullName, mobile, email, course, message } = req.body;
    const lead = await Lead.create({
      name: name || fullName,
      mobile,
      email,
      source: "Website",
      status: "New",
      remarks: [course ? `Interested Course: ${course}` : "", message ? `Message: ${message}` : ""].filter(Boolean).join("\n")
    });

    res.status(201).json({
      message: "Enquiry submitted successfully",
      enquiry: { id: lead._id, name: lead.name, status: lead.status }
    });
  })
);
