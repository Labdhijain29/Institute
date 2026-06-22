import { FollowUp } from "../models/FollowUp.js";
import { Lead } from "../models/Lead.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const EXECUTIVE_ROLE = "Digital Marketing Executive";
const LEAD_STATUSES = ["New", "Contacted", "Interested", "Follow-up", "Converted", "Not Interested"];
const TASK_STATUSES = ["Pending", "In Progress", "Done", "Blocked"];

function pageOptions(req) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  return { page, limit };
}

export const executiveDashboard = asyncHandler(async (req, res) => {
  const leadFilter = { digitalMarketingAssigned: req.user._id };
  const [totalLeads, newLeads, convertedLeads, pendingFollowUps] = await Promise.all([
    Lead.countDocuments(leadFilter), Lead.countDocuments({ ...leadFilter, status: "New" }),
    Lead.countDocuments({ ...leadFilter, status: "Converted" }), FollowUp.countDocuments({ assignedTo: req.user._id, status: "Pending" })
  ]);
  res.json({ totalLeads, newLeads, convertedLeads, pendingFollowUps });
});

export const myLeads = asyncHandler(async (req, res) => {
  const { page, limit } = pageOptions(req);
  const filter = { digitalMarketingAssigned: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.$or = ["name", "mobile", "email", "source"].map((field) => ({ [field]: new RegExp(req.query.search, "i") }));
  const [items, total] = await Promise.all([
    Lead.find(filter).populate("courseInterested", "name").sort({ digitalMarketingAssignedAt: -1 }).skip((page - 1) * limit).limit(limit),
    Lead.countDocuments(filter)
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const updateMyLead = asyncHandler(async (req, res) => {
  if (!LEAD_STATUSES.includes(req.body.status)) throw new ApiError(400, "Invalid lead status");
  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.id, digitalMarketingAssigned: req.user._id },
    { status: req.body.status, remarks: req.body.remarks }, { new: true, runValidators: true }
  ).populate("courseInterested", "name");
  if (!lead) throw new ApiError(404, "Assigned lead not found");
  res.json(lead);
});

export const myFollowUps = asyncHandler(async (req, res) => {
  const filter = { assignedTo: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const items = await FollowUp.find(filter).populate("lead", "name mobile email").sort({ dueAt: 1 });
  res.json({ items });
});

export const createMyFollowUp = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.body.lead, digitalMarketingAssigned: req.user._id });
  if (!lead) throw new ApiError(404, "Assigned lead not found");
  if (!req.body.dueAt) throw new ApiError(400, "Follow-up date is required");
  const followUp = await FollowUp.create({ lead: lead._id, assignedTo: req.user._id, dueAt: req.body.dueAt, remarks: req.body.notes || req.body.remarks, status: "Pending", type: "Call", createdBy: req.user._id });
  lead.status = "Follow-up"; lead.followUpDate = req.body.dueAt; await lead.save();
  res.status(201).json(await followUp.populate("lead", "name mobile email"));
});

export const updateMyFollowUp = asyncHandler(async (req, res) => {
  const allowed = ["Pending", "Done", "Missed"];
  if (!allowed.includes(req.body.status)) throw new ApiError(400, "Invalid follow-up status");
  const item = await FollowUp.findOneAndUpdate({ _id: req.params.id, assignedTo: req.user._id }, { status: req.body.status, remarks: req.body.notes ?? req.body.remarks }, { new: true, runValidators: true }).populate("lead", "name mobile email");
  if (!item) throw new ApiError(404, "Assigned follow-up not found");
  res.json(item);
});

export const myTasks = asyncHandler(async (req, res) => {
  const filter = { assignedTo: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const items = await Task.find(filter).sort({ deadline: 1 });
  res.json({ items });
});

export const updateMyTask = asyncHandler(async (req, res) => {
  if (!TASK_STATUSES.includes(req.body.status)) throw new ApiError(400, "Invalid task status");
  const item = await Task.findOneAndUpdate({ _id: req.params.id, assignedTo: req.user._id }, { status: req.body.status, remarks: req.body.remarks }, { new: true, runValidators: true });
  if (!item) throw new ApiError(404, "Assigned task not found");
  res.json(item);
});

export const marketingProfile = asyncHandler(async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, mobile: req.user.mobile || "", avatar: req.user.avatar || "" } });
});

export const changeMarketingPassword = asyncHandler(async (req, res) => {
  if (!req.body.currentPassword || !req.body.newPassword || req.body.newPassword.length < 6) throw new ApiError(400, "Valid current and new password are required");
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(req.body.currentPassword))) throw new ApiError(400, "Current password is incorrect");
  user.password = req.body.newPassword; await user.save(); res.json({ message: "Password changed successfully" });
});

