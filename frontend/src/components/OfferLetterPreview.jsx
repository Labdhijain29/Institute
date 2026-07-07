import React from "react";
import { BrandLockup, brandLogo } from "./BrandLogo.jsx";

const institute = {
  name: "Coding Walla",
  address: "1nd Floor, 91, Ratna Lok Colony RD, Near Medanta Hospital, Vijay Nagar, Indore, MP, 452010",
  phone: "+91 9098875825",
  email: "info@codingwallah.com",
  website: "www.codingwallah.com",
  signature: "Lakhan Rathod",
  cinGst: "GST/CIN: To be updated"
};

const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "-");
const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
const clean = (value, fallback = "-") => value || fallback;
const finalPayable = (offer) => Number(offer.finalAmount || 0) || Math.max(Number(offer.feeOffered || 0) - Number(offer.scholarship || 0), 0);

const terms = [
  ["Acceptance of Offer", "The candidate must confirm acceptance within the validity period mentioned in this document."],
  ["Document Verification", "Admission or employment is subject to verification of identity, academic, and supporting documents."],
  ["Attendance Requirement", "The candidate is expected to maintain minimum attendance as prescribed by the institute or department."],
  ["Fee Payment Policy", "Fees must be paid according to the approved schedule. Delayed payments may affect access to services."],
  ["Code of Conduct", "Professional conduct, punctuality, integrity, and respectful communication are mandatory at all times."],
  ["Confidentiality", "Internal material, credentials, student data, and institute information must not be shared externally."],
  ["Anti-Harassment Policy", "The institute follows zero tolerance toward harassment, intimidation, discrimination, or misconduct."],
  ["Use of Institute Resources", "Systems, classrooms, networks, and digital resources must be used only for authorized purposes."],
  ["Academic Performance Expectations", "Consistent participation, assignment completion, and performance improvement are expected."],
  ["Termination/Cancellation Conditions", "The institute may cancel this offer for misconduct, false information, or policy violations."],
  ["Data Privacy Policy", "Personal data will be handled for academic, operational, compliance, and communication purposes."],
  ["Disciplinary Action Policy", "Policy breaches may lead to warnings, suspension, cancellation, or other appropriate action."]
];

const policies = [
  ["Attendance Policy", "Minimum attendance is required. Leave must be requested in advance, and repeated late arrival may be recorded."],
  ["Professional Behaviour", "Dress code, professional communication, and respectful workplace conduct are expected from every candidate."],
  ["Information Security Policy", "Passwords must be protected. Unauthorized access, data copying, and credential sharing are prohibited."],
  ["Social Media Policy", "Public communication must be responsible and must not harm the reputation of the institute or its partners."],
  ["Equal Opportunity Policy", "The institute provides equal learning opportunities and does not permit discrimination."],
  ["Anti-Harassment Policy", "Complaints can be reported to management or HR, and every concern will be handled with confidentiality."],
  ["Health & Safety Policy", "Candidates must follow safety instructions, emergency procedures, and campus compliance norms."],
  ["Remote Work Policy", "Where applicable, online attendance, camera discipline, communication etiquette, and deliverables remain mandatory."]
];

export function OfferLetterPreview({ offer }) {
  const pages = [
    <PageOne key="page-1" offer={offer} />,
    <PageTwo key="page-2" offer={offer} />,
    <TermsConditions key="page-3" />,
    <HRPolicies key="page-4" />,
    <DeclarationSection key="page-5" offer={offer} />
  ];

  return (
    <article id="offer-letter-print-area" className="offer-letter-document mx-auto space-y-6 text-[#111315]">
      {pages.map((page, index) => (
        <OfferPage key={index} offer={offer} page={index + 1}>
          {page}
        </OfferPage>
      ))}
    </article>
  );
}

