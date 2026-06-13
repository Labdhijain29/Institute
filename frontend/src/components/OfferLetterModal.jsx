import React, { useEffect, useRef, useState } from "react";
import { Download, Edit3, Printer, Save, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateOffer } from "../store/offersSlice.js";
import { downloadOfferPdf } from "../utils/offerPdf.js";
import { OfferLetterPreview } from "./OfferLetterPreview.jsx";

const editableFields = [
  ["studentName", "Student Name", "text"],
  ["studentId", "Student ID", "text"],
  ["courseName", "Course Name", "text"],
  ["batch", "Batch", "text"],
  ["feeOffered", "Fee Offered", "number"],
  ["startDate", "Start Date", "date"],
  ["offerDate", "Offer Date", "date"],
  ["remarks", "Remarks", "textarea"]
];

export function OfferLetterModal({ open, offer, onClose }) {
  const dispatch = useDispatch();
  const { saving } = useSelector((state) => state.offers);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const printRef = useRef(null);

  useEffect(() => {
    if (!offer) return;
    setForm({
      studentName: offer.studentName || "",
      studentId: offer.studentId || "",
      courseName: offer.courseName || "",
      batch: offer.batch || "",
      feeOffered: offer.feeOffered || 0,
      startDate: offer.startDate?.slice(0, 10) || "",
      offerDate: offer.offerDate?.slice(0, 10) || "",
      remarks: offer.remarks || ""
    });
    setEditing(false);
  }, [offer]);

  if (!open || !offer) return null;

  const preview = { ...offer, ...form };

  function printOffer() {
    window.print();
  }

  async function save() {
    await dispatch(updateOffer({ id: offer._id, values: form })).unwrap();
    setEditing(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 p-3 print:static print:bg-white print:p-0">
      <div className="mx-auto grid h-[94vh] max-w-6xl overflow-hidden rounded-lg bg-white shadow-soft lg:grid-cols-[1fr_360px] print:block print:h-auto print:max-w-none print:rounded-none print:shadow-none">
        <section className="min-h-0 overflow-y-auto bg-slate-100 p-4 print:overflow-visible print:bg-white print:p-0">
          <div ref={printRef}>
            <OfferLetterPreview offer={preview} />
          </div>
        </section>

        <aside className="no-print min-h-0 overflow-y-auto border-l border-slate-200 bg-white">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Offer Letter</h2>
                <p className="text-sm text-slate-500">{offer.studentId}</p>
              </div>
              <button onClick={onClose} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close offer letter">
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={printOffer} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <Printer size={16} /> Print
              </button>
              <button onClick={() => downloadOfferPdf(printRef.current, preview.studentId)} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <Download size={16} /> PDF
              </button>
              <button onClick={() => setEditing((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-md bg-pine px-3 py-2 text-sm font-semibold text-white">
                <Edit3 size={16} /> Edit
              </button>
              <button onClick={save} disabled={!editing || saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                <Save size={16} /> Save
              </button>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <h3 className="text-xs font-black uppercase text-slate-500">Editable Fields</h3>
            {editableFields.map(([key, label, type]) => (
              <label key={key} className="block text-sm">
                <span className="font-semibold text-slate-600">{label}</span>
                {type === "textarea" ? (
                  <textarea
                    disabled={!editing}
                    className="mt-1 min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-pine disabled:bg-slate-50"
                    value={form[key] || ""}
                    onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  />
                ) : (
                  <input
                    disabled={!editing}
                    type={type}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-pine disabled:bg-slate-50"
                    value={form[key] ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, [key]: type === "number" ? Number(event.target.value) : event.target.value }))
                    }
                  />
                )}
              </label>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
