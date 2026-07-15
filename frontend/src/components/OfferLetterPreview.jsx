import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { BrandLockup, brandLogo } from "./BrandLogo.jsx";

const defaults = {
  name: "Coding Walla",
  tagline: "From Learning to Earning",
  address: "1nd Floor, 91, Ratna Lok Colony RD, Near Medanta Hospital, Vijay Nagar, Indore, MP, 452010",
  phone: "+91 9098875825",
  email: "info@codingwallah.com",
  website: "www.codingwallah.com"
};

const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "-";
const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const value = (input, fallback = "-") => input || fallback;

export function OfferLetterPreview({ offer = {} }) {
  return (
    <article id="offer-letter-print-area" className="offer-letter-document mx-auto space-y-6 text-[#111315]">
      <OfferPage offer={offer} page={1}><AppointmentLetter offer={offer} /></OfferPage>
      <OfferPage offer={offer} page={2}><EmploymentDetailsLetter offer={offer} /></OfferPage>
    </article>
  );
}

function OfferPage({ offer, page, children }) {
  return (
    <section className="offer-letter-page relative overflow-hidden bg-white shadow-sm">
      <img src={brandLogo} alt="" className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.025]" />
      <div className="relative z-10 flex min-h-full flex-col">
        <OfferHeader offer={offer} />
        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-7">{children}</main>
        <OfferFooter offer={offer} page={page} />
      </div>
    </section>
  );
}

function OfferHeader({ offer }) {
  const company = companyDetails(offer);
  return (
    <header className="border-b-2 border-[#f97316] bg-black px-5 py-5 sm:px-8 lg:px-12">
      <div className="grid items-start gap-4 sm:grid-cols-2 sm:gap-8">
        <BrandLockup logoClassName="h-14 w-auto" variant="dark" className="self-start" />
        <div className="text-left text-[10px] leading-4 text-white sm:text-right">
          <p className="font-bold text-white">Registered Office</p>
          <p>{company.address}</p>
          <p className="mt-1 font-semibold">{company.phone} · {company.email}</p>
          <p className="font-semibold">{company.website}</p>
        </div>
      </div>
    </header>
  );
}

function AppointmentLetter({ offer }) {
  const company = companyDetails(offer);
  return (
    <div className="text-[13px] leading-6 text-slate-700">
      <DocumentMeta offer={offer} />
      <div className="mt-7">
        <p className="font-bold text-[#0f172a]">{value(offer.fullName, "Employee Name")}</p>
        <p className="max-w-md whitespace-pre-line">{value(offer.address, "Employee Address")}</p>
      </div>

      <p className="mt-6">Dear <strong>{value(offer.fullName, "Employee Name")}</strong>,</p>
      <h1 className="mt-5 border-y border-slate-300 py-2 text-center text-base font-black uppercase text-[#0f172a]">Subject: Offer of Employment</h1>

      <div className="mt-5 space-y-4 text-justify">
        <p>Congratulations! We are pleased to offer you an appointment in our organisation as <strong>{value(offer.designation, "Designation")}</strong>. Your initial posting will be at <strong>{value(offer.workLocation, "Work Location")}</strong>, under the employment type <strong>{value(offer.employmentType, "Full Time")}</strong>.</p>
        <p>You will report to <strong>{value(offer.reportingManager, "the assigned Reporting Manager")}</strong>. The proposed remuneration and benefits for the position offered are enclosed on page 2.</p>
        <p>This offer of employment is subject to:</p>
        <ol className="list-[upper-alpha] space-y-2 pl-7">
          <li>Verification of the documents and references submitted by you to {company.name}.</li>
          <li>Your acceptance of this offer along with the stated terms, conditions, confidentiality obligations, and company policies.</li>
        </ol>
        <p>You are required to join us latest by <strong>{date(offer.joiningDate)}</strong>, failing which the offer shall stand withdrawn automatically unless otherwise communicated to you in writing.</p>
        <p>Please sign and return a duplicate copy of this letter as confirmation of your acceptance within seven days from the issue date.</p>
        <p>We welcome you and wish you a long and successful career with us.</p>
      </div>

      <div className="mt-7 grid gap-8 sm:grid-cols-2 sm:gap-10">
        <div><p>With Best Wishes,</p><p>Yours sincerely,</p><p className="mt-1 font-black">For {company.name.toUpperCase()}</p><p className="mt-8 font-serif text-lg italic text-[#f97316]">{value(offer.hrSignature, "HR Manager")}</p><p className="border-t border-slate-400 pt-1 text-xs font-bold">Talent Acquisition Manager / Authorized Signatory</p></div>
        <VerificationQr offer={offer} />
      </div>

      <section className="mt-7 border-t-2 border-[#0f172a] pt-4">
        <h2 className="text-center text-sm font-black tracking-wide text-[#0f172a]">ACKNOWLEDGEMENT</h2>
        <p className="mt-3">I have read all the terms and conditions of the offer of employment and confirm my acceptance. I agree to join the organization on the mentioned date.</p>
        <div className="mt-8 grid gap-6 text-xs sm:grid-cols-3"><Signature label="Employee Signature" value={offer.employeeSignature} /><Signature label="Place" value={offer.signaturePlace} /><Signature label="Date" value={date(offer.signatureDate)} /></div>
      </section>
    </div>
  );
}

