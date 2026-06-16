import React, { useEffect, useRef, useState } from "react";
import { Download, Edit3, Printer, Save, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateCertificate } from "../store/certificatesSlice.js";
import { downloadCertificatePdf } from "../utils/certificatePdf.js";
import { CertificatePreview } from "./CertificatePreview.jsx";

const editableFields = [
  ["studentName", "Student Name", "text"],
  ["studentId", "Student ID", "text"],
  ["courseName", "Course Name", "text"],
  ["batch", "Batch", "text"],
  ["issueDate", "Issue Date", "date"]
];

export function CertificateModal({ open, certificate, onClose }) {
  const dispatch = useDispatch();
  const { saving } = useSelector((state) => state.certificates);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const printRef = useRef(null);

  useEffect(() => {
    if (!certificate) return;
    setForm({
      studentName: certificate.studentName || "",
      studentId: certificate.studentId || "",
      courseName: certificate.courseName || "",
      batch: certificate.batch || "",
      issueDate: certificate.issueDate?.slice(0, 10) || ""
    });
    setEditing(false);
  }, [certificate]);

  if (!open || !certificate) return null;

  const preview = { ...certificate, ...form };

  function printCertificate() {
    document.body.classList.add("printing-certificate");
    window.print();
    setTimeout(() => document.body.classList.remove("printing-certificate"), 300);
  }

  async function save() {
    await dispatch(updateCertificate({ id: certificate._id, values: form })).unwrap();
    setEditing(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/50 p-3 print:static print:bg-white print:p-0">
      <div className="mx-auto grid h-[94vh] max-w-7xl overflow-hidden rounded-lg bg-white shadow-soft lg:grid-cols-[1fr_360px] print:block print:h-auto print:max-w-none print:rounded-none print:shadow-none">
        <section className="min-h-0 overflow-y-auto bg-slate-100 p-4 print:overflow-visible print:bg-white print:p-0">
          <div ref={printRef}>
            <CertificatePreview certificate={preview} />
          </div>
        </section>

        <aside className="no-print min-h-0 overflow-y-auto border-l border-slate-200 bg-white">
          <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Certificate Preview</h2>
                <p className="text-sm text-slate-500">{certificate.certificateNumber || certificate.certificateNo}</p>
              </div>
              <button onClick={onClose} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close certificate">
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={printCertificate} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <Printer size={16} /> Print
              </button>
              <button onClick={() => downloadCertificatePdf(printRef.current, certificate.certificateNumber || certificate.certificateNo)} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                <Download size={16} /> PDF
              </button>
              <button onClick={() => setEditing((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-3 py-2 text-sm font-semibold text-white hover:bg-[#111315]">
                <Edit3 size={16} /> Edit
              </button>
              <button onClick={save} disabled={!editing || saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111315] px-3 py-2 text-sm font-semibold text-white hover:bg-[#f97316] disabled:opacity-50">
                <Save size={16} /> Save
              </button>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <h3 className="text-xs font-black uppercase text-slate-500">Editable Fields</h3>
            {editableFields.map(([key, label, type]) => (
              <label key={key} className="block text-sm">
                <span className="font-semibold text-slate-600">{label}</span>
                <input
                  disabled={!editing}
                  type={type}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#f97316] disabled:bg-slate-50"
                  value={form[key] || ""}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                />
              </label>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
