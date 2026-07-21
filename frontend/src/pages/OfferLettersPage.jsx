import React, { useEffect, useMemo, useState } from "react";
import { Copy, Download, Edit3, Eye, FileText, Mail, Plus, Printer, Search, Send, Trash2, X } from "lucide-react";
import { createRoot } from "react-dom/client";
import { useDispatch, useSelector } from "react-redux";
import { OfferLetterModal } from "../components/OfferLetterModal.jsx";
import { OfferLetterPreview } from "../components/OfferLetterPreview.jsx";
import { createOffer, deleteOffer, fetchOffers, updateOffer } from "../store/offersSlice.js";
import { downloadOfferPdf } from "../utils/offerPdf.js";

const today = () => new Date().toLocaleDateString("en-CA");
const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-");
const statuses = ["Draft", "Generated", "Sent", "Viewed", "Accepted", "Rejected", "Expired"];
const employmentTypes = ["Full Time", "Part Time", "Internship", "Contract", "Freelance"];

const emptyOffer = {
  employeeId: "",
  fullName: "",
  gender: "",
  dateOfBirth: "",
  mobileNumber: "",
  personalEmail: "",
  officialEmail: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  photograph: "",
  emergencyContact: "",
  alternativeContactName: "",
  alternativeMobileNumber: "",
  officialMobileNumber: "",
  companyName: "Coding Walla",
  companyTagline: "From Learning to Earning",
  companyAddress: "1st Floor, 91, Ratna Lok Colony RD, Near Medanta Hospital, Vijay Nagar, Indore, MP, 452010",
  companyWebsite: "www.codingwallah.com",
  companyEmail: "info@codingwallah.com",
  companyPhone: "+91 9098875825",
  companySeal: "Coding Walla",
  verificationUrl: "https://www.codingwallah.com/verify-offer",
  department: "",
  designation: "",
  reportingManager: "",
  employmentType: "Full Time",
  workLocation: "",
  officeBranch: "Indore",
  joiningDate: today(),
  probationPeriod: "6 months",
  confirmationDate: "",
  ctc: 0,
  basicSalary: 0,
  hra: 0,
  specialAllowance: 0,
  otherAllowance: 0,
  medicalAllowance: 0,
  travelAllowance: 0,
  conveyance: 0,
  bonus: 0,
  gratuity: 0,
  pf: 0,
  esi: 0,
  professionalTax: 0,
  grossSalary: 0,
  netSalary: 0,
  salaryPaymentDate: "7th of every month",
  workingDays: "Monday to Saturday",
  workingHours: "9 hours per day",
  shiftTiming: "Day Shift",
  officeTiming: "10:00 AM to 7:00 PM",
  lunchBreak: "1:30 PM to 2:00 PM",
  weeklyOff: "Sunday",
  noticePeriod: "30 days",
  leavePolicy: "Leave must be requested through approved channels and is subject to manager and HR approval.",
  attendancePolicy: "Daily attendance and punctuality are mandatory and form part of payroll and performance records.",
  lateComingPolicy: "Repeated late arrival may result in attendance adjustment or disciplinary action as per company policy.",
  dressCode: "Employees must maintain professional attire and grooming appropriate to their role.",
  codeOfConduct: "Employees must act with integrity, respect, professionalism, and comply with lawful company instructions.",
  confidentialityPolicy: "All company, client, employee, and business information must remain confidential.",
  dataPrivacyPolicy: "Company systems, credentials, personal data, and business records must be handled securely.",
  companyPropertyPolicy: "All company property must be used responsibly and returned upon request or separation.",
  conflictOfInterestPolicy: "Any actual or potential conflict of interest must be disclosed immediately.",
  terminationConditions: "Employment may be terminated for misconduct, poor performance, policy breach, or business requirements.",
  resignationPolicy: "Resignation must be submitted in writing and the applicable notice period must be served.",
  aadhaarNumber: "",
  panNumber: "",
  passportNumber: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  uanNumber: "",
  esicNumber: "",
  issueDate: today(),
  validTill: "",
  acceptanceStatus: "Generated",
  hrPoliciesVersion: "HR-POLICY-2026.1",
  rolesAndResponsibilities: "",
  termsAndConditions: "",
  companySignature: "Coding Walla",
  hrSignature: "HR Manager",
  directorSignature: "Director",
  employeeSignature: "",
  signatureDate: "",
  signaturePlace: "Indore",
  remarks: ""
};

