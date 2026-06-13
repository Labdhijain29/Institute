import { Certificate } from "../models/Certificate.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function nextCertificateNumber(issueDate = new Date()) {
  const year = new Date(issueDate).getFullYear();
  const prefix = `CERT/${year}/`;
  const latest = await Certificate.findOne({
    $or: [
      { certificateNumber: new RegExp(`^${prefix}`) },
      { certificateNo: new RegExp(`^${prefix}`) }
    ]
  })
    .sort({ createdAt: -1 })
    .select("certificateNumber certificateNo");

  const latestNumber = latest?.certificateNumber || latest?.certificateNo || "";
  const current = Number(latestNumber.split("/").pop()) || 0;
  return `${prefix}${String(current + 1).padStart(4, "0")}`;
}

function certificatePayload(body) {
  return {
    studentName: body.studentName,
    studentId: body.studentId,
    courseName: body.courseName,
    batch: body.batch,
    issueDate: body.issueDate,
    pdfUrl: body.pdfUrl,
    downloadUrl: body.pdfUrl
  };
}

export const listCertificates = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const search = req.query.search;
  const filter = {};

  if (search) {
    filter.$or = [
      { studentName: new RegExp(search, "i") },
      { studentId: new RegExp(search, "i") },
      { certificateNumber: new RegExp(search, "i") },
      { certificateNo: new RegExp(search, "i") }
    ];
  }

  const [items, total] = await Promise.all([
    Certificate.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Certificate.countDocuments(filter)
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const getCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  if (!certificate) throw new ApiError(404, "Certificate not found");
  res.json(certificate);
});

export const createCertificate = asyncHandler(async (req, res) => {
  const certificateNumber = await nextCertificateNumber(req.body.issueDate);
  const certificate = await Certificate.create({
    ...certificatePayload(req.body),
    certificateNumber,
    certificateNo: certificateNumber,
    issuedBy: req.user?._id
  });
  res.status(201).json(certificate);
});

export const updateCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findByIdAndUpdate(req.params.id, certificatePayload(req.body), {
    new: true,
    runValidators: true
  });
  if (!certificate) throw new ApiError(404, "Certificate not found");
  res.json(certificate);
});

export const deleteCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findByIdAndDelete(req.params.id);
  if (!certificate) throw new ApiError(404, "Certificate not found");
  res.json({ message: "Deleted" });
});