export const listExecutives = asyncHandler(async (req, res) => {
  const filter = { role: EXECUTIVE_ROLE };
  if (req.query.status === "active") filter.isActive = true;
  if (req.query.status === "inactive") filter.isActive = false;
  if (req.query.search) filter.$or = ["name", "email", "mobile"].map((field) => ({ [field]: new RegExp(req.query.search, "i") }));
  const users = await User.find(filter).sort({ createdAt: -1 });
  const items = await Promise.all(users.map(async (user) => {
    const [leadCount, convertedLeads, pendingFollowUps, taskCount] = await Promise.all([
      Lead.countDocuments({ digitalMarketingAssigned: user._id }), Lead.countDocuments({ digitalMarketingAssigned: user._id, status: "Converted" }),
      FollowUp.countDocuments({ assignedTo: user._id, status: "Pending" }), Task.countDocuments({ assignedTo: user._id })
    ]);
    return { ...user.toObject(), leadCount, convertedLeads, pendingFollowUps, taskCount };
  }));
  res.json({ items });
});

export const createExecutive = asyncHandler(async (req, res) => {
  const { name, email, mobile, password, isActive = true } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Name, email and password are required");
  if (await User.exists({ email })) throw new ApiError(409, "Email already registered");
  const user = await User.create({ name, email, mobile, password, role: EXECUTIVE_ROLE, isActive, approvalStatus: "Approved", approvalReviewedBy: req.user._id, approvalReviewedAt: new Date() });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role, isActive: user.isActive });
});

export const updateExecutive = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: EXECUTIVE_ROLE });
  if (!user) throw new ApiError(404, "Digital Marketing Executive not found");
  for (const field of ["name", "email", "mobile", "avatar", "isActive"]) if (req.body[field] !== undefined) user[field] = req.body[field];
  if (req.body.password) user.password = req.body.password;
  await user.save();
  res.json({ id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role, isActive: user.isActive });
});

export const deleteExecutive = asyncHandler(async (req, res) => {
  const user = await User.findOneAndDelete({ _id: req.params.id, role: EXECUTIVE_ROLE });
  if (!user) throw new ApiError(404, "Digital Marketing Executive not found");
  await Promise.all([
    Lead.updateMany({ digitalMarketingAssigned: user._id }, { $unset: { digitalMarketingAssigned: 1, digitalMarketingAssignedAt: 1 } }),
    FollowUp.updateMany({ assignedTo: user._id }, { $unset: { assignedTo: 1 } }), Task.updateMany({ assignedTo: user._id }, { $unset: { assignedTo: 1 } })
  ]);
  res.json({ message: "Digital Marketing Executive deleted" });
});

export const adminMarketingLeads = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.executive) filter.digitalMarketingAssigned = req.query.executive;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) filter.$or = ["name", "mobile", "email", "source"].map((field) => ({ [field]: new RegExp(req.query.search, "i") }));
  const items = await Lead.find(filter).populate("courseInterested", "name").populate("digitalMarketingAssigned", "name email isActive").sort({ createdAt: -1 }).limit(100);
  res.json({ items });
});

export const assignMarketingLead = asyncHandler(async (req, res) => {
  const executive = await User.findOne({ _id: req.body.executiveId, role: EXECUTIVE_ROLE, isActive: true });
  if (!executive) throw new ApiError(400, "Select an active Digital Marketing Executive");
  const lead = await Lead.findByIdAndUpdate(req.params.id, { digitalMarketingAssigned: executive._id, digitalMarketingAssignedAt: new Date() }, { new: true, runValidators: true });
  if (!lead) throw new ApiError(404, "Lead not found");
  res.json(lead);
});

export const adminMarketingFollowUps = asyncHandler(async (req, res) => {
  const executiveIds = req.query.executive ? [req.query.executive] : await User.find({ role: EXECUTIVE_ROLE }).distinct("_id");
  const filter = { assignedTo: { $in: executiveIds } };
  const items = await FollowUp.find(filter).populate("lead", "name mobile").populate("assignedTo", "name email role").sort({ dueAt: 1 }).limit(100);
  res.json({ items });
});

export const adminMarketingTasks = asyncHandler(async (req, res) => {
  const executiveIds = req.query.executive ? [req.query.executive] : await User.find({ role: EXECUTIVE_ROLE }).distinct("_id");
  const filter = { assignedTo: { $in: executiveIds } };
  const items = await Task.find(filter).populate("assignedTo", "name email role").sort({ deadline: 1 }).limit(100);
  res.json({ items });
});

export const createMarketingTask = asyncHandler(async (req, res) => {
  const executive = await User.findOne({ _id: req.body.assignedTo, role: EXECUTIVE_ROLE, isActive: true });
  if (!executive) throw new ApiError(400, "Select an active Digital Marketing Executive");
  const item = await Task.create({ title: req.body.title, description: req.body.description, deadline: req.body.dueDate, priority: req.body.priority || "Medium", status: "Pending", assignedTo: executive._id, assignedBy: req.user._id });
  res.status(201).json(item);
});