const inputClass = "mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10";
const buttonClass = "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-bold text-white hover:bg-[#111315]";
const secondaryClass = "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-[#f97316] hover:bg-[#fff3e8] hover:text-[#c2410c]";

function autoSalary(form) {
  const grossSalary = Number(form.grossSalary || 0) || Number(form.basicSalary || 0) + Number(form.hra || 0) + Number(form.specialAllowance || 0) + Number(form.otherAllowance || 0) + Number(form.medicalAllowance || 0) + Number(form.travelAllowance || 0) + Number(form.conveyance || 0) + Number(form.bonus || 0);
  const netSalary = Number(form.netSalary || 0) || Math.max(grossSalary - Number(form.pf || 0) - Number(form.esi || 0) - Number(form.professionalTax || 0), 0);
  return { grossSalary, netSalary };
}

export function OfferLettersPage() {
  const dispatch = useDispatch();
  const { items, loading, saving, error } = useSelector((state) => state.offers);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyOffer);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    dispatch(fetchOffers());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const text = query.trim().toLocaleLowerCase("en-IN");
    return items.filter((offer) => {
      const matchesStatus = status === "All" || offer.acceptanceStatus === status;
      const matchesSearch = !text || [offer.fullName, offer.employeeId, offer.department, offer.designation, offer.acceptanceStatus, offer.offerLetterNumber, offer.joiningDate].some((value) => String(value || "").toLocaleLowerCase("en-IN").includes(text));
      return matchesStatus && matchesSearch;
    });
  }, [items, query, status]);

  const stats = useMemo(() => ({
    total: items.length,
    draft: items.filter((item) => item.acceptanceStatus === "Draft").length,
    pending: items.filter((item) => ["Generated", "Sent", "Viewed"].includes(item.acceptanceStatus)).length,
    accepted: items.filter((item) => item.acceptanceStatus === "Accepted").length,
    rejected: items.filter((item) => item.acceptanceStatus === "Rejected").length,
    expired: items.filter((item) => item.acceptanceStatus === "Expired").length
  }), [items]);

  async function generateOffer(event) {
    event.preventDefault();
    setMessage("");
    const salary = autoSalary(form);
    const created = await dispatch(createOffer({ ...form, ...salary, emergencyContact: `${form.alternativeContactName} | ${form.alternativeMobileNumber}`, department: form.department || "Not Specified" })).unwrap();
    setForm(emptyOffer);
    setGenerateOpen(false);
    setSelected(created);
    setMessage("Employee offer letter generated successfully");
  }

  async function removeOffer(offer) {
    if (!window.confirm(`Delete offer letter for ${offer.fullName}?`)) return;
    await dispatch(deleteOffer(offer._id)).unwrap();
    setMessage("Employee offer letter deleted");
  }

  async function changeStatus(offer, nextStatus) {
    const timestamp = nextStatus === "Sent" ? { emailSentAt: new Date().toISOString() } : nextStatus === "Accepted" ? { acceptedAt: new Date().toISOString() } : nextStatus === "Rejected" ? { rejectedAt: new Date().toISOString() } : {};
    await dispatch(updateOffer({ id: offer._id, values: { ...offer, acceptanceStatus: nextStatus, ...timestamp } })).unwrap();
    setMessage(`Offer status updated to ${nextStatus}`);
  }

  async function duplicateOffer(offer) {
    const duplicate = { ...offer, _id: undefined, offerLetterNumber: "", employeeId: "", fullName: `${offer.fullName} Copy`, acceptanceStatus: "Draft", issueDate: today() };
    const created = await dispatch(createOffer(duplicate)).unwrap();
    setSelected(created);
    setMessage("Offer letter duplicated");
  }

  async function quickPdf(offer) {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<OfferLetterPreview offer={offer} />);
    setTimeout(async () => {
      await downloadOfferPdf(container.firstChild, offer);
      root.unmount();
      container.remove();
    }, 100);
  }

  function quickPrint(offer) {
    setSelected(offer);
    setTimeout(() => window.print(), 100);
  }

  return (
    <div className="space-y-5">
      <section className="no-print rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[#f97316]">HR Document Management</p>
            <h2 className="mt-1 text-2xl font-black">Employee Offer Letter Dashboard</h2>
            <p className="mt-1 text-sm text-slate-500">Generate, track, print and download professional employee offer letters.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setGenerateOpen(true)} className={buttonClass}><Plus size={17} /> Generate New Offer Letter</button>
            <button onClick={() => window.print()} className={secondaryClass}><Printer size={16} /> Print Offer Letter</button>
          </div>
        </div>
      </section>

      {(message || error) && <p className="no-print rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{error || message}</p>}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Stat label="Total Offer Letters" value={stats.total} />
        <Stat label="Draft Offers" value={stats.draft} />
        <Stat label="Pending Acceptance" value={stats.pending} />
        <Stat label="Accepted Offers" value={stats.accepted} tone="green" />
        <Stat label="Rejected Offers" value={stats.rejected} tone="red" />
        <Stat label="Expired Offers" value={stats.expired} tone="amber" />
      </section>

      <section className="no-print rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <div className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 focus-within:border-[#f97316]">
            <Search size={16} className="text-slate-400" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Search by employee name, ID, department, designation, status or joining date" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <select className={inputClass.replace("mt-1 ", "")} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button onClick={() => dispatch(fetchOffers(query))} className={secondaryClass}><Eye size={16} /> View Offer Letters</button>
        </div>
      </section>

      <div className="table-wrap rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Employee</th>
              <th className="px-4 py-3 font-semibold">Employee ID</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 font-semibold">Designation</th>
              <th className="px-4 py-3 font-semibold">Joining Date</th>
              <th className="px-4 py-3 font-semibold">CTC</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((offer) => (
              <tr key={offer._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-black">{offer.fullName}</td>
                <td className="px-4 py-3">{offer.employeeId}</td>
                <td className="px-4 py-3">{offer.department}</td>
                <td className="px-4 py-3">{offer.designation}</td>
                <td className="px-4 py-3">{date(offer.joiningDate)}</td>
                <td className="px-4 py-3 font-bold">{money(offer.ctc)}</td>
                <td className="px-4 py-3"><StatusBadge status={offer.acceptanceStatus} /></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <IconButton title="Preview" onClick={() => setSelected(offer)} icon={Eye} />
                    <IconButton title="Edit" onClick={() => setSelected(offer)} icon={Edit3} />
                    <IconButton title="Download PDF" onClick={() => quickPdf(offer)} icon={Download} />
                    <IconButton title="Print" onClick={() => quickPrint(offer)} icon={Printer} />
                    <IconButton title="Duplicate" onClick={() => duplicateOffer(offer)} icon={Copy} />
                    <IconButton title="Send via Email" onClick={() => changeStatus(offer, "Sent")} icon={Mail} />
                    <IconButton title="Track Status" onClick={() => changeStatus(offer, offer.acceptanceStatus === "Accepted" ? "Viewed" : "Accepted")} icon={Send} />
                    <IconButton title="Delete" onClick={() => removeOffer(offer)} icon={Trash2} danger />
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                  {loading ? "Loading employee offer letters..." : "No employee offer letters found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <GenerateOfferModal open={generateOpen} form={form} setForm={setForm} saving={saving} onSubmit={generateOffer} onClose={() => setGenerateOpen(false)} />
      <OfferLetterModal open={Boolean(selected)} offer={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function GenerateOfferModal({ open, form, setForm, saving, onSubmit, onClose }) {
  if (!open) return null;
  const salary = autoSalary(form);
  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#111315]/50 p-3">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
          <div>
            <h2 className="text-lg font-black">Generate Employee Offer Letter</h2>
            <p className="text-sm text-slate-500">Employee details, employment terms, salary structure and HR policies.</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close modal"><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-5 p-4">
          <FormSection title="Employee Information">
            <Field required label="Full Name" value={form.fullName} onChange={(value) => setValue("fullName", value)} />
            <SelectField label="Gender" value={form.gender} onChange={(value) => setValue("gender", value)} options={["", "Male", "Female", "Other"]} />
            <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(value) => setValue("dateOfBirth", value)} />
            <Field label="Mobile Number" value={form.mobileNumber} onChange={(value) => setValue("mobileNumber", value)} />
            <Field label="Personal Email" type="email" value={form.personalEmail} onChange={(value) => setValue("personalEmail", value)} />
            <Field label="Official Mobile Number" value={form.officialMobileNumber} onChange={(value) => setValue("officialMobileNumber", value)} />
            <Field required wide textarea label="Employee Address" value={form.address} onChange={(value) => setValue("address", value)} />
            <Field label="City" value={form.city} onChange={(value) => setValue("city", value)} />
            <Field label="State" value={form.state} onChange={(value) => setValue("state", value)} />
            <Field label="Country" value={form.country} onChange={(value) => setValue("country", value)} />
            <Field label="Pincode" value={form.pincode} onChange={(value) => setValue("pincode", value)} />
          </FormSection>

          <FormSection title="Alternative Contact">
            <Field required label="Alternative Contact Name" value={form.alternativeContactName} onChange={(value) => setValue("alternativeContactName", value)} />
            <Field required label="Alternative Mobile Number" type="tel" pattern="[6-9][0-9]{9}" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number" value={form.alternativeMobileNumber} onChange={(value) => setValue("alternativeMobileNumber", value.replace(/\D/g, "").slice(0, 10))} />
          </FormSection>

          <FormSection title="Company Information">
            <Field label="Company Name" value={form.companyName} onChange={(value) => setValue("companyName", value)} />
            <Field label="Tagline" value={form.companyTagline} onChange={(value) => setValue("companyTagline", value)} />
            <Field wide label="Registered Office Address" value={form.companyAddress} onChange={(value) => setValue("companyAddress", value)} />
            <Field label="Website" value={form.companyWebsite} onChange={(value) => setValue("companyWebsite", value)} />
            <Field label="Email" type="email" value={form.companyEmail} onChange={(value) => setValue("companyEmail", value)} />
            <Field label="Phone Number" value={form.companyPhone} onChange={(value) => setValue("companyPhone", value)} />
            <Field label="Company Seal" value={form.companySeal} onChange={(value) => setValue("companySeal", value)} />
            <Field wide label="Verification URL" value={form.verificationUrl} onChange={(value) => setValue("verificationUrl", value)} />
          </FormSection>

          <FormSection title="Employment Information">
            <Field required label="Designation" value={form.designation} onChange={(value) => setValue("designation", value)} />
            <Field label="Reporting Manager" value={form.reportingManager} onChange={(value) => setValue("reportingManager", value)} />
            <SelectField label="Employment Type" value={form.employmentType} onChange={(value) => setValue("employmentType", value)} options={employmentTypes} />
            <SelectField required label="Work Location" value={form.workLocation} onChange={(value) => setValue("workLocation", value)} options={["", "Head Office", "Branch Office", "Client Location", "Remote"]} />
            <Field label="Office Branch" value={form.officeBranch} onChange={(value) => setValue("officeBranch", value)} />
            <Field required label="Joining Date" type="date" value={form.joiningDate} onChange={(value) => setValue("joiningDate", value)} />
            <SelectField label="Status" value={form.acceptanceStatus} onChange={(value) => setValue("acceptanceStatus", value)} options={statuses} />
          </FormSection>

          <FormSection title="Salary Details">
            {["ctc", "basicSalary", "hra", "specialAllowance", "otherAllowance", "medicalAllowance", "travelAllowance", "conveyance", "bonus", "gratuity", "pf", "esi", "professionalTax"].map((key) => (
              <Field key={key} label={labelize(key)} type="number" value={form[key]} onChange={(value) => setValue(key, Number(value))} />
            ))}
            <Field required label="Salary" type="number" min="0" value={salary.grossSalary} onChange={(value) => setValue("grossSalary", Number(value))} />
            <Field label="Net Salary" type="number" value={salary.netSalary} onChange={(value) => setValue("netSalary", Number(value))} />
            <Field label="Salary Payment Date" value={form.salaryPaymentDate} onChange={(value) => setValue("salaryPaymentDate", value)} />
          </FormSection>

          <FormSection title="Working Details">
            <Field label="Working Days" value={form.workingDays} onChange={(value) => setValue("workingDays", value)} />
            <Field label="Working Hours" value={form.workingHours} onChange={(value) => setValue("workingHours", value)} />
            <Field label="Shift Timing" value={form.shiftTiming} onChange={(value) => setValue("shiftTiming", value)} />
            <Field label="Office Timing" value={form.officeTiming} onChange={(value) => setValue("officeTiming", value)} />
            <Field label="Lunch Break" value={form.lunchBreak} onChange={(value) => setValue("lunchBreak", value)} />
            <Field label="Weekly Off" value={form.weeklyOff} onChange={(value) => setValue("weeklyOff", value)} />
          </FormSection>

          <FormSection title="HR Policies">
            {["leavePolicy", "attendancePolicy", "lateComingPolicy", "dressCode", "codeOfConduct", "confidentialityPolicy", "dataPrivacyPolicy", "companyPropertyPolicy", "conflictOfInterestPolicy", "terminationConditions", "resignationPolicy"].map((key) => (
              <Field key={key} wide label={labelize(key)} textarea value={form[key]} onChange={(value) => setValue(key, value)} />
            ))}
          </FormSection>

          <FormSection title="Documents Required">
            <Field label="Aadhaar Number" value={form.aadhaarNumber} onChange={(value) => setValue("aadhaarNumber", value)} />
            <Field label="PAN Number" value={form.panNumber} onChange={(value) => setValue("panNumber", value)} />
            <Field label="Bank Name" value={form.bankName} onChange={(value) => setValue("bankName", value)} />
            <Field label="Account Number" value={form.accountNumber} onChange={(value) => setValue("accountNumber", value)} />
            <Field label="IFSC Code" value={form.ifscCode} onChange={(value) => setValue("ifscCode", value)} />
          </FormSection>

          <FormSection title="Remarks">
            <Field wide label="Remarks" textarea value={form.remarks} onChange={(value) => setValue("remarks", value)} />
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button>
            <button disabled={saving} className="rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315] disabled:opacity-60">
              {saving ? "Generating..." : "Generate Offer Letter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "orange" }) {
  const colors = {
    orange: "border-[#f97316]/25 bg-[#fff3e8] text-[#c2410c]",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700"
  };
  return <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-3 text-2xl font-black">{value}</p><span className={`mt-3 inline-flex rounded-full border px-2 py-1 text-xs font-black ${colors[tone]}`}>Live</span></div>;
}

function StatusBadge({ status }) {
  const tones = {
    Draft: "border-slate-200 bg-slate-50 text-slate-700",
    Generated: "border-sky-200 bg-sky-50 text-sky-700",
    Sent: "border-orange-200 bg-[#fff3e8] text-[#c2410c]",
    Viewed: "border-violet-200 bg-violet-50 text-violet-700",
    Accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Rejected: "border-rose-200 bg-rose-50 text-rose-700",
    Expired: "border-amber-200 bg-amber-50 text-amber-700"
  };
  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${tones[status] || tones.Draft}`}>{status || "Draft"}</span>;
}

function IconButton({ title, onClick, icon: Icon, danger = false }) {
  return <button onClick={onClick} className={`rounded-md border border-slate-200 p-2 hover:bg-slate-50 ${danger ? "text-rose-600" : "text-slate-700"}`} title={title}><Icon size={16} /></button>;
}

function FormSection({ title, children }) {
  return <section className="rounded-lg border border-slate-200 p-4"><h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase text-[#c2410c]"><FileText size={16} /> {title}</h3><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div></section>;
}

function Field({ label, value, onChange, type = "text", textarea = false, required = false, wide = false, placeholder = "", ...inputProps }) {
  return (
    <label className={`block text-sm ${wide ? "md:col-span-2 xl:col-span-3" : ""}`}>
      <span className="font-semibold text-slate-600">{label}{required && <span className="text-red-600"> *</span>}</span>
      {textarea ? (
        <textarea required={required} className={`${inputClass} h-24 pt-2`} value={value || ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input required={required} type={type} className={inputClass} value={value ?? ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} {...inputProps} />
      )}
    </label>
  );
}

function SelectField({ label, value, onChange, options, required = false }) {
  return <label className="block text-sm"><span className="font-semibold text-slate-600">{label}{required && <span className="text-red-600"> *</span>}</span><select required={required} className={inputClass} value={value || ""} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option || "Select"}</option>)}</select></label>;
}

function labelize(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()).replace("Ctc", "CTC").replace("Hra", "HRA").replace("Pf", "PF").replace("Esi", "ESI");
}
