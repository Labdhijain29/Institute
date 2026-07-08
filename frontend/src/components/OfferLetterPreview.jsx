import React from "react";
import { brandLogo } from "./BrandLogo.jsx";

const company = {
  name: "Coding Walla",
  address: "1nd Floor, 91, Ratna Lok Colony RD, Near Medanta Hospital, Vijay Nagar, Indore, MP, 452010",
  phone: "+91 9098875825",
  email: "info@codingwallah.com",
  hrEmail: "hr@codingwallah.com",
  website: "www.codingwallah.com",
  gstin: "GSTIN: To be updated"
};

const totalPages = 8;
const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "-");
const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
const clean = (value, fallback = "-") => value || fallback;

const policyItems = [
  ["Working Hours", "Employees are expected to follow assigned working hours, shift timing, break discipline, and workplace reporting standards."],
  ["Attendance Policy", "Attendance, punctuality, biometric or system login records, and approved leave entries will be used for HR and payroll processing."],
  ["Leave Policy", "Leave must be requested through approved channels and is subject to manager and HR approval based on business requirements."],
  ["Probation Policy", "Performance, conduct, attendance, and role readiness will be reviewed during the probation period before confirmation."],
  ["Code of Conduct", "Employees must maintain integrity, professional communication, respectful behavior, and compliance with company instructions."],
  ["Confidentiality", "Business plans, client data, employee data, credentials, pricing, reports, and internal documents must remain confidential."],
  ["Data Protection", "Employees must protect company systems, files, passwords, devices, and data according to security procedures."],
  ["Company Assets", "Company assets must be used responsibly and returned immediately on transfer, separation, or HR request."],
  ["Internet Usage", "Internet, email, software, and communication tools must be used only for authorized professional work."],
  ["Dress Code", "Employees must follow workplace grooming and dress standards appropriate to their department and client interaction needs."],
  ["Performance Review", "Performance reviews may consider goals, quality, productivity, teamwork, attendance, conduct, and manager feedback."],
  ["Notice Period", "Separation requires serving the applicable notice period unless waived or adjusted by management in writing."],
  ["Termination Policy", "Employment may be terminated for misconduct, poor performance, policy breach, false information, or business reasons."],
  ["Medical Benefits", "Applicable medical or insurance benefits will be governed by company policy and statutory eligibility."],
  ["PF, ESI and Gratuity", "Statutory benefits will apply as per eligibility, wage limits, company policy, and applicable law."],
  ["Equal Opportunity", "The company supports equal opportunity and does not tolerate discrimination, harassment, or retaliation."]
];

const terms = [
  ["Employment Type", "Your employment type, department, reporting structure, and work location will be as specified in this offer letter."],
  ["Salary Revision", "Salary revision is not automatic and may depend on performance, business conditions, role changes, and management approval."],
  ["Transfer Policy", "The company may transfer you to another department, branch, project, role, or location based on business requirements."],
  ["Working Hours", "Working hours, weekly off, shift timing, and office timing may be modified by the company with reasonable notice."],
  ["Leave Rules", "Leave eligibility, leave approval, leave without pay, holiday rules, and leave encashment will follow HR policy."],
  ["Background Verification", "This offer remains subject to satisfactory background verification, identity verification, and document validation."],
  ["Non Disclosure Agreement", "You must not disclose confidential information during or after employment except when authorized in writing."],
  ["Conflict of Interest", "You must disclose any personal, financial, or professional conflict that may affect your duties."],
  ["Company Property", "All company property, credentials, records, documents, and devices remain company-owned and must be returned."],
  ["Termination Clause", "The company may terminate employment according to policy, contract terms, applicable law, and disciplinary process."],
  ["Notice Period", "Either party may separate by serving the applicable notice period or salary in lieu, subject to company approval."],
  ["Confidentiality Agreement", "By accepting this offer, you agree to protect company information and follow all confidentiality obligations."]
];

export function OfferLetterPreview({ offer }) {
  const pages = [
    <WelcomePage key="welcome" offer={offer} />,
    <EmploymentPage key="employment" offer={offer} />,
    <SalaryPage key="salary" offer={offer} />,
    <ResponsibilitiesPage key="responsibilities" offer={offer} />,
    <PoliciesPage key="policies" />,
    <TermsPage key="terms" offer={offer} />,
    <DeclarationPage key="declaration" offer={offer} />,
    <SignaturePage key="signature" offer={offer} />
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
        <OfferHeader offer={offer} />
        <main className="flex-1 px-10 py-6">{children}</main>
        <OfferFooter page={page} />
      </div>
    </section>
  );
}

