import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Lead } from "../models/Lead.js";
import { User } from "../models/User.js";

export const publicRoutes = Router();

publicRoutes.post(
  "/enquiries",
  asyncHandler(async (req, res) => {
    const { name, fullName, mobile, email, course, message, sendToCounsellor } = req.body;
    const counsellor = sendToCounsellor
      ? await User.findOne({ role: "Counsellor", isActive: true }).sort({ createdAt: 1 }).select("_id")
      : null;
    const lead = await Lead.create({
      name: name || fullName,
      mobile,
      email,
      source: "Website",
      status: sendToCounsellor ? "Forwarded to Counsellor" : "New",
      admissionStatus: "Pending",
      counsellorAssigned: counsellor?._id,
      forwardedAt: sendToCounsellor ? new Date() : undefined,
      remarks: [
        sendToCounsellor ? "Lead Type: Course Counsellor Request" : "",
        course ? `Interested Course: ${course}` : "",
        message ? `Message: ${message}` : ""
      ].filter(Boolean).join("\n")
    });

    res.status(201).json({
      message: "Enquiry submitted successfully",
      enquiry: { id: lead._id, name: lead.name, status: lead.status }
    });
  })
);