function EmploymentDetailsLetter({ offer }) {
  const monthlyGross = Number(offer.grossSalary || 0) || Number(offer.basicSalary || 0) + Number(offer.hra || 0) + Number(offer.specialAllowance || 0) + Number(offer.bonus || 0) + Number(offer.pf || 0) + Number(offer.gratuity || 0);
  const salaryRows = [
    ["Basic Pay", offer.basicSalary], ["HRA", offer.hra], ["Special Allowance", offer.specialAllowance],
    ["Performance Bonus", offer.bonus], ["Provident Fund (Institute)", offer.pf], ["Gratuity", offer.gratuity]
  ];
  return (
    <div className="text-[12px] leading-5 text-slate-700">
      <DocumentMeta offer={offer} compact />
      <h1 className="mt-5 text-center text-xl font-black uppercase text-[#0f172a]">Employment Details</h1>
      <table className="mt-5 w-full border-collapse">
        <tbody>{[["Name", offer.fullName], ["Employee ID", offer.employeeId], ["Designation", offer.designation], ["Location", offer.workLocation], ["Joining Date", date(offer.joiningDate)]].map(([label, entry]) => <tr key={label}><th className="w-40 border border-slate-300 bg-slate-50 px-3 py-2 text-left">{label}</th><td className="border border-slate-300 px-3 py-2 font-semibold text-[#0f172a]">{value(entry)}</td></tr>)}</tbody>
      </table>

      <table className="mt-6 w-full border-collapse">
        <thead className="bg-[#0f172a] text-white"><tr><th className="border border-[#0f172a] px-4 py-3 text-left">Payroll</th><th className="border border-slate-600 px-4 py-3 text-right">Rs. (Per Month)</th><th className="border border-slate-600 px-4 py-3 text-right">Rs. (Per Annum)</th></tr></thead>
        <tbody>
          {salaryRows.map(([label, entry]) => <SalaryRow key={label} label={label} monthly={entry} />)}
          <SalaryRow label="Gross Fixed Salary" monthly={monthlyGross} annual={offer.ctc || monthlyGross * 12} total />
          <SalaryRow label="Net Salary" monthly={offer.netSalary} total accent />
        </tbody>
      </table>

      <div className="mt-6 space-y-3 text-justify">
        <p>Institute contribution towards Provident Fund, Gratuity and/or any other statutory benefit is in accordance with applicable laws from time to time.</p>
        <p>Performance bonus is governed by policies and conditions prevalent from time to time.</p>
        <p className="font-black text-[#0f172a]">Note:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>The gross fixed salary does not include mobile and travel reimbursements or health insurance, which apply as per the prevalent company scheme.</li>
          <li>The designation may change depending upon work assignment and organizational requirements.</li>
          <li>Your compensation may be restructured while protecting the applicable gross salary.</li>
          <li>Group Mediclaim, where applicable, covers eligible dependants according to company policy.</li>
          <li>Working schedule: {value(offer.workingDays)}, {value(offer.officeTiming)}; lunch break {value(offer.lunchBreak)}; weekly off {value(offer.weeklyOff)}.</li>
        </ul>
      </div>
      <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-12"><Signature label="Authorized Signatory" value={offer.companySignature || offer.hrSignature} /><Signature label="Company Seal" value={offer.companySeal} /></div>
    </div>
  );
}

