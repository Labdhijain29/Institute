import mongoose from "mongoose";
import { baseOptions, objectId } from "./shared.js";

const uploadedDocumentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    fileType: String,
    size: Number,
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const offerLetterSchema = new mongoose.Schema(
  {
    offerLetterNumber: { type: String, required: true, unique: true, trim: true },
    employeeId: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    gender: String,
    dateOfBirth: Date,
    mobileNumber: String,
    personalEmail: String,
    officialEmail: String,
    address: String,
    city: String,
    state: String,
    country: { type: String, default: "India" },
    pincode: String,
    photograph: String,
    emergencyContact: String,
    officialMobileNumber: String,

    companyName: String,
    companyTagline: String,
    companyAddress: String,
    companyWebsite: String,
    companyEmail: String,
    companyPhone: String,
    companySeal: String,
    verificationUrl: String,

    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    reportingManager: String,
    employmentType: {
      type: String,
      enum: ["Full Time", "Part Time", "Internship", "Contract", "Freelance"],
      default: "Full Time"
    },
    workLocation: String,
    officeBranch: String,
    joiningDate: { type: Date, required: true },
    probationPeriod: String,
    confirmationDate: Date,

    ctc: { type: Number, default: 0, min: 0 },
    basicSalary: { type: Number, default: 0, min: 0 },
    hra: { type: Number, default: 0, min: 0 },
    specialAllowance: { type: Number, default: 0, min: 0 },
    otherAllowance: { type: Number, default: 0, min: 0 },
    medicalAllowance: { type: Number, default: 0, min: 0 },
    travelAllowance: { type: Number, default: 0, min: 0 },
    conveyance: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    gratuity: { type: Number, default: 0, min: 0 },
    pf: { type: Number, default: 0, min: 0 },
    esi: { type: Number, default: 0, min: 0 },
    professionalTax: { type: Number, default: 0, min: 0 },
    grossSalary: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, default: 0, min: 0 },
    salaryPaymentDate: String,

    workingDays: String,
    workingHours: String,
    shiftTiming: String,
    officeTiming: String,
    lunchBreak: String,
    weeklyOff: String,
    noticePeriod: String,
    leavePolicy: String,
    attendancePolicy: String,
    lateComingPolicy: String,
    dressCode: String,
    codeOfConduct: String,
    confidentialityPolicy: String,
    dataPrivacyPolicy: String,
    companyPropertyPolicy: String,
    conflictOfInterestPolicy: String,
    terminationConditions: String,
    resignationPolicy: String,

    aadhaarNumber: String,
    panNumber: String,
    passportNumber: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    uanNumber: String,
    esicNumber: String,
    uploadedDocuments: {
      passportPhoto: uploadedDocumentSchema,
      aadhaar: uploadedDocumentSchema,
      panCard: uploadedDocumentSchema,
      resume: uploadedDocumentSchema,
      educationalCertificates: [uploadedDocumentSchema],
      experienceCertificates: [uploadedDocumentSchema],
      otherDocuments: [uploadedDocumentSchema]
    },

    issueDate: { type: Date, default: Date.now },
    validTill: Date,
    acceptanceStatus: {
      type: String,
      enum: ["Draft", "Generated", "Sent", "Viewed", "Accepted", "Rejected", "Expired"],
      default: "Draft"
    },
    hrPoliciesVersion: { type: String, default: "HR-POLICY-2026.1" },
    generatedPdf: String,
    emailSentAt: Date,
    viewedAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,
    companySignature: String,
    hrSignature: String,
    directorSignature: String,
    employeeSignature: String,
    signatureDate: Date,
    signaturePlace: String,
    rolesAndResponsibilities: String,
    termsAndConditions: String,
    remarks: String,
    createdBy: objectId("User")
  },
  baseOptions
);

export const OfferLetter = mongoose.model("OfferLetter", offerLetterSchema);
