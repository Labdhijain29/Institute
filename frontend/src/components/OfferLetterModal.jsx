import React, { useEffect, useRef, useState } from "react";
import { Download, Edit3, Printer, Save, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateOffer } from "../store/offersSlice.js";
import { downloadOfferPdf } from "../utils/offerPdf.js";
import { OfferLetterPreview } from "./OfferLetterPreview.jsx";

const editableGroups = [
  {
    title: "Basic Information",
    fields: [
      ["fullName", "Employee Name", "text"],
      ["employeeId", "Employee ID", "text"],
      ["offerLetterNumber", "Offer Letter Number", "text"],
      ["acceptanceStatus", "Acceptance Status", "select"],
      ["issueDate", "Issue Date", "date"],
      ["validTill", "Offer Valid Till", "date"]
    ]
  },
  {
    title: "Employee Details",
    fields: [
      ["photograph", "Photograph URL", "text"],
      ["gender", "Gender", "text"],
      ["dateOfBirth", "Date of Birth", "date"],
      ["personalEmail", "Personal Email", "email"],
      ["officialEmail", "Official Email", "email"],
      ["officialMobileNumber", "Official Mobile Number", "text"],
      ["mobileNumber", "Phone Number", "text"],
      ["address", "Address", "textarea"],
      ["city", "City", "text"],
      ["state", "State", "text"],
      ["country", "Country", "text"],
      ["pincode", "Pincode", "text"],
      ["emergencyContact", "Emergency Contact", "text"]
    ]
  },
  {
    title: "Company Information",
    fields: [
      ["companyName", "Company Name", "text"],
      ["companyTagline", "Tagline", "text"],
      ["companyAddress", "Registered Office Address", "textarea"],
      ["companyWebsite", "Website", "text"],
      ["companyEmail", "Email", "email"],
      ["companyPhone", "Phone Number", "text"],
      ["verificationUrl", "Verification URL", "text"],
      ["companySeal", "Company Seal", "text"]
    ]
  },
  {
    title: "Employment Details",
    fields: [
      ["department", "Department", "text"],
      ["designation", "Designation", "text"],
      ["reportingManager", "Reporting Manager", "text"],
      ["employmentType", "Employment Type", "select"],
      ["workLocation", "Office Location", "text"],
      ["officeBranch", "Branch", "text"],
      ["joiningDate", "Joining Date", "date"],
      ["probationPeriod", "Probation Period", "text"],
      ["confirmationDate", "Confirmation Date", "date"],
      ["noticePeriod", "Notice Period", "text"],
      ["workingDays", "Working Days", "text"],
      ["workingHours", "Working Hours", "text"],
      ["officeTiming", "Office Timing", "text"],
      ["lunchBreak", "Lunch Break", "text"],
      ["shiftTiming", "Shift Timing", "text"]
    ]
  },
  {
    title: "Salary Details",
    fields: [
      ["ctc", "Annual CTC", "number"],
      ["basicSalary", "Basic Salary", "number"],
      ["hra", "HRA", "number"],
      ["specialAllowance", "Special Allowance", "number"],
      ["otherAllowance", "Other Allowance", "number"],
      ["medicalAllowance", "Medical Allowance", "number"],
      ["travelAllowance", "Travel Allowance", "number"],
      ["conveyance", "Conveyance Allowance", "number"],
      ["bonus", "Bonus", "number"],
      ["gratuity", "Gratuity", "number"],
      ["pf", "PF", "number"],
      ["esi", "ESI", "number"],
      ["professionalTax", "Professional Tax", "number"],
      ["grossSalary", "Gross Salary", "number"],
      ["netSalary", "Net Salary", "number"],
      ["salaryPaymentDate", "Salary Payment Date", "text"]
    ]
  },
  {
    title: "HR Policies",
    fields: [
      ["hrPoliciesVersion", "HR Policies Version", "text"],
      ["leavePolicy", "Leave Policy", "textarea"],
      ["attendancePolicy", "Attendance Policy", "textarea"],
      ["lateComingPolicy", "Late Coming Policy", "textarea"],
      ["dressCode", "Dress Code", "textarea"],
      ["codeOfConduct", "Code of Conduct", "textarea"],
      ["confidentialityPolicy", "Confidentiality", "textarea"],
      ["dataPrivacyPolicy", "Data Privacy", "textarea"],
      ["companyPropertyPolicy", "Company Property", "textarea"],
      ["conflictOfInterestPolicy", "Conflict of Interest", "textarea"],
      ["terminationConditions", "Termination Conditions", "textarea"],
      ["resignationPolicy", "Resignation Policy", "textarea"]
    ]
  },
  {
    title: "Terms",
    fields: [
      ["rolesAndResponsibilities", "Roles & Responsibilities", "textarea"],
      ["termsAndConditions", "Terms & Conditions", "textarea"]
    ]
  },
  {
    title: "Remarks",
    fields: [["remarks", "Remarks", "textarea"]]
  },
  {
    title: "Signatures",
    fields: [
      ["companySignature", "Authorized Signatory", "text"],
      ["hrSignature", "HR Manager Signature", "text"],
      ["reportingManager", "Reporting Manager Signature", "text"],
      ["directorSignature", "Director Signature", "text"],
      ["employeeSignature", "Employee Signature", "text"],
      ["signatureDate", "Acceptance Date", "date"],
      ["signaturePlace", "Place", "text"]
    ]
  }
];

