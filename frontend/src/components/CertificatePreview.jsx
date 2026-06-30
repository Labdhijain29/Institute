import React from "react";
import logoMark from "../assets/coding-wallah-mark-charcoal.png";

const institute = {
  name: "Coding Walla",
  tagline: "From Learning to Earning.",
  address: "1nd Floor, 91, Ratna Lok Colony RD, Near Medanta Hospital, Vijay nagar, Indore, MP, 452010",
  phone: "+91 9098875825",
  email: "info@codingwallah.com",
  website: "www.codingwallah.com",
  trainer: "Trainer Signature",
  director: "Lakhan Rathod"
};

const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "-");

export function CertificatePreview({ certificate }) {
  return (
    <article id="certificate-print-area" className="certificate-paper mx-auto overflow-hidden bg-[#fffaf5] text-[#111315] shadow-sm">
      <div className="relative flex h-full flex-col border-[10px] border-[#111315] p-6">
        <div className="pointer-events-none absolute inset-5 border-2 border-[#f97316]" />
        <div className="pointer-events-none absolute inset-9 border border-[#f97316]/25" />

        <header className="relative z-10 flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-28 place-items-center overflow-hidden rounded-md bg-white">
              <img src={logoMark} alt="Coding Walla" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-[0.12em] text-[#111315]">{institute.name}</h1>
              <p className="mt-1 text-sm font-bold uppercase tracking-[0.28em] text-[#f97316]">{institute.tagline}</p>
            </div>
          </div>
          <div className="text-right text-xs font-semibold text-slate-600">
            <p>{institute.address}</p>
            <p>{institute.phone} | {institute.email}</p>
            <p>{institute.website}</p>
          </div>
        </header>

        <main className="relative z-10 grid flex-1 place-items-center py-8 text-center">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-[#f97316]">Certificate of Completion</p>
            <h2 className="mt-4 font-serif text-5xl font-black text-[#111315]">This is to certify that</h2>
            <p className="mt-6 border-b-2 border-[#f97316] px-14 pb-2 font-serif text-5xl italic text-[#f97316]">{certificate.studentName || "Student Name"}</p>
            <p className="mt-6 text-xl text-slate-700">has successfully completed the</p>
            <p className="mt-3 text-3xl font-black uppercase tracking-wide text-[#111315]">{certificate.courseName || "Course Name"}</p>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600">
              training program conducted by the institute. The student has demonstrated satisfactory performance and fulfilled all course requirements.
            </p>
          </div>
        </main>

        <section className="relative z-10 grid gap-3 rounded-md border border-[#f97316]/40 bg-white/80 p-4 text-sm font-semibold md:grid-cols-4">
          <Info label="Student ID" value={certificate.studentId} />
          <Info label="Batch" value={certificate.batch} />
          <Info label="Issue Date" value={date(certificate.issueDate)} />
          <Info label="Certificate No" value={certificate.certificateNumber || certificate.certificateNo} />
        </section>

        <footer className="relative z-10 mt-8 grid grid-cols-4 items-end gap-6 text-center text-sm font-bold">
          <Signature label={institute.trainer} />
          <Signature label="Institute Director" name={institute.director} />
          <div className="grid place-items-center">
            <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-[#f97316] text-center text-[10px] font-black uppercase text-[#f97316]">
              Institute<br />Stamp
            </div>
          </div>
          <div className="grid place-items-center">
            <div className="grid h-24 w-24 place-items-center border-2 border-slate-800 bg-white text-center text-[10px] font-black uppercase">
              QR<br />Verify
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-[#111315]">{value || "-"}</p>
    </div>
  );
}

function Signature({ label, name }) {
  return (
    <div>
      {name && <p className="font-serif text-2xl italic text-[#f97316]">{name}</p>}
      <div className="mt-8 border-t border-slate-500 pt-2">{label}</div>
    </div>
  );
}
