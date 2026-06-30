import { OfferLetter } from "../models/OfferLetter.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function offerPayload(body) {
  return {
    studentName: body.studentName,
    studentId: body.studentId,
    email: body.email,
    phone: body.phone,
    address: body.address,
    courseName: body.courseName,
    department: body.department,
    batch: body.batch,
    duration: body.duration,
    feeOffered: body.feeOffered,
    scholarship: body.scholarship,
    finalAmount: body.finalAmount,
    paymentSchedule: body.paymentSchedule,
    startDate: body.startDate,
    endDate: body.endDate,
    offerDate: body.offerDate,
    joiningDate: body.joiningDate,
    validTill: body.validTill,
    authorizedSignatory: body.authorizedSignatory,
    hrContact: body.hrContact,
    branchLocation: body.branchLocation,
    reportingManager: body.reportingManager,
    trainingLocation: body.trainingLocation,
    mode: body.mode,
    documentNumber: body.documentNumber,
    offerLetterId: body.offerLetterId,
    companyCinGst: body.companyCinGst,
    remarks: body.remarks
  };
}

export const listOffers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const search = req.query.search;
  const filter = {};

  if (search) {
    filter.$or = [
      { studentName: new RegExp(search, "i") },
      { studentId: new RegExp(search, "i") },
      { courseName: new RegExp(search, "i") },
      { batch: new RegExp(search, "i") }
    ];
  }

  const [items, total] = await Promise.all([
    OfferLetter.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    OfferLetter.countDocuments(filter)
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const getOffer = asyncHandler(async (req, res) => {
  const offer = await OfferLetter.findById(req.params.id);
  if (!offer) throw new ApiError(404, "Offer letter not found");
  res.json(offer);
});

export const createOffer = asyncHandler(async (req, res) => {
  const offer = await OfferLetter.create({
    ...offerPayload(req.body),
    createdBy: req.user?._id
  });
  res.status(201).json(offer);
});

export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await OfferLetter.findByIdAndUpdate(req.params.id, offerPayload(req.body), {
    new: true,
    runValidators: true
  });
  if (!offer) throw new ApiError(404, "Offer letter not found");
  res.json(offer);
});

export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await OfferLetter.findByIdAndDelete(req.params.id);
  if (!offer) throw new ApiError(404, "Offer letter not found");
  res.json({ message: "Deleted" });
});
