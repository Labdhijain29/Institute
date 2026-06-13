import React, { useMemo, useRef, useState } from "react";
import { Download, Printer, Save, X } from "lucide-react";
import { amountInWords } from "../utils/amountInWords.js";
import { downloadReceiptPdf } from "../utils/pdf.js";

const defaultReceipt = {
  instituteName: "DeepNexusAnalytics",
  tagline: "INNOVATE * BUILD * ELEVATE",
  address: "91, Ratnalok Colony, Indore, M.P",
  phone: "7999229424",
  email: "info@deepnexus.com",
  website: "DeepNexusAnalytics.com",
  receiptNumber: "AIV/24-25/01235",
  receiptDate: "2024-05-25",
  studentName: "Arjun Verma",
  course: "Advanced Data Science",
  batch: "May 2024 Batch",
  studentId: "AIV/24/DS/021",
  receiptType: "One Shot Payment",
  paymentMode: "Online Payment",
  paymentDate: "2024-05-25",
  transactionId: "N324158796325",
  tuitionFee: 50000,
  registrationFee: 2000,
  studyMaterialFee: 3000,
  examFee: 0,
  otherCharges: 0,
  discount: 0,
  authorizedName: "Lakhan Rathod",
  noteOne: "This is a computer generated receipt and does not require physical signature.",
  noteTwo: "Fees once paid are non-refundable.",
  noteThree: "Please quote your Student ID for any queries."
};

const fieldGroups = [
  {
    title: "Student Details",
    fields: [
      ["studentName", "Student Name"],
      ["course", "Course"],
      ["batch", "Batch"],
      ["studentId", "Student ID"]
    ]
  },
  {
    title: "Receipt Details",
    fields: [
      ["receiptNumber", "Receipt No."],
      ["receiptDate", "Receipt Date", "date"],
      ["receiptType", "Receipt Type"]
    ]
  },
  {
    title: "Payment Details",
    fields: [
      ["paymentMode", "Payment Mode"],
      ["paymentDate", "Payment Date", "date"],
      ["transactionId", "Transaction ID"]
    ]
  },
  {
    title: "Fee Details",
    fields: [
      ["tuitionFee", "Tuition Fee", "number"],
      ["registrationFee", "Registration Fee", "number"],
      ["studyMaterialFee", "Study Material Fee", "number"],
      ["examFee", "Exam Fee", "number"],
      ["otherCharges", "Other Charges", "number"],
      ["discount", "Discount", "number"]
    ]
  }
];

const money = (value) => Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const displayDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-");

