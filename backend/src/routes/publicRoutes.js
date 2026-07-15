import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Lead } from "../models/Lead.js";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { City, State } from "country-state-city";
import { ApiError } from "../utils/ApiError.js";

export const publicRoutes = Router();

publicRoutes.get("/locations/states", (_req, res) => {
  const items = State.getStatesOfCountry("IN")
    .map(({ name, isoCode }) => ({ name, isoCode }))
    .sort((a, b) => a.name.localeCompare(b.name));
  res.json({ items });
});

publicRoutes.get("/locations/cities", (req, res) => {
  const stateCode = String(req.query.stateCode || "").toUpperCase();
  const isIndianState = State.getStatesOfCountry("IN").some((state) => state.isoCode === stateCode);
  if (!isIndianState) return res.status(400).json({ message: "Valid Indian state code is required" });
  const items = [...new Set(City.getCitiesOfState("IN", stateCode).map((city) => city.name))]
    .sort((a, b) => a.localeCompare(b));
  res.json({ items });
});

publicRoutes.get(
  "/courses",
  asyncHandler(async (_req, res) => {
    const items = await Course.find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .select("name duration fees description modules technologies syllabus isActive createdAt");
    res.json({ items });
  })
);

publicRoutes.post(
  "/enquiries",
  asyncHandler(async (req, res) => {
    const clean = (value, max = 300) => String(value || "").trim().slice(0, max);
    const { sendToCounsellor } = req.body;
    const fullName = clean(req.body.fullName || req.body.name, 100);
    const mobile = clean(req.body.mobile, 15);
    const email = clean(req.body.email, 150).toLowerCase();
    const course = clean(req.body.course, 150);
    if (fullName.length < 2) throw new ApiError(400, "Please enter your full name");
    if (!/^[6-9]\d{9}$/.test(mobile)) throw new ApiError(400, "Please enter a valid 10-digit mobile number");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "Please enter a valid email address");
    if (!sendToCounsellor && (!clean(req.body.city) || !clean(req.body.college) || !clean(req.body.qualification) || !course || !clean(req.body.learningMode))) throw new ApiError(400, "Please complete all required enquiry fields");
    const counsellor = sendToCounsellor
      ? await User.findOne({ role: "Counsellor", isActive: true }).sort({ createdAt: 1 }).select("_id")
      : null;
    const lead = await Lead.create({
      name: fullName,
      mobile,
      email,
      source: "Website",
      priority: sendToCounsellor ? "Warm" : "Normal",
      courseName: course,
      city: clean(req.body.city, 100), state: clean(req.body.state, 100), college: clean(req.body.college, 150),
      qualification: clean(req.body.qualification, 100), currentYear: clean(req.body.currentYear, 80),
      learningMode: clean(req.body.learningMode, 30), preferredTime: clean(req.body.preferredTime, 30),
      message: clean(req.body.message, 1000), howHeard: clean(req.body.howHeard, 50), createdByLabel: "Website",
      status: sendToCounsellor ? "Forwarded to Counsellor" : "New",
      admissionStatus: "Pending",
      counsellorAssigned: counsellor?._id,
      forwardedAt: sendToCounsellor ? new Date() : undefined,
      remarks: [
        sendToCounsellor ? "Lead Type: Course Counsellor Request" : "",
        course ? `Interested Course: ${course}` : "",
        req.body.message ? `Message: ${clean(req.body.message, 1000)}` : ""
      ].filter(Boolean).join("\n")
    });

    res.status(201).json({
      message: "Enquiry submitted successfully",
      enquiry: { id: lead._id, name: lead.name, status: lead.status }
    });
  })
);
