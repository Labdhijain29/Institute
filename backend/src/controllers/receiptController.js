import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Payment } from "../models/Payment.js";
import { Receipt } from "../models/Receipt.js";

const populateReceipt = [
  { path: "student", populate: [{ path: "course" }, { path: "batch" }] },
  { path: "payment" }
];

function receiptNumber() {
  const year = new Date().getFullYear();
  const serial = Math.floor(Date.now() % 1000000).toString().padStart(6, "0");
  return `INST-${year}-${serial}`;
}

async function hydrateFromPayment(payload) {
  if (!payload.payment) return payload;
  const payment = await Payment.findById(payload.payment).populate({
    path: "fee",
    populate: { path: "course" }
  });
  if (!payment) throw new ApiError(404, "Payment not found");

  const fee = payment.fee;
  return {
    ...payload,
    student: payload.student || payment.student,
    receiptNumber: payload.receiptNumber || payment.receiptNo || receiptNumber(),
    paymentDate: payload.paymentDate || payment.paidAt,
    paymentMode: payload.paymentMode || payment.mode,
    transactionId: payload.transactionId || payment.note || "",
    amountPaid: payload.amountPaid ?? payment.amount,
    totalCourseFee: payload.totalCourseFee ?? fee?.totalFees ?? 0,
    previousDue: payload.previousDue ?? fee?.pendingFees ?? 0,
    discount: payload.discount ?? fee?.discount ?? 0
  };
}

export const listReceipts = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const search = req.query.search;
  const filter = {};

  if (search) {
    filter.$or = [
      { receiptNumber: new RegExp(search, "i") },
      { transactionId: new RegExp(search, "i") },
      { paymentMode: new RegExp(search, "i") }
    ];
  }

  const [items, total] = await Promise.all([
    Receipt.find(filter).populate(populateReceipt).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Receipt.countDocuments(filter)
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const getReceipt = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id).populate(populateReceipt);
  if (!receipt) throw new ApiError(404, "Receipt not found");
  res.json(receipt);
});

export const createReceipt = asyncHandler(async (req, res) => {
  const payload = await hydrateFromPayment({
    receiptNumber: receiptNumber(),
    ...req.body,
    createdBy: req.user?._id
  });
  const receipt = await Receipt.create(payload);
  res.status(201).json(await receipt.populate(populateReceipt));
});

export const updateReceipt = asyncHandler(async (req, res) => {
  const payload = await hydrateFromPayment(req.body);
  const receipt = await Receipt.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  }).populate(populateReceipt);
  if (!receipt) throw new ApiError(404, "Receipt not found");
  res.json(receipt);
});

export const deleteReceipt = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findByIdAndDelete(req.params.id);
  if (!receipt) throw new ApiError(404, "Receipt not found");
  res.json({ message: "Deleted" });
});