export function ReceiptBuilderModal({ open, onClose }) {
  const [receipt, setReceipt] = useState(defaultReceipt);
  const [saved, setSaved] = useState(false);
  const printRef = useRef(null);

  const totalAmount = useMemo(() => {
    return Math.max(
      Number(receipt.tuitionFee || 0) +
        Number(receipt.registrationFee || 0) +
        Number(receipt.studyMaterialFee || 0) +
        Number(receipt.examFee || 0) +
        Number(receipt.otherCharges || 0) -
        Number(receipt.discount || 0),
      0
    );
  }, [receipt]);

  if (!open) return null;

  function updateField(key, value, type) {
    setSaved(false);
    setReceipt((current) => ({
      ...current,
      [key]: type === "number" ? Number(value) : value
    }));
  }

  function saveDraft() {
    localStorage.setItem("fee_receipt_draft", JSON.stringify(receipt));
    setSaved(true);
  }

  function loadDraft() {
    const draft = localStorage.getItem("fee_receipt_draft");
    if (draft) setReceipt(JSON.parse(draft));
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 p-3 print:static print:bg-white print:p-0">
      <div className="mx-auto grid h-[94vh] max-w-6xl overflow-hidden rounded-lg bg-white shadow-soft lg:grid-cols-[minmax(0,1fr)_360px] print:block print:h-auto print:max-w-none print:rounded-none print:shadow-none">
        <section className="min-h-0 overflow-y-auto bg-slate-100 p-3 print:overflow-visible print:bg-white print:p-0">
          <div ref={printRef}>
            <ReceiptTemplate receipt={receipt} totalAmount={totalAmount} />
          </div>
        </section>

        <aside className="no-print min-h-0 overflow-y-auto border-l border-slate-200 bg-white">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Fee Receipt</h2>
                <p className="text-sm text-slate-500">Edit, print, or download PDF</p>
              </div>
              <button onClick={onClose} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close receipt">
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <Printer size={16} /> Print
              </button>
              <button onClick={() => downloadReceiptPdf(printRef.current, receipt.receiptNumber)} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <Download size={16} /> PDF
              </button>
              <button onClick={saveDraft} className="inline-flex items-center justify-center gap-2 rounded-md bg-pine px-3 py-2 text-sm font-semibold text-white">
                <Save size={16} /> Save
              </button>
              <button onClick={loadDraft} className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white">Load Draft</button>
            </div>
            {saved && <p className="mt-2 text-xs font-semibold text-pine">Draft saved in this browser.</p>}
            <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              Edit student name, course, dates, payment mode and fees from the fields below. The receipt preview updates live.
            </p>
          </div>

          <div className="space-y-5 p-4">
            {fieldGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 text-xs font-black uppercase text-slate-500">{group.title}</h3>
                <div className="space-y-3">
                  {group.fields.map(([key, label, type = "text"]) => (
                    <label key={key} className="block text-sm">
                      <span className="font-semibold text-slate-600">{label}</span>
                      <input
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-pine"
                        type={type}
                        value={receipt[key] ?? ""}
                        onChange={(event) => updateField(key, event.target.value, type)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReceiptTemplate({ receipt, totalAmount }) {
  const rows = [
    ["Tuition Fee (Full Payment)", receipt.tuitionFee],
    ["Registration Fee", receipt.registrationFee],
    ["Study Material Fee", receipt.studyMaterialFee],
    ["Exam Fee", receipt.examFee],
    ["Other Charges", receipt.otherCharges],
    ["Discount", -Number(receipt.discount || 0)]
  ].filter(([, value]) => Number(value || 0) !== 0);

  return (
    <article id="fee-receipt-print-area" className="receipt-paper receipt-paper-compact mx-auto bg-white p-3 text-[#121826] shadow-sm">
      <div className="border border-slate-300 p-2">
        <header className="flex items-start justify-between gap-3 border-b-[3px] border-[#2510a3] pb-2.5">
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full border-[3px] border-[#2510a3] text-2xl font-black italic text-[#04a9df]">A</div>
            <div>
              <h1 className="text-2xl font-black tracking-[0.12em] text-[#141a2f]">{receipt.instituteName}</h1>
              <p className="text-center text-sm font-black tracking-[0.34em] text-[#2510a3]">TECH</p>
              <p className="text-center text-[9px] font-bold tracking-[0.22em] text-slate-600">{receipt.tagline}</p>
            </div>
          </div>
          <div className="min-w-[180px] text-right">
            <p className="rounded-md bg-[#2510a3] px-4 py-1.5 text-center text-lg font-black uppercase text-white">Fee Receipt</p>
            <p className="mt-2 text-xs">
              Receipt No. <span className="font-black text-red-600">{receipt.receiptNumber}</span>
            </p>
            <p className="mt-1 text-xs">
              Date : <span className="font-bold">{displayDate(receipt.receiptDate)}</span>
            </p>
          </div>
        </header>

        <section className="mt-2.5 grid border border-slate-400 md:grid-cols-2">
          <InfoRows
            rows={[
              ["Student Name", receipt.studentName],
              ["Course", receipt.course],
              ["Batch", receipt.batch],
              ["Student ID", receipt.studentId]
            ]}
          />
          <InfoRows
            rows={[
              ["Receipt Type", receipt.receiptType],
              ["Payment Mode", receipt.paymentMode],
              ["Payment Date", displayDate(receipt.paymentDate)]
            ]}
          />
        </section>

        <table className="mt-2.5 w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#080e3f] text-white">
              <th className="border border-slate-400 px-3 py-2 text-left uppercase">Particulars</th>
              <th className="border border-slate-400 px-3 py-2 text-right uppercase">Amount (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, amount]) => (
              <tr key={label}>
                <td className="border border-slate-300 px-3 py-1.5 font-semibold">{label}</td>
                <td className="border border-slate-300 px-3 py-1.5 text-right font-semibold">{money(amount)}</td>
              </tr>
            ))}
            <tr className="font-black">
              <td className="border border-slate-300 px-3 py-2 uppercase">Total Amount (Rs.)</td>
              <td className="border border-slate-300 px-3 py-2 text-right">{money(totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <section className="mt-2.5 grid gap-3 md:grid-cols-[1fr_120px_170px]">
          <div>
            <p className="text-xs font-black text-[#2510a3]">Amount in Words</p>
            <p className="mt-0.5 text-xs font-semibold">{amountInWords(totalAmount)}</p>

            <p className="mt-3 text-xs font-black text-[#2510a3]">Payment Details:</p>
            <dl className="mt-1 space-y-0.5 text-xs">
              <Detail label="Mode of Payment" value={receipt.paymentMode} />
              <Detail label="Transaction ID" value={receipt.transactionId} />
              <Detail label="Payment Date" value={displayDate(receipt.paymentDate)} />
            </dl>
          </div>
          <div className="grid place-items-center">
            <div className="grid h-24 w-24 place-items-center rounded-full border-[3px] border-[#2510a3] text-center text-[9px] font-black uppercase text-[#2510a3]">
              Authorized<br />Signature
            </div>
          </div>
          <div className="flex flex-col items-center justify-end">
            <p className="font-serif text-xl italic text-[#2510a3]">{receipt.authorizedName}</p>
            <div className="mt-3 w-full border-t border-slate-500 pt-1.5 text-center text-xs font-semibold">Authorized Signatory</div>
          </div>
        </section>

        <section className="mt-3 text-[11px]">
          <p className="font-black text-[#2510a3]">Notes:</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            <li>{receipt.noteOne}</li>
            <li>{receipt.noteTwo}</li>
            <li>{receipt.noteThree}</li>
          </ul>
        </section>

        <footer className="mt-3 grid gap-2 rounded-md bg-[#080e3f] px-3 py-2 text-[11px] font-semibold text-white md:grid-cols-4">
          <p>{receipt.address}</p>
          <p>{receipt.phone}</p>
          <p>{receipt.website}</p>
          <p>{receipt.email}</p>
        </footer>
      </div>
    </article>
  );
}

function InfoRows({ rows }) {
  return (
    <dl className="space-y-1.5 border-slate-400 p-2.5 text-xs md:border-r">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[95px_10px_1fr] gap-2">
          <dt className="font-black">{label}</dt>
          <dd>:</dd>
          <dd className="font-semibold">{value || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}

function Detail({ label, value }) {
  return (
    <div className="grid grid-cols-[100px_10px_1fr]">
      <dt>{label}</dt>
      <dd>:</dd>
      <dd className="font-semibold">{value || "-"}</dd>
    </div>
  );
}
