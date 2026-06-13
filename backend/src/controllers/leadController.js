import { Lead } from "../models/Lead.js";
import { FollowUp } from "../models/FollowUp.js";
import { Student } from "../models/Student.js";
import { Fee } from "../models/Fee.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function sameId(left, right) {
  return left?.toString() === right?.toString();
}

function canManageAnyLead(role) {
  return ["Super Admin", "Admin", "Manager"].includes(role);
}

async function createAdmissionFromLead(lead, req) {
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

  lead.status = "Admission Done";
  lead.admissionStatus = "Done";
  lead.convertedStudent = student._id;
  lead.convertedAt = new Date();
  await lead.save();

  return { lead, student, fee, payment };
}

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

export const listLeadFollowUps = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");

  const items = await FollowUp.find({ lead: req.params.id })
    .populate("createdBy", "name email role")
    .sort({ createdAt: -1 });

  res.json({ items });
});

export const createLeadFollowUp = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");

  const followUp = await FollowUp.create({
    lead: lead._id,
    assignedTo: req.user._id,
    createdBy: req.user._id,
    dueAt: req.body.followUpDate,
    nextDueAt: req.body.nextFollowUpDate,
    status: req.body.status,
    remarks: req.body.remarks,
    type: req.body.status === "Demo Scheduled" ? "Demo" : "Call"
  });

  lead.followUpDate = req.body.nextFollowUpDate || req.body.followUpDate || lead.followUpDate;
  lead.status = req.body.status || lead.status;
  lead.remarks = req.body.remarks || lead.remarks;
  lead.callHistory.push({
    by: req.user._id,
    status: req.body.status,
    remarks: req.body.remarks,
    followUpDate: req.body.nextFollowUpDate || req.body.followUpDate
  });
  await lead.save();

  res.status(201).json(await followUp.populate("createdBy", "name email role"));
});

export const facultyOptions = asyncHandler(async (_req, res) => {
  const faculty = await User.find({ role: "Faculty", isActive: true }).sort({ name: 1 }).select("name email mobile role");
  res.json({ items: faculty });
});

export const forwardToCounsellor = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");
  const counsellor = req.body.counsellorAssigned
    ? { _id: req.body.counsellorAssigned }
    : await User.findOne({ role: "Counsellor", isActive: true }).sort({ createdAt: 1 }).select("_id");
  if (!counsellor?._id) throw new ApiError(400, "No active counsellor found");
  if (req.user.role === "Telecaller" && !sameId(lead.createdBy, req.user._id) && !sameId(lead.telecallerAssigned, req.user._id)) {
    throw new ApiError(403, "Only assigned telecaller can forward this lead");
  }
  if (lead.convertedStudent) throw new ApiError(409, "Lead already converted");
  lead.counsellorAssigned = counsellor._id;
  lead.status = "Forwarded to Counsellor";
  lead.admissionStatus = "Pending";
  lead.forwardedAt = new Date();
  lead.forwardedBy = req.user._id;
  lead.remarks = req.body.remarks || lead.remarks;
  await lead.save();
  res.json(lead);
});

export const forwardToFaculty = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");
  if (!req.body.facultyAssigned) throw new ApiError(400, "Faculty is required");
  const isWithCounsellor = lead.counsellorAssigned || ["Forwarded", "Forwarded to Counsellor"].includes(lead.status);
  if (!isWithCounsellor) throw new ApiError(400, "Lead must be with counsellor first");
  if (!canManageAnyLead(req.user.role) && lead.counsellorAssigned && !sameId(lead.counsellorAssigned, req.user._id)) {
    throw new ApiError(403, "Only assigned counsellor can forward this lead");
  }
  if (lead.convertedStudent) throw new ApiError(409, "Lead already converted");

  lead.facultyAssigned = req.body.facultyAssigned;
  lead.status = "Forwarded to Faculty";
  lead.admissionStatus = "Pending";
  lead.counsellorForwardedAt = new Date();
  lead.counsellorForwardedBy = req.user._id;
  lead.remarks = req.body.remarks || lead.remarks;
  await lead.save();
  res.json(lead);
});

export const approveAdmission = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");
  if (!lead.facultyAssigned) throw new ApiError(400, "Lead must be forwarded to faculty first");
  if (!canManageAnyLead(req.user.role) && !sameId(lead.facultyAssigned, req.user._id)) {
    throw new ApiError(403, "Only assigned faculty can approve this lead");
  }
  if (!req.body.course || !req.body.totalFees) throw new ApiError(400, "Course and total fees are required");

  lead.facultyApprovedAt = new Date();
  lead.facultyApprovedBy = req.user._id;
  lead.remarks = req.body.remarks || lead.remarks;
  const result = await createAdmissionFromLead(lead, req);
  res.status(201).json(result);
});

export const convertToAdmission = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new ApiError(404, "Lead not found");
  if (!req.body.course || !req.body.totalFees) throw new ApiError(400, "Course and total fees are required");
  const result = await createAdmissionFromLead(lead, req);
  res.status(201).json(result);
});
