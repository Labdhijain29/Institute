import React from "react";
import { amountInWords } from "../utils/amountInWords.js";
import logoMark from "../assets/coding-wallah-mark-charcoal.png";

const institute = {
  name: "Coding Wallah",
  address: "1nd Floor, 91, Ratna Lok Colony RD, Near Medanta Hospital, Vijay nagar, Indore, MP, 452010",
  phone: "+91 9098875825",
  email: "info@codingwallah.com",
  website: "www.codingwallah.com"
};

const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-");

export function ReceiptPreview({ receipt }) {
  const student = receipt?.student || {};
  const course = student.course?.name || student.course || "-";
  const batch = student.batch?.name || student.batch || "-";

  return (
    <article id="fee-receipt-print-area" className="receipt-paper mx-auto bg-white p-8 text-ink shadow-sm">
      <header className="flex items-start justify-between gap-6 border-b-4 border-[#f97316] pb-5">
        <div className="flex gap-4">
          <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-md bg-white">
            <img src={logoMark} alt="Coding Wallah" className="h-full w-full object-contain" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wide text-[#111315]">{institute.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{institute.address}</p>
            <p className="mt-1 text-sm text-slate-600">
              {institute.phone} | {institute.email} | {institute.website}
            </p>
          </div>
        </div>
        <div className="min-w-[190px] rounded-md border border-slate-300 p-3 text-right">
          <p className="text-lg font-black uppercase text-[#f97316]">Fee Receipt</p>
          <p className="mt-2 text-xs text-slate-500">Receipt Number</p>
          <p className="font-bold">{receipt?.receiptNumber || "-"}</p>
          <p className="mt-2 text-xs text-slate-500">Receipt Date</p>
          <p className="font-bold">{date(receipt?.createdAt || receipt?.paymentDate)}</p>
        </div>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <InfoBlock
          title="Student Information"
          rows={[
            ["Student Name", student.name],
            ["Student ID", student.studentId],
            ["Course", course],
            ["Batch", batch],
            ["Admission Date", date(student.admissionDate)]
          ]}
        />
        <InfoBlock
          title="Payment Information"
          rows={[
            ["Payment Date", date(receipt?.paymentDate)],
            ["Payment Mode", receipt?.paymentMode],
            ["Transaction ID", receipt?.transactionId || "-"]
          ]}
        />
      </section>

      <section className="mt-6">
        <h3 className="mb-3 text-sm font-black uppercase text-slate-600">Fee Breakdown</h3>
        <table className="w-full border-collapse text-sm">
          <tbody>
            {[
              ["Tuition Fee", receipt?.tuitionFee],
              ["Registration Fee", receipt?.registrationFee],
              ["Study Material Fee", receipt?.studyMaterialFee],
              ["Exam Fee", receipt?.examFee],
              ["Other Charges", receipt?.otherCharges],
              ["Discount", `- ${money(receipt?.discount)}`]
            ].map(([label, value]) => (
              <tr key={label} className="border border-slate-300">
                <td className="px-4 py-3 font-semibold">{label}</td>
                <td className="px-4 py-3 text-right">{typeof value === "string" ? value : money(value)}</td>
              </tr>
            ))}
            <tr className="border border-[#111315] bg-[#fff3e8] text-base font-black">
              <td className="px-4 py-3">Total Amount</td>
              <td className="px-4 py-3 text-right">{money(receipt?.totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mt-6 grid gap-3 rounded-md border border-slate-300 bg-slate-50 p-4 text-sm md:grid-cols-4">
        <SummaryItem label="Total Course Fee" value={money(receipt?.totalCourseFee)} />
        <SummaryItem label="Amount Paid" value={money(receipt?.amountPaid)} />
        <SummaryItem label="Previous Due" value={money(receipt?.previousDue)} />
        <SummaryItem label="Remaining Balance" value={money(receipt?.remainingBalance)} />
      </section>

      <section className="mt-5 rounded-md border border-slate-300 px-4 py-3">
        <p className="text-xs font-bold uppercase text-slate-500">Amount In Words</p>
        <p className="mt-1 font-bold">{amountInWords(receipt?.amountPaid || receipt?.totalAmount)}</p>
      </section>

      <footer className="mt-10 grid grid-cols-3 gap-4 text-center text-sm">
        <Signature label="Authorized Signature" />
        <Signature label="Institute Stamp" />
        <Signature label="Digital Signature" />
        <p className="col-span-3 border-t border-slate-200 pt-3 text-xs text-slate-500">
          This is a computer generated receipt and is valid without a physical signature.
        </p>
      </footer>
    </article>
  );
}

function InfoBlock({ title, rows }) {
  return (
    <div className="rounded-md border border-slate-300 p-4">
      <h3 className="mb-3 text-sm font-black uppercase text-slate-600">{title}</h3>
      <dl className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[130px_1fr] gap-3">
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-semibold">{value || "-"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function Signature({ label }) {
  return (
    <div className="pt-10">
      <div className="border-t border-slate-400 pt-2 font-semibold">{label}</div>
    </div>
  );
}