function OfferHeader({ offer }) {
  return (
    <header className="border-b border-slate-200 px-10 py-5">
      <div className="flex items-start justify-between gap-6">
        <div className="flex gap-4">
          <img src={brandLogo} alt="" className="h-14 w-14 object-contain" />
          <div>
            <h1 className="text-2xl font-black tracking-normal text-[#0f172a]">{company.name}</h1>
            <p className="mt-2 max-w-xl text-[11px] leading-5 text-slate-600">{company.address}</p>
            <p className="text-[11px] font-semibold text-slate-600">{company.phone} | {company.email} | {company.website}</p>
            <p className="text-[11px] font-semibold text-slate-500">{company.gstin} | HR: {company.hrEmail}</p>
          </div>
        </div>
        <div className="min-w-56 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-right text-[11px]">
          <Meta label="Document Type" value="Employee Offer Letter" />
          <Meta label="Offer Letter No." value={clean(offer.offerLetterNumber, "Draft")} />
          <Meta label="Issue Date" value={date(offer.issueDate)} />
        </div>
      </div>
    </header>
  );
}

function WelcomePage({ offer }) {
  return (
    <div>
      <p className="text-center text-xs font-black uppercase tracking-[0.28em] text-[#f97316]">Official Employment Offer</p>
      <h2 className="mt-4 text-center text-3xl font-black text-[#0f172a]">EMPLOYMENT OFFER LETTER</h2>
      <div className="mt-7 grid gap-3 rounded-lg border border-orange-100 bg-[#fff8f1] p-5 md:grid-cols-2">
        <Info label="Employee Name" value={offer.fullName} />
        <Info label="Employee ID" value={offer.employeeId} />
        <Info label="Department" value={offer.department} />
        <Info label="Designation" value={offer.designation} />
        <Info label="Employment Type" value={offer.employmentType} />
        <Info label="Joining Date" value={date(offer.joiningDate)} />
        <Info label="Annual CTC" value={money(offer.ctc)} />
        <Info label="Offer Valid Till" value={date(offer.validTill)} />
      </div>
      <div className="mt-8 space-y-4 text-sm leading-7 text-slate-700">
        <p className="font-bold text-[#0f172a]">Dear {clean(offer.fullName, "Employee")},</p>
        <p>
          We are pleased to offer you the position of {clean(offer.designation, "the offered role")} in the {clean(offer.department, "assigned")} department at {company.name}.
        </p>
        <p>
          Your employment will commence on {date(offer.joiningDate)}. You will report directly to {clean(offer.reportingManager, "your reporting manager")}.
        </p>
        <p>
          We believe your skills, experience, and professional commitment will be a valuable addition to our organization. This offer is subject to document verification, HR policies, and the terms stated in this document.
        </p>
        {offer.remarks && <p className="rounded-md border border-slate-200 bg-white p-4 font-semibold text-slate-700">Remarks: {offer.remarks}</p>}
      </div>
    </div>
  );
}

function EmploymentPage({ offer }) {
  return (
    <div>
      <SectionTitle title="Employee And Employment Details" subtitle="Personal, reporting, location, and work arrangement information" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Employee Information" rows={[
          ["Employee Name", offer.fullName],
          ["Employee ID", offer.employeeId],
          ["Photograph", offer.photograph ? "Attached" : "-"],
          ["Gender", offer.gender],
          ["Date of Birth", date(offer.dateOfBirth)],
          ["Personal Email", offer.personalEmail],
          ["Official Email", offer.officialEmail],
          ["Phone Number", offer.mobileNumber],
          ["Address", [offer.address, offer.city, offer.state, offer.country, offer.pincode].filter(Boolean).join(", ")],
          ["Emergency Contact", offer.emergencyContact]
        ]} />
        <Card title="Employment Details" rows={[
          ["Department", offer.department],
          ["Designation", offer.designation],
          ["Reporting Manager", offer.reportingManager],
          ["Employment Type", offer.employmentType],
          ["Office Location", offer.workLocation],
          ["Branch", offer.officeBranch],
          ["Joining Date", date(offer.joiningDate)],
          ["Probation Period", offer.probationPeriod],
          ["Confirmation Date", date(offer.confirmationDate)],
          ["Notice Period", offer.noticePeriod],
          ["Working Days", offer.workingDays],
          ["Working Hours", offer.officeTiming],
          ["Shift Timing", offer.shiftTiming]
        ]} />
      </div>
    </div>
  );
}

function SalaryPage({ offer }) {
  return (
    <div>
      <SectionTitle title="Salary Structure" subtitle="Compensation, statutory deductions, and salary payment information" />
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <Info label="Annual CTC" value={money(offer.ctc)} />
          <Info label="Basic Salary" value={money(offer.basicSalary)} />
          <Info label="HRA" value={money(offer.hra)} />
          <Info label="Special Allowance" value={money(offer.specialAllowance)} />
          <Info label="Medical Allowance" value={money(offer.medicalAllowance)} />
          <Info label="Travel Allowance" value={money(offer.travelAllowance || offer.conveyance)} />
          <Info label="Bonus" value={money(offer.bonus)} />
          <Info label="PF" value={money(offer.pf)} />
          <Info label="ESI" value={money(offer.esi)} />
          <Info label="Professional Tax" value={money(offer.professionalTax)} />
          <Info label="Gross Salary" value={money(offer.grossSalary)} />
          <Info label="Net Salary" value={money(offer.netSalary)} />
          <Info label="Salary Payment Date" value={clean(offer.salaryPaymentDate, "As per payroll cycle")} />
        </div>
      </div>
    </div>
  );
}

