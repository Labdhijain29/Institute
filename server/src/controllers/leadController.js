import { Lead } from "../models/Lead.js";
import { Student } from "../models/Student.js";
import { Fee } from "../models/Fee.js";
import { Payment } from "../models/Payment.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const assignLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndUpdate(
    req.params.id,
    { telecallerAssigned: req.body.telecallerAssigned, status: "Assigned" },
    { new: true, runValidators: true }
  );
  if (!lead) throw new ApiError(404, "Lead not found");
  res.json(lead);
});

export const addCallHistory = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");
  lead.callHistory.push({ ...req.body, by: req.user._id });
  lead.remarks = req.body.remarks || lead.remarks;
  lead.status = req.body.status || lead.status;
  lead.followUpDate = req.body.followUpDate || lead.followUpDate;
  await lead.save();
  res.json(lead);
});

export const forwardToCounsellor = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");
  lead.counsellorAssigned = req.body.counsellorAssigned;
  lead.status = "Forwarded";
  lead.forwardedAt = new Date();
  lead.forwardedBy = req.user._id;
  lead.remarks = req.body.remarks || lead.remarks;
  await lead.save();
  res.json(lead);
});

export const convertToAdmission = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");
  if (lead.convertedStudent) throw new ApiError(409, "Lead already converted");

  const year = new Date().getFullYear();
  const count = await Student.countDocuments();
  const studentId = `STU-${year}-${String(count + 1).padStart(5, "0")}`;

  const student = await Student.create({
    studentId,
    name: lead.name,
    mobile: lead.mobile,
    email: lead.email,
    course: req.body.course,
    batch: req.body.batch,
    admissionDate: new Date(),
    documents: req.body.documents || [],
    status: "Active",
    createdBy: req.user._id
  });

  const fee = await Fee.create({
    student: student._id,
    course: req.body.course,
    totalFees: req.body.totalFees,
    discount: req.body.discount || 0,
    paidFees: req.body.initialPayment || 0,
    pendingFees: Math.max((req.body.totalFees || 0) - (req.body.discount || 0) - (req.body.initialPayment || 0), 0),
    installments: req.body.installments || [],
    createdBy: req.user._id
  });

  let payment = null;
  if (req.body.initialPayment > 0) {
    payment = await Payment.create({
      fee: fee._id,
      student: student._id,
      amount: req.body.initialPayment,
      mode: req.body.paymentMode || "Cash",
      receiptNo: `RCP-${Date.now()}`,
      receivedBy: req.user._id
    });
  }

  lead.status = "Converted";
  lead.convertedStudent = student._id;
  lead.convertedAt = new Date();
  await lead.save();

  res.status(201).json({ lead, student, fee, payment });
});