const statuses = ["Draft", "Generated", "Sent", "Viewed", "Accepted", "Rejected", "Expired"];
const employmentTypes = ["Full Time", "Part Time", "Internship", "Contract", "Freelance"];
const dateValue = (value) => value?.slice?.(0, 10) || "";
const dateFields = new Set(["dateOfBirth", "issueDate", "validTill", "joiningDate", "confirmationDate", "signatureDate"]);

export function OfferLetterModal({ open, offer, onClose }) {
  const dispatch = useDispatch();
  const { saving } = useSelector((state) => state.offers);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const printRef = useRef(null);

  useEffect(() => {
    if (!offer) return;
    const next = {};
    editableGroups.forEach((group) => {
      group.fields.forEach(([key]) => {
        next[key] = dateFields.has(key) ? dateValue(offer[key]) : offer[key] ?? "";
      });
    });
    next.acceptanceStatus = offer.acceptanceStatus || "Generated";
    next.employmentType = offer.employmentType || "Full Time";
    setForm(next);
    setEditing(true);
  }, [offer]);

  if (!open || !offer) return null;

  const preview = { ...offer, ...form };

  function printOffer() {
    window.print();
  }

  async function save() {
    await dispatch(updateOffer({ id: offer._id, values: form })).unwrap();
    setEditing(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 p-3 print:static print:bg-white print:p-0">
      <div className="mx-auto grid h-[94vh] max-w-6xl overflow-hidden rounded-lg bg-white shadow-soft lg:grid-cols-[1fr_360px] print:block print:h-auto print:max-w-none print:rounded-none print:shadow-none">
        <section className="min-h-0 overflow-y-auto bg-slate-100 p-4 print:overflow-visible print:bg-white print:p-0">
          <div ref={printRef}>
            <OfferLetterPreview offer={preview} />
          </div>
        </section>

        <aside className="no-print min-h-0 overflow-y-auto border-l border-slate-200 bg-white">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Employee Offer Letter</h2>
                <p className="text-sm text-slate-500">{offer.employeeId || offer.offerLetterNumber}</p>
              </div>
              <button onClick={onClose} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close offer letter">
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={printOffer} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <Printer size={16} /> Print
              </button>
              <button onClick={() => downloadOfferPdf(printRef.current, preview)} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <Download size={16} /> PDF
              </button>
              <button onClick={() => setEditing((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-3 py-2 text-sm font-semibold text-white hover:bg-[#111315]">
                <Edit3 size={16} /> Edit
              </button>
              <button onClick={save} disabled={!editing || saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111315] px-3 py-2 text-sm font-semibold text-white hover:bg-[#f97316] disabled:opacity-50">
                <Save size={16} /> Save
              </button>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <h3 className="text-xs font-black uppercase text-slate-500">Editable Fields</h3>
            {editableGroups.map((group) => (
              <section key={group.title} className="rounded-lg border border-slate-200 p-3">
                <h4 className="mb-3 text-xs font-black uppercase text-[#f97316]">{group.title}</h4>
                <div className="space-y-3">
                  {group.fields.map(([key, label, type]) => (
                    <EditableField key={key} fieldKey={key} label={label} type={type} editing={editing} form={form} setForm={setForm} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function EditableField({ fieldKey, label, type, editing, form, setForm }) {
  const value = form[fieldKey] ?? "";
  const setValue = (nextValue) => setForm((current) => ({ ...current, [fieldKey]: type === "number" ? Number(nextValue) : nextValue }));

  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-600">{label}</span>
      {type === "textarea" ? (
        <textarea
          disabled={!editing}
          className="mt-1 min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#f97316] disabled:bg-slate-50"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      ) : type === "select" ? (
        <select
          disabled={!editing}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#f97316] disabled:bg-slate-50"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        >
          {(fieldKey === "acceptanceStatus" ? statuses : employmentTypes).map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : (
        <input
          disabled={!editing}
          type={type}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#f97316] disabled:bg-slate-50"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
    </label>
  );
}