function OfferPage({ children, offer, page }) {
  return (
    <section className="offer-letter-page relative overflow-hidden bg-white shadow-sm">
      <img src={brandLogo} alt="" className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.035]" />
      <div className="relative z-10 flex min-h-full flex-col">
        <OfferHeader offer={offer} compact={page !== 1} />
        <main className="flex-1 px-10 py-6">{children}</main>
        <OfferFooter page={page} />
      </div>
    </section>
  );
}

export function OfferHeader({ offer, compact = false }) {
  return (
    <header className="border-b border-slate-200 px-10 py-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <BrandLockup variant="light" />
          <p className="mt-3 max-w-md text-[11px] leading-5 text-slate-600">{institute.address}</p>
          <p className="text-[11px] font-semibold text-slate-600">{institute.phone} | {institute.email} | {institute.website}</p>
          {!compact && <p className="text-[11px] font-semibold text-slate-500">{clean(offer.companyCinGst, institute.cinGst)}</p>}
        </div>
        <div className="min-w-48 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-right text-[11px]">
          <Meta label="Document No." value={clean(offer.documentNumber, `DOC-${clean(offer.studentId, "DRAFT")}`)} />
          <Meta label="Offer Letter ID" value={clean(offer.offerLetterId, `OL-${clean(offer.studentId, "DRAFT")}`)} />
          <Meta label="Issue Date" value={date(offer.offerDate)} />
        </div>
      </div>
    </header>
  );
}

function PageOne({ offer }) {
  return (
    <div>
      <p className="text-center text-xs font-black uppercase tracking-[0.28em] text-[#f97316]">Offer of Admission / Offer Letter</p>
      <h2 className="mt-4 text-center text-3xl font-black text-[#0f172a]">Professional Offer Document</h2>
      <div className="mt-7 grid gap-3 rounded-lg border border-orange-100 bg-[#fff8f1] p-5 md:grid-cols-2">
        <Info label="Full Name" value={offer.studentName} />
        <Info label="Student/Employee ID" value={offer.studentId} />
        <Info label="Course/Department" value={offer.courseName || offer.department} />
        <Info label="Batch" value={offer.batch} />
        <Info label="Program Duration" value={offer.duration} />
        <Info label="Reporting/Joining Date" value={date(offer.joiningDate || offer.startDate)} />
        <Info label="Offered Fee/CTC" value={money(offer.feeOffered)} />
        <Info label="Offer Valid Till" value={date(offer.validTill)} />
      </div>
      <div className="mt-8 space-y-4 text-sm leading-7 text-slate-700">
        <p className="font-bold text-[#0f172a]">Dear {clean(offer.studentName, "Candidate")},</p>
        <p>
          We are pleased to offer you admission/employment with {institute.name}. This offer reflects our confidence in your potential and your commitment to a disciplined, industry-ready learning or work journey.
        </p>
        <p>
          Your engagement will be governed by the course or department details, financial terms, institutional policies, and code of conduct outlined in this document. Please review every section carefully before acceptance.
        </p>
        {offer.remarks && <p className="rounded-md border border-slate-200 bg-white p-4 font-semibold text-slate-700">Notes: {offer.remarks}</p>}
      </div>
    </div>
  );
}

export function OfferDetails({ offer }) {
  return (
    <div>
      <SectionTitle title="Offer Details" subtitle="Candidate, program, financial, and operational information" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Candidate Information" rows={[
          ["Name", offer.studentName],
          ["ID", offer.studentId],
          ["Email", offer.email],
          ["Mobile Number", offer.phone],
          ["Address", offer.address]
        ]} />
        <Card title="Course/Position Information" rows={[
          ["Course Name", offer.courseName],
          ["Department", offer.department],
          ["Batch", offer.batch],
          ["Duration", offer.duration],
          ["Start Date", date(offer.startDate)],
          ["End Date", date(offer.endDate)]
        ]} />
        <Card title="Financial Information" rows={[
          ["Total Fee", money(offer.feeOffered)],
          ["Scholarship/Discount", money(offer.scholarship)],
          ["Final Payable Amount", money(finalPayable(offer))],
          ["Payment Schedule", offer.paymentSchedule]
        ]} />
        <Card title="Additional Information" rows={[
          ["Reporting Manager", offer.reportingManager],
          ["Training Location", offer.trainingLocation || offer.branchLocation],
          ["Mode", offer.mode || "Offline"],
          ["HR Contact", offer.hrContact]
        ]} />
      </div>
    </div>
  );
}

