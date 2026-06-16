import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, Edit3, Printer, Save, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearSelected, updateReceipt } from "../store/receiptsSlice.js";
import { downloadReceiptPdf } from "../utils/pdf.js";
import { ReceiptPreview } from "./ReceiptPreview.jsx";

const editableFields = [
  ["paymentDate", "Payment Date", "date"],
  ["paymentMode", "Payment Mode", "select"],
  ["transactionId", "Transaction ID", "text"],
  ["tuitionFee", "Tuition Fee", "number"],
  ["registrationFee", "Registration Fee", "number"],
  ["studyMaterialFee", "Study Material Fee", "number"],
  ["examFee", "Exam Fee", "number"],
  ["otherCharges", "Other Charges", "number"],
  ["discount", "Discount", "number"],
  ["totalCourseFee", "Total Course Fee", "number"],
  ["amountPaid", "Amount Paid", "number"],
  ["previousDue", "Previous Due", "number"]
];

export function ReceiptModal({ open, onClose, downloadOnReady = false, onDownloaded }) {
  const dispatch = useDispatch();
  const { selected, saving, loading, error } = useSelector((state) => state.receipts);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const printRef = useRef(null);

  useEffect(() => {
    if (!selected) return;
    setForm({
      paymentDate: selected.paymentDate?.slice(0, 10) || "",
      paymentMode: selected.paymentMode || "Cash",
      transactionId: selected.transactionId || "",
      tuitionFee: selected.tuitionFee || 0,
      registrationFee: selected.registrationFee || 0,
      studyMaterialFee: selected.studyMaterialFee || 0,
      examFee: selected.examFee || 0,
      otherCharges: selected.otherCharges || 0,
      discount: selected.discount || 0,
      totalCourseFee: selected.totalCourseFee || 0,
      amountPaid: selected.amountPaid || selected.totalAmount || 0,
      previousDue: selected.previousDue || 0
    });
    setEditing(false);
  }, [selected]);

  useEffect(() => {
    if (!downloadOnReady || !selected || !printRef.current) return;
    downloadReceiptPdf(printRef.current, selected.receiptNumber).finally(() => onDownloaded?.());
  }, [downloadOnReady, onDownloaded, selected]);

  const previewReceipt = useMemo(() => ({ ...selected, ...form }), [selected, form]);

  if (!open) return null;

  function close() {
    dispatch(clearSelected());
    onClose();
  }

  async function save() {
    await dispatch(updateReceipt({ id: selected._id, values: form })).unwrap();
    setEditing(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 p-3 print:static print:bg-white print:p-0">
      <div className="mx-auto flex max-h-[96vh] max-w-6xl flex-col rounded-lg bg-white shadow-soft print:max-h-none print:max-w-none print:rounded-none print:shadow-none">
        <div className="no-print flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black">Fee Receipt Preview</h2>
            <p className="text-sm text-slate-500">{selected?.receiptNumber || "Loading receipt..."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
              <Printer size={16} /> Print
            </button>
            <button onClick={() => downloadReceiptPdf(printRef.current, selected?.receiptNumber)} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
              <Download size={16} /> Download PDF
            </button>
            <button onClick={() => setEditing((value) => !value)} className="inline-flex items-center gap-2 rounded-md bg-[#f97316] px-3 py-2 text-sm font-semibold text-white hover:bg-[#111315]">
              <Edit3 size={16} /> Edit
            </button>
            <button onClick={close} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close receipt">
              <X size={18} />
            </button>
          </div>
        </div>

        {error && <p className="no-print mx-4 mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1fr_340px] print:block print:overflow-visible">
          <div className="bg-slate-100 p-4 print:bg-white print:p-0">
            {loading || !selected ? (
              <div className="grid min-h-[480px] place-items-center text-sm text-slate-500">Loading receipt...</div>
            ) : (
              <div ref={printRef}>
                <ReceiptPreview receipt={previewReceipt} />
              </div>
            )}
          </div>

          <aside className={`no-print border-l border-slate-200 p-4 ${editing ? "block" : "hidden lg:block"}`}>
            <h3 className="font-black">Edit Receipt</h3>
            <div className="mt-4 space-y-3">
              {editableFields.map(([key, label, type]) => (
                <label key={key} className="block text-sm">
                  <span className="font-semibold text-slate-600">{label}</span>
                  {type === "select" ? (
                    <select
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                      value={form[key] || "Cash"}
                      onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                    >
                      {["Cash", "UPI", "Card", "Bank Transfer", "Cheque"].map((mode) => (
                        <option key={mode}>{mode}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                      type={type}
                      value={form[key] ?? ""}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [key]: type === "number" ? Number(event.target.value) : event.target.value
                        }))
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            <button onClick={save} disabled={saving || !selected} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#111315] px-4 py-2 text-sm font-semibold text-white hover:bg-[#f97316] disabled:opacity-60">
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
