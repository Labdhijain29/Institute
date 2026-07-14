import { OfferLetter } from "../models/OfferLetter.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const numericFields = ["ctc", "basicSalary", "hra", "specialAllowance", "otherAllowance", "medicalAllowance", "travelAllowance", "conveyance", "bonus", "gratuity", "pf", "esi", "professionalTax", "grossSalary", "netSalary"];

function cleanNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function dateFilter(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { $gte: start, $lte: end };
}

async function nextOfferNumber(prefix = "EOL") {
  const year = new Date().getFullYear();
  const count = await OfferLetter.countDocuments({
    offerLetterNumber: new RegExp(`^${prefix}-${year}-`)
  });
  return `${prefix}-${year}-${String(count + 1).padStart(5, "0")}`;
}

async function nextEmployeeId() {
  const year = new Date().getFullYear();
  const count = await OfferLetter.countDocuments({
    employeeId: new RegExp(`^EMP-${year}-`)
  });
  return `EMP-${year}-${String(count + 1).padStart(5, "0")}`;
}

function salaryPayload(body) {
  const values = Object.fromEntries(numericFields.map((field) => [field, cleanNumber(body[field])]));
  const grossSalary = values.grossSalary || values.basicSalary + values.hra + values.specialAllowance + values.otherAllowance + values.medicalAllowance + values.travelAllowance + values.conveyance + values.bonus;
  const netSalary = values.netSalary || Math.max(grossSalary - values.pf - values.esi - values.professionalTax, 0);
  return { ...values, grossSalary, netSalary };
}

function offerPayload(body) {
  return {
    offerLetterNumber: body.offerLetterNumber,
    employeeId: body.employeeId,
    fullName: body.fullName,
    gender: body.gender,
    dateOfBirth: body.dateOfBirth,
    mobileNumber: body.mobileNumber,
    personalEmail: body.personalEmail,
    officialEmail: body.officialEmail,
    address: body.address,
    city: body.city,
    state: body.state,
    country: body.country,
    pincode: body.pincode,
    photograph: body.photograph,
    emergencyContact: body.emergencyContact,
    officialMobileNumber: body.officialMobileNumber,
    companyName: body.companyName,
    companyTagline: body.companyTagline,
    companyAddress: body.companyAddress,
    companyWebsite: body.companyWebsite,
    companyEmail: body.companyEmail,
    companyPhone: body.companyPhone,
    companySeal: body.companySeal,
    verificationUrl: body.verificationUrl,
    department: body.department,
    designation: body.designation,
    reportingManager: body.reportingManager,
    employmentType: body.employmentType,
    workLocation: body.workLocation,
    officeBranch: body.officeBranch,
    joiningDate: body.joiningDate,
    probationPeriod: body.probationPeriod,
    confirmationDate: body.confirmationDate,
    ...salaryPayload(body),
    workingDays: body.workingDays,
    workingHours: body.workingHours,
    shiftTiming: body.shiftTiming,
    officeTiming: body.officeTiming,
    lunchBreak: body.lunchBreak,
    weeklyOff: body.weeklyOff,
    noticePeriod: body.noticePeriod,
    leavePolicy: body.leavePolicy,
    attendancePolicy: body.attendancePolicy,
    lateComingPolicy: body.lateComingPolicy,
    dressCode: body.dressCode,
    codeOfConduct: body.codeOfConduct,
    confidentialityPolicy: body.confidentialityPolicy,
    dataPrivacyPolicy: body.dataPrivacyPolicy,
    companyPropertyPolicy: body.companyPropertyPolicy,
    conflictOfInterestPolicy: body.conflictOfInterestPolicy,
    terminationConditions: body.terminationConditions,
    resignationPolicy: body.resignationPolicy,
    salaryPaymentDate: body.salaryPaymentDate,
    aadhaarNumber: body.aadhaarNumber,
    panNumber: body.panNumber,
    passportNumber: body.passportNumber,
    bankName: body.bankName,
    accountNumber: body.accountNumber,
    ifscCode: body.ifscCode,
    uanNumber: body.uanNumber,
    esicNumber: body.esicNumber,
    uploadedDocuments: body.uploadedDocuments,
    issueDate: body.issueDate,
    validTill: body.validTill,
    acceptanceStatus: body.acceptanceStatus,
    hrPoliciesVersion: body.hrPoliciesVersion,
    generatedPdf: body.generatedPdf,
    emailSentAt: body.emailSentAt,
    viewedAt: body.viewedAt,
    acceptedAt: body.acceptedAt,
    rejectedAt: body.rejectedAt,
    companySignature: body.companySignature,
    hrSignature: body.hrSignature,
    directorSignature: body.directorSignature,
    employeeSignature: body.employeeSignature,
    signatureDate: body.signatureDate,
    signaturePlace: body.signaturePlace,
    rolesAndResponsibilities: body.rolesAndResponsibilities,
    termsAndConditions: body.termsAndConditions,
    remarks: body.remarks
  };
}

export const listOffers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "").trim();
  const filter = {};

  if (status) filter.acceptanceStatus = status;
  const joiningDate = dateFilter(req.query.joiningDate);
  if (joiningDate) filter.joiningDate = joiningDate;

  if (search) {
    filter.$or = [
      { fullName: new RegExp(search, "i") },
      { employeeId: new RegExp(search, "i") },
      { offerLetterNumber: new RegExp(search, "i") },
      { department: new RegExp(search, "i") },
      { designation: new RegExp(search, "i") },
      { acceptanceStatus: new RegExp(search, "i") }
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
  if (!offer) throw new ApiError(404, "Employee offer letter not found");
  res.json(offer);
});

export const createOffer = asyncHandler(async (req, res) => {
  const payload = offerPayload(req.body);
  payload.offerLetterNumber = payload.offerLetterNumber || await nextOfferNumber();
  payload.employeeId = payload.employeeId || await nextEmployeeId();
  payload.acceptanceStatus = payload.acceptanceStatus || "Generated";
  const offer = await OfferLetter.create({
    ...payload,
    createdBy: req.user?._id
  });
  res.status(201).json(offer);
});

export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await OfferLetter.findByIdAndUpdate(req.params.id, offerPayload(req.body), {
    new: true,
    runValidators: true
  });
  if (!offer) throw new ApiError(404, "Employee offer letter not found");
  res.json(offer);
});

export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await OfferLetter.findByIdAndDelete(req.params.id);
  if (!offer) throw new ApiError(404, "Employee offer letter not found");
  res.json({ message: "Deleted" });
});
