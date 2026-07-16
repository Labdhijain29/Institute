import React, { useRef, useState } from "react";
import { Download, Printer } from "lucide-react";
import { BrandLockup } from "../../components/BrandLogo.jsx";
import { downloadRegistrationPdf } from "../../utils/registrationPdf.js";
import { formatDate } from "../components/StudentUI.jsx";

const value = (input) => input || "—";

function Field({ label, children, wide = false }) {
  return (
    <div className={`border-b border-slate-300 px-3 py-2.5 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 min-h-5 text-sm font-semibold text-[#111315]">{value(children)}</p>
    </div>
  );
}

export function RegistrationPaper({ student, printRef, className = "" }) {
  const address = [student.address?.line1, student.address?.line2, student.address?.city, student.address?.state, student.address?.pincode].filter(Boolean).join(", ");
  return (
    <article ref={printRef} id="student-registration-print-area" className={`mx-auto max-w-[794px] bg-white p-8 text-[#111315] shadow-sm ${className}`}>
      <header className="flex items-start justify-between border-b-4 border-[#f97316] pb-5">
        <BrandLockup logoClassName="h-16 w-auto" variant="light" />
        <div className="text-right"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f97316]">Registration Form</p><p className="mt-2 text-sm font-bold">{student.studentId || "Generated on registration"}</p></div>
      </header>

      <section className="mt-6">
        <h1 className="bg-[#111315] px-4 py-2 text-base font-bold uppercase tracking-wide text-white">Student Information</h1>
        <div className="grid border-x border-slate-300 sm:grid-cols-2">
          <Field label="Full Name">{student.name}</Field><Field label="Student ID">{student.studentId}</Field>
          <Field label="Email Address">{student.email}</Field><Field label="Mobile Number">{student.mobile}</Field>
          <Field label="Gender">{student.gender}</Field><Field label="Date of Birth">{student.dateOfBirth ? formatDate(student.dateOfBirth) : ""}</Field>
          <Field label="Address" wide>{address}</Field>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="bg-[#f97316] px-4 py-2 text-base font-bold uppercase tracking-wide text-white">Guardian & Academic Details</h2>
        <div className="grid border-x border-slate-300 sm:grid-cols-2">
          <Field label="Guardian Name">{student.parentName}</Field><Field label="Guardian Mobile">{student.parentMobile}</Field>
          <Field label="Highest Qualification">{student.highestQualification}</Field><Field label="Current Status">{student.currentStatus}</Field>
          <Field label="Course">{student.courseName}</Field><Field label="Batch">{student.batchName}</Field>
          <Field label="Learning Mode">{student.learningMode}</Field><Field label="Admission Date">{student.admissionDate ? formatDate(student.admissionDate) : ""}</Field>
          <Field label="Remarks" wide>{student.remarks}</Field>
        </div>
      </section>

      <footer className="mt-12 grid grid-cols-2 gap-16 text-center text-xs font-bold uppercase text-slate-600">
        <div className="border-t border-slate-500 pt-2">Student / Guardian Signature</div>
        <div className="border-t border-slate-500 pt-2">Authorized Signature</div>
      </footer>
    </article>
  );
}

export function StudentRegistrationForm({ data }) {
  const student = data.student;
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    setDownloading(true);
    try {
      await downloadRegistrationPdf(printRef.current, student.studentId);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-bold">Student Registration Form</h2><p className="text-sm text-slate-500">Print or save your official registration details.</p></div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-[#f97316] hover:text-[#f97316]"><Printer size={16} /> Print</button>
          <button disabled={downloading} onClick={download} className="inline-flex items-center gap-2 rounded-md bg-[#111315] px-4 py-2 text-sm font-semibold text-white hover:bg-[#f97316] disabled:opacity-60"><Download size={16} /> {downloading ? "Preparing..." : "Download PDF"}</button>
        </div>
      </div>

      <RegistrationPaper student={student} printRef={printRef} />
    </div>
  );
}