function DocumentMeta({ offer, compact = false }) {
  return <div className={`flex flex-wrap items-start justify-between gap-3 sm:gap-6 ${compact ? "text-[10px]" : "text-xs"}`}><div><p><strong>Offer Letter ID:</strong> {value(offer.offerLetterNumber, "Draft")}</p><p><strong>Employee ID:</strong> {value(offer.employeeId, "Pending")}</p></div><div className="sm:text-right"><p><strong>Issue Date:</strong> {date(offer.issueDate)}</p><p><strong>Official Contact:</strong> {value(offer.officialMobileNumber || offer.mobileNumber)}</p></div></div>;
}

function SalaryRow({ label, monthly, annual, total = false, accent = false }) {
  return <tr className={`${total ? "font-black" : ""} ${accent ? "bg-orange-50 text-[#c2410c]" : ""}`}><td className="border border-slate-300 px-4 py-2.5">{label}</td><td className="border border-slate-300 px-4 py-2.5 text-right">{money(monthly)}</td><td className="border border-slate-300 px-4 py-2.5 text-right">{money(annual ?? Number(monthly || 0) * 12)}</td></tr>;
}

function Signature({ label, value: content }) {
  return <div className="pt-5"><p className="min-h-6 font-serif text-lg italic text-[#f97316]">{content || ""}</p><div className="border-t border-slate-400 pt-1 font-bold text-slate-600">{label}</div></div>;
}

function VerificationQr({ offer }) {
  const [source, setSource] = useState("");
  const payload = JSON.stringify({ verificationUrl: offer.verificationUrl || "https://www.codingwallah.com/verify-offer", offerLetterId: offer.offerLetterNumber || "Draft", employeeId: offer.employeeId || "Pending" });
  useEffect(() => { QRCode.toDataURL(payload, { width: 160, margin: 1, errorCorrectionLevel: "M" }).then(setSource).catch(() => setSource("")); }, [payload]);
  return <div className="flex items-end justify-end gap-3">{source && <img src={source} alt="Offer verification QR code" className="h-20 w-20" />}<div className="text-[10px]"><p className="font-black uppercase">Verify Offer</p><p>{value(offer.offerLetterNumber, "Draft")}</p><p>{value(offer.employeeId, "Pending")}</p></div></div>;
}

function OfferFooter({ offer, page }) {
  const company = companyDetails(offer);
  return <footer className="mt-auto border-t border-slate-200 px-5 py-3 text-[9px] leading-4 text-slate-500 sm:px-8 lg:px-12"><div className="flex flex-wrap justify-between gap-2 sm:gap-5"><p>{company.address} · {company.phone} · {company.email} · {company.website}</p><p className="shrink-0 font-black">Page {page} of 2</p></div><p>Confidential document. This document is computer generated and does not require a physical signature.</p></footer>;
}

function companyDetails(offer) {
  return { name: offer.companyName || defaults.name, tagline: offer.companyTagline || defaults.tagline, address: offer.companyAddress || defaults.address, phone: offer.companyPhone || defaults.phone, email: offer.companyEmail || defaults.email, website: offer.companyWebsite || defaults.website };
}
