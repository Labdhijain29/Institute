import { FollowUp } from "../models/FollowUp.js";
import { Lead } from "../models/Lead.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const ownerFilter = (user) => ({ assignedTo: user._id });
const manageableRoles = ["Super Admin", "Admin", "Manager"];

async function markOverdue(user) {
  await FollowUp.updateMany(
    { ...ownerFilter(user), status: "Pending", dueAt: { $lt: new Date() } },
    { $set: { status: "Overdue" } }
  );
}

export const createFollowUp = asyncHandler(async (req, res) => {
  const { leadId, dueAt, notes } = req.body;
  if (!leadId || !dueAt) throw new ApiError(400, "Lead and follow-up date and time are required");

  const lead = await Lead.findById(leadId);
  if (!lead) throw new ApiError(404, "Lead not found");
  const isAssigned = lead.telecallerAssigned?.toString() === req.user._id.toString() || lead.createdBy?.toString() === req.user._id.toString();
  if (!manageableRoles.includes(req.user.role) && !isAssigned) throw new ApiError(403, "Only the assigned telecaller can create this reminder");

  const scheduledAt = new Date(dueAt);
  if (Number.isNaN(scheduledAt.getTime())) throw new ApiError(400, "A valid follow-up date and time is required");

  const item = await FollowUp.create({
    lead: lead._id,
    assignedTo: req.user._id,
    createdBy: req.user._id,
    dueAt: scheduledAt,
    remarks: notes?.trim(),
    status: "Pending",
    type: "Call"
  });

  res.status(201).json(await item.populate("lead", "name mobile"));
});

export const listFollowUps = asyncHandler(async (req, res) => {
  await markOverdue(req.user);
  const items = await FollowUp.find({ ...ownerFilter(req.user), status: { $in: ["Pending", "Overdue"] } })
    .populate("lead", "name mobile")
    .sort({ dueAt: 1 });
  res.json({ items });
});

export const updateFollowUp = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.status) {
    if (!["Pending", "Completed", "Overdue"].includes(req.body.status)) throw new ApiError(400, "Invalid follow-up status");
    updates.status = req.body.status;
  }
  if (typeof req.body.notes === "string") updates.remarks = req.body.notes.trim();
  if (!Object.keys(updates).length) throw new ApiError(400, "No reminder updates supplied");

  const item = await FollowUp.findOneAndUpdate(
    { _id: req.params.id, ...ownerFilter(req.user) },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate("lead", "name mobile");
  if (!item) throw new ApiError(404, "Reminder not found");
  res.json(item);
});

export const deleteFollowUp = asyncHandler(async (req, res) => {
  const item = await FollowUp.findOneAndDelete({ _id: req.params.id, ...ownerFilter(req.user) });
  if (!item) throw new ApiError(404, "Reminder not found");
  res.status(204).end();
});