function ResponsibilitiesPage({ offer }) {
  const custom = String(offer.rolesAndResponsibilities || "").trim();
  const defaults = [
    `Perform the duties assigned to the ${clean(offer.designation, "designated")} role with accuracy, ownership, and professionalism.`,
    `Coordinate with the ${clean(offer.department, "assigned")} department, reporting manager, HR team, and cross-functional stakeholders.`,
    "Maintain timely attendance, daily work discipline, task updates, documentation, and reporting standards.",
    "Protect company data, client information, internal systems, credentials, and all confidential business information.",
    "Follow company policies, escalation procedures, quality standards, and performance expectations."
  ];
  return (
    <div>
      <SectionTitle title="Roles And Responsibilities" subtitle="Role expectations and professional accountability" />
      <div className="space-y-3">
        {(custom ? custom.split("\n").filter(Boolean) : defaults).map((item, index) => (
          <PolicyItem key={index} index={index + 1} title={`Responsibility ${index + 1}`} text={item} />
        ))}
      </div>
    </div>
  );
}

function PoliciesPage() {
  return (
    <div>
      <SectionTitle title="HR Policies" subtitle="Professional employment policies applicable from the joining date" />
      <div className="grid gap-3 md:grid-cols-2">
        {policyItems.map(([title, text], index) => <PolicyItem key={title} index={index + 1} title={title} text={text} />)}
      </div>
    </div>
  );
}

function TermsPage({ offer }) {
  const custom = String(offer.termsAndConditions || "").trim();
  return (
    <div>
      <SectionTitle title="Terms And Conditions" subtitle="Employment terms, confidentiality, compliance, and separation clauses" />
      <div className="space-y-3">
        {(custom ? custom.split("\n").filter(Boolean).map((text, index) => [`Term ${index + 1}`, text]) : terms).map(([title, text], index) => (
          <PolicyItem key={`${title}-${index}`} index={index + 1} title={title} text={text} />
        ))}
      </div>
    </div>
  );
}

function DeclarationPage({ offer }) {
  return (
    <div>
      <SectionTitle title="Employee Declaration" subtitle="Acceptance of compensation, role, joining date, policies, and terms" />
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-700">
        <p className="font-bold text-[#0f172a]">I, {clean(offer.fullName, "the employee")}, hereby confirm that:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>I accept the offered designation of {clean(offer.designation, "the assigned role")} and the joining date of {date(offer.joiningDate)}.</li>
          <li>I have reviewed and accepted the salary structure, statutory deductions, and payroll terms mentioned in this offer letter.</li>
          <li>I agree to follow company policies, HR procedures, confidentiality obligations, data protection rules, and code of conduct.</li>
          <li>I understand that employment is subject to document verification, background verification, and compliance with company requirements.</li>
          <li>I accept the terms and conditions stated in this employment offer letter.</li>
        </ul>
      </div>
    </div>
  );
}

function SignaturePage({ offer }) {
  return (
    <div>
      <SectionTitle title="Signature And Acceptance" subtitle="Authorized signatures, employee acknowledgement, and company seal" />
      <div className="mt-10 grid gap-8 text-sm md:grid-cols-2">
        <SignatureLine label="HR Manager Signature" value={offer.hrSignature} />
        <SignatureLine label="Reporting Manager Signature" value={offer.reportingManager} />
        <SignatureLine label="Director Signature" value={offer.directorSignature} />
        <SignatureLine label="Employee Signature" value={offer.employeeSignature} />
        <SignatureLine label="Acceptance Date" value={date(offer.signatureDate)} />
        <SignatureLine label="Place" value={offer.signaturePlace} />
        <div className="grid h-28 place-items-center rounded-lg border-2 border-dashed border-slate-300 text-center text-xs font-black uppercase tracking-wide text-slate-500 md:col-span-2">
          Company Seal
        </div>
      </div>
    </div>
  );
}

function OfferFooter({ page }) {
  return (
    <footer className="mt-auto border-t border-slate-200 px-10 py-4 text-[10px] text-slate-500">
      <div className="flex items-center justify-between gap-4">
        <p>Confidential Document | {company.name} | Generated {date(new Date())}</p>
        <p className="font-bold">Page {page} of {totalPages}</p>
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
          <div key={label} className="grid grid-cols-[150px_1fr] gap-3 text-xs">
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
