import React from "react";

const institute = {
  name: "DeepNexusAnalytics",
  logo: "DN",
  address: "91, Ratnalok Colony, Indore, M.P",
  phone: "7999229424",
  email: "info@deepnexus.com",
  website: "DeepNexusAnalytics.com",
  signature: "Lakhan Rathod"
};

const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "-");
const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export function OfferLetterPreview({ offer }) {
  return (
    <article id="offer-letter-print-area" className="offer-letter-paper mx-auto bg-white p-8 text-[#172026] shadow-sm">
      <div className="flex min-h-full flex-col border border-slate-200 p-7">
        <header className="flex items-start justify-between gap-5 border-b-4 border-pine pb-5">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-md bg-pine text-2xl font-black text-white">{institute.logo}</div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-wide text-ink">{institute.name}</h1>
              <p className="mt-1 text-sm font-semibold text-slate-600">{institute.address}</p>
              <p className="text-sm text-slate-500">
                {institute.phone} | {institute.email} | {institute.website}
              </p>
            </div>
          </div>
          <div className="rounded-md border border-slate-200 px-4 py-3 text-right text-sm">
            <p className="font-bold text-slate-500">Offer Date</p>
            <p className="mt-1 font-black text-ink">{date(offer.offerDate)}</p>
          </div>
        </header>

        <main className="flex-1 py-8">
          <p className="text-center text-sm font-black uppercase tracking-[0.35em] text-pine">Offer Letter</p>
          <section className="mt-8 rounded-md border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-lg text-slate-600">This is to formally offer admission to</p>
            <h2 className="mt-3 font-serif text-4xl font-black text-ink">{offer.studentName || "Student Name"}</h2>
            <p className="mt-6 text-lg text-slate-600">for the course</p>
            <h3 className="mt-2 text-2xl font-black uppercase tracking-wide text-pine">{offer.courseName || "Course Name"}</h3>
          </section>

          <section className="mt-7 grid gap-3 rounded-md border border-slate-200 p-5 text-sm md:grid-cols-2">
            <Info label="Student ID" value={offer.studentId} />
            <Info label="Batch" value={offer.batch} />
            <Info label="Course Fee" value={money(offer.feeOffered)} />
            <Info label="Start Date" value={date(offer.startDate)} />
            <Info label="Offer Date" value={date(offer.offerDate)} />
            <Info label="Remarks" value={offer.remarks || "-"} />
          </section>

          <section className="mt-7 rounded-md border border-slate-200 p-5">
            <h3 className="text-sm font-black uppercase text-slate-600">Terms</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>This offer is valid for limited time.</li>
              <li>Admission is subject to verification.</li>
              <li>Fees once paid are non-refundable, if applicable.</li>
            </ul>
          </section>
        </main>

        <footer className="grid gap-5 pt-8 text-center text-sm font-semibold md:grid-cols-3">
          <Signature name={institute.signature} label="Authorized Signature" />
          <div className="grid place-items-center">
            <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-pine text-center text-[10px] font-black uppercase text-pine">
              Institute<br />Stamp
            </div>
          </div>
          <div className="flex items-end justify-center">
            <p className="text-xs text-slate-500">This is a computer generated document.</p>
          </div>
        </footer>
      </div>
    </article>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md bg-white px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-black text-ink">{value || "-"}</p>
    </div>
  );
}

function Signature({ name, label }) {
  return (
    <div>
      <p className="font-serif text-2xl italic text-pine">{name}</p>
      <div className="mt-6 border-t border-slate-400 pt-2">{label}</div>
    </div>
  );
}
