import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, Printer, Save, X } from "lucide-react";
import { amountInWords } from "../utils/amountInWords.js";
import { downloadReceiptPdf } from "../utils/pdf.js";
import { calculateFeeSummary } from "../utils/feeSummary.js";
import { BrandLockup } from "./BrandLogo.jsx";

const defaultReceipt = {
  instituteName: "Coding Walla",
  tagline: "LEARN * BUILD * GET HIRED",
  address: "1st Floor, 91, Ratna Lok Colony RD, Near Medanta Hospital, Vijay nagar, Indore, MP, 452010",
  phone: "+91 9098875825",
  email: "info@codingwallah.com",
  website: "www.codingwallah.com",
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
  currentPayment: 55000,
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
  const [alreadyPaid, setAlreadyPaid] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef(null);

  const summary = useMemo(() => calculateFeeSummary(receipt, alreadyPaid), [receipt, alreadyPaid]);

  useEffect(() => {
    if (!open) return;
    const savedReceipts = readSavedReceipts();
    const previousPayments = savedReceipts
      .filter((item) => item.studentId === receipt.studentId && item.receiptNumber !== receipt.receiptNumber)
      .reduce((sum, item) => sum + Number(item.currentPayment || 0), 0);
    setAlreadyPaid(previousPayments);
  }, [open, receipt.studentId, receipt.receiptNumber]);

  if (!open) return null;

  function updateField(key, value, type) {
    setSaved(false);
    setError("");
    setReceipt((current) => ({
      ...current,
      [key]: type === "number" ? Number(value) : value
    }));
  }

  function saveDraft() {
    if (!validatePayment()) return;
    const savedReceipts = readSavedReceipts();
    const savedReceipt = { ...receipt, ...summary, savedAt: new Date().toISOString() };
    const existingIndex = savedReceipts.findIndex((item) => item.receiptNumber === receipt.receiptNumber);
    if (existingIndex >= 0) savedReceipts[existingIndex] = savedReceipt;
    else savedReceipts.push(savedReceipt);
    localStorage.setItem("fee_receipts", JSON.stringify(savedReceipts));
    localStorage.setItem("fee_receipt_draft", JSON.stringify(savedReceipt));
    setSaved(true);
  }

  function loadDraft() {
    const draft = localStorage.getItem("fee_receipt_draft");
    if (draft) {
      const parsed = JSON.parse(draft);
      setReceipt({ ...defaultReceipt, ...parsed });
      setError("");
    }
  }

  function validatePayment() {
    if (!summary.hasOverpayment) return true;
    setError("Current payment cannot exceed the remaining due amount.");
    setSaved(false);
    return false;
  }

  function printReceipt() {
    if (validatePayment()) window.print();
  }

  function downloadPdf() {
    if (validatePayment()) downloadReceiptPdf(printRef.current, receipt.receiptNumber);
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 p-3 print:static print:bg-white print:p-0">
      <div className="mx-auto grid h-[94vh] max-w-6xl overflow-hidden rounded-lg bg-white shadow-soft lg:grid-cols-[minmax(0,1fr)_360px] print:block print:h-auto print:max-w-none print:rounded-none print:shadow-none">
        <section className="min-h-0 overflow-y-auto bg-slate-100 p-3 print:overflow-visible print:bg-white print:p-0">
          <div ref={printRef}>
            <ReceiptTemplate receipt={receipt} summary={summary} />
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
              <button onClick={printReceipt} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <Printer size={16} /> Print
              </button>
              <button onClick={downloadPdf} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <Download size={16} /> PDF
              </button>
              <button onClick={saveDraft} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-3 py-2 text-sm font-semibold text-white hover:bg-[#111315]">
                <Save size={16} /> Save
              </button>
              <button onClick={loadDraft} className="rounded-md bg-[#111315] px-3 py-2 text-sm font-semibold text-white hover:bg-[#f97316]">Load Draft</button>
            </div>
            {saved && <p className="mt-2 text-xs font-semibold text-[#ea580c]">Draft saved in this browser.</p>}
            {error && <p role="alert" className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}
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
                        className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#f97316]"
                        type={type}
                        value={receipt[key] ?? ""}
                        onChange={(event) => updateField(key, event.target.value, type)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <h3 className="mb-3 text-xs font-black uppercase text-slate-500">Payment Summary</h3>
              <div className="space-y-3">
                <SummaryField label="Net Payable" value={summary.netPayable} />
                <SummaryField label="Already Paid" value={summary.alreadyPaid} />
                <label className="block text-sm">
                  <span className="font-semibold text-slate-600">Current Payment</span>
                  <input
                    min="0"
                    type="number"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#f97316]"
                    value={receipt.currentPayment ?? ""}
                    onChange={(event) => updateField("currentPayment", event.target.value, "number")}
                  />
                </label>
                <SummaryField label="Total Paid" value={summary.totalPaid} />
                <SummaryField label="Remaining Due" value={summary.remainingDue} />
                <SummaryField label="Payment Status" value={summary.paymentStatus} moneyValue={false} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReceiptTemplate({ receipt, summary }) {
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
        <header className="receipt-header flex items-start justify-between gap-3 border-b-[3px] border-[#f97316] bg-black pb-2.5">
          <BrandLockup logoClassName="h-12 w-auto" variant="dark" />
          <div className="min-w-[180px] text-right">
            <p className="px-4 py-1.5 text-center text-lg font-black uppercase text-white">Fee Receipt</p>
            <p className="mt-2 text-xs text-white">
              Receipt No. <span className="font-black text-red-600">{receipt.receiptNumber}</span>
            </p>
            <p className="mt-1 text-xs text-white">
              Date : <span className="font-bold text-[#f97316]">{displayDate(receipt.receiptDate)}</span>
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
            <tr className="bg-[#111315] text-white">
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
              <td className="border border-slate-300 px-3 py-2 text-right">{money(summary.netPayable)}</td>
            </tr>
          </tbody>
        </table>

        <section className="mt-2.5">
          <p className="bg-[#111315] px-3 py-2 text-xs font-black uppercase text-white">Fee Summary</p>
          <dl className="grid grid-cols-2 border-x border-slate-300 text-xs md:grid-cols-3">
            <FeeSummaryItem label="Net Payable" value={money(summary.netPayable)} />
            <FeeSummaryItem label="Already Paid" value={money(summary.alreadyPaid)} />
            <FeeSummaryItem label="Current Payment" value={money(summary.currentPayment)} />
            <FeeSummaryItem label="Total Paid" value={money(summary.totalPaid)} />
            <FeeSummaryItem label="Remaining Due" value={money(summary.remainingDue)} />
            <FeeSummaryItem label="Payment Status" value={summary.paymentStatus} />
          </dl>
        </section>

        <section className="mt-2.5 grid gap-3 md:grid-cols-[1fr_170px]">
          <div>
            <p className="text-xs font-black text-[#f97316]">Amount in Words</p>
            <p className="mt-0.5 text-xs font-semibold">{amountInWords(summary.currentPayment)}</p>

            <p className="mt-3 text-xs font-black text-[#f97316]">Payment Details:</p>
            <dl className="mt-1 space-y-0.5 text-xs">
              <Detail label="Mode of Payment" value={receipt.paymentMode} />
              <Detail label="Transaction ID" value={receipt.transactionId} />
              <Detail label="Payment Date" value={displayDate(receipt.paymentDate)} />
            </dl>
          </div>
          <div className="flex flex-col items-center justify-end">
            <div className="w-full border-t border-slate-500 pt-1.5 text-center text-xs font-semibold">Authorized Signatory</div>
          </div>
        </section>

        <section className="mt-3 text-[11px]">
          <p className="font-black text-[#f97316]">Notes:</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            <li>{receipt.noteOne}</li>
            <li>{receipt.noteTwo}</li>
            <li>{receipt.noteThree}</li>
          </ul>
        </section>

        <footer className="mt-3 grid gap-2 rounded-md bg-[#111315] px-3 py-2 text-[11px] font-semibold text-white md:grid-cols-4">
          <p>{receipt.address}</p>
          <p>{receipt.phone}</p>
          <p>{receipt.website}</p>
          <p>{receipt.email}</p>
        </footer>
      </div>
    </article>
  );
}

function readSavedReceipts() {
  try {
    const value = JSON.parse(localStorage.getItem("fee_receipts") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function SummaryField({ label, value, moneyValue = true }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-600">{label}</span>
      <input readOnly className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600" value={moneyValue ? money(value) : value} />
    </label>
  );
}

function FeeSummaryItem({ label, value }) {
  return (
    <div className="border-b border-r border-slate-300 px-3 py-1.5">
      <dt className="font-semibold text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-black">{value}</dd>
    </div>
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