function PageTwo({ offer }) {
  return <OfferDetails offer={offer} />;
}

export function TermsConditions() {
  return (
    <div>
      <SectionTitle title="Terms and Conditions" subtitle="Professional clauses applicable to this offer" />
      <div className="space-y-3">
        {terms.map(([title, text], index) => (
          <PolicyItem key={title} index={index + 1} title={title} text={text} />
        ))}
      </div>
    </div>
  );
}

export function HRPolicies() {
  return (
    <div>
      <SectionTitle title="HR Policies" subtitle="Corporate-style policies for conduct, safety, security, and compliance" />
      <div className="grid gap-3 md:grid-cols-2">
        {policies.map(([title, text]) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-black text-[#0f172a]">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeclarationSection({ offer }) {
  return (
    <div>
      <SectionTitle title="Declaration" subtitle="Candidate acceptance and acknowledgement" />
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-700">
        <p className="font-bold text-[#0f172a]">I hereby confirm that:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>All information provided by me is true and complete.</li>
          <li>I agree to abide by all institutional policies and professional standards.</li>
          <li>I understand the terms and conditions stated in this offer document.</li>
          <li>I accept this offer and understand that violations may result in corrective action.</li>
        </ul>
      </div>
      <div className="mt-12 grid gap-8 text-sm md:grid-cols-2">
        <SignatureLine label="Candidate Signature" />
        <SignatureLine label="Date" />
        <SignatureLine label="Authorized Signatory" value={clean(offer.authorizedSignatory, institute.signature)} />
        <div className="grid h-28 place-items-center rounded-lg border-2 border-dashed border-slate-300 text-center text-xs font-black uppercase tracking-wide text-slate-500">
          Institute Stamp Area
        </div>
      </div>
    </div>
  );
}

export function OfferFooter({ page }) {
  return (
    <footer className="mt-auto border-t border-slate-200 px-10 py-4 text-[10px] text-slate-500">
      <div className="flex items-center justify-between gap-4">
        <p>This document is system generated and does not require physical signature.</p>
        <p className="font-bold">Page {page} of 5</p>
      </div>
    </footer>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-5 border-l-4 border-[#f97316] pl-4">
      <h2 className="text-2xl font-black text-[#0f172a]">{title}</h2>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{subtitle}</p>
    </div>
  );
}

function Card({ title, rows }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="border-b border-slate-100 pb-2 text-sm font-black text-[#f97316]">{title}</h3>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[120px_1fr] gap-3 text-xs">
            <p className="font-bold uppercase text-slate-500">{label}</p>
            <p className="font-semibold text-[#0f172a]">{clean(value)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-[#0f172a]">{clean(value)}</p>
    </div>
  );
}

function PolicyItem({ index, title, text }) {
  return (
    <div className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#0f172a] text-xs font-black text-white">{index}</span>
      <div>
        <h3 className="text-sm font-black text-[#0f172a]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <p className="mb-1">
      <span className="font-bold text-slate-500">{label}</span>
      <span className="ml-2 font-black text-[#0f172a]">{value}</span>
    </p>
  );
}

function SignatureLine({ label, value = "" }) {
  return (
    <div className="pt-8">
      <p className="min-h-6 font-serif text-xl italic text-[#f97316]">{value}</p>
      <div className="mt-5 border-t border-slate-400 pt-2 font-bold text-slate-600">{label}</div>
    </div>
  );
}
