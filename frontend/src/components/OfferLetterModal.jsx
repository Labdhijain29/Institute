import React, { useEffect, useRef, useState } from "react";
import { Download, Edit3, Printer, Save, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateOffer } from "../store/offersSlice.js";
import { downloadOfferPdf } from "../utils/offerPdf.js";
import { OfferLetterPreview } from "./OfferLetterPreview.jsx";

const editableGroups = [
  {
    title: "Basic Information",
    fields: [
      ["studentName", "Name", "text"],
      ["studentId", "ID", "text"],
      ["email", "Email", "email"],
      ["phone", "Phone", "text"],
      ["address", "Address", "textarea"]
    ]
  },
  {
    title: "Course Details",
    fields: [
      ["courseName", "Course Name", "text"],
      ["duration", "Duration", "text"],
      ["batch", "Batch", "text"],
      ["department", "Department", "text"]
    ]
  },
  {
    title: "Financial Details",
    fields: [
      ["feeOffered", "Fee", "number"],
      ["scholarship", "Scholarship", "number"],
      ["finalAmount", "Final Amount", "number"],
      ["paymentSchedule", "Payment Schedule", "textarea"]
    ]
  },
  {
    title: "Dates",
    fields: [
      ["offerDate", "Offer Date", "date"],
      ["joiningDate", "Joining Date", "date"],
      ["validTill", "Valid Till Date", "date"],
      ["startDate", "Start Date", "date"],
      ["endDate", "End Date", "date"]
    ]
  },
  {
    title: "Company Details",
    fields: [
      ["authorizedSignatory", "Authorized Signatory", "text"],
      ["hrContact", "HR Contact", "text"],
      ["branchLocation", "Branch Location", "text"],
      ["reportingManager", "Reporting Manager", "text"],
      ["trainingLocation", "Training Location", "text"],
      ["mode", "Mode", "text"],
      ["documentNumber", "Document Number", "text"],
      ["offerLetterId", "Offer Letter ID", "text"],
      ["companyCinGst", "CIN/GST Number", "text"]
    ]
  },
  {
    title: "Remarks",
    fields: [["remarks", "Custom Notes", "textarea"]]
  }
];

const dateValue = (value) => value?.slice?.(0, 10) || "";

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
      email: offer.email || "",
      phone: offer.phone || "",
      address: offer.address || "",
      courseName: offer.courseName || "",
      batch: offer.batch || "",
      department: offer.department || "",
      duration: offer.duration || "",
      feeOffered: offer.feeOffered || 0,
      scholarship: offer.scholarship || 0,
      finalAmount: offer.finalAmount || 0,
      paymentSchedule: offer.paymentSchedule || "",
      startDate: dateValue(offer.startDate),
      endDate: dateValue(offer.endDate),
      offerDate: dateValue(offer.offerDate),
      joiningDate: dateValue(offer.joiningDate),
      validTill: dateValue(offer.validTill),
      authorizedSignatory: offer.authorizedSignatory || "",
      hrContact: offer.hrContact || "",
      branchLocation: offer.branchLocation || "",
      reportingManager: offer.reportingManager || "",
      trainingLocation: offer.trainingLocation || "",
      mode: offer.mode || "Offline",
      documentNumber: offer.documentNumber || "",
      offerLetterId: offer.offerLetterId || "",
      companyCinGst: offer.companyCinGst || "",
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
              <button onClick={() => downloadOfferPdf(printRef.current, preview)} className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
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
            {editableGroups.map((group) => (
              <section key={group.title} className="rounded-lg border border-slate-200 p-3">
                <h4 className="mb-3 text-xs font-black uppercase text-[#f97316]">{group.title}</h4>
                <div className="space-y-3">
                  {group.fields.map(([key, label, type]) => (
                    <EditableField key={key} fieldKey={key} label={label} type={type} editing={editing} form={form} setForm={setForm} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function EditableField({ fieldKey, label, type, editing, form, setForm }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-600">{label}</span>
      {type === "textarea" ? (
        <textarea
          disabled={!editing}
          className="mt-1 min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#f97316] disabled:bg-slate-50"
          value={form[fieldKey] || ""}
          onChange={(event) => setForm((current) => ({ ...current, [fieldKey]: event.target.value }))}
        />
      ) : (
        <input
          disabled={!editing}
          type={type}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-[#f97316] disabled:bg-slate-50"
          value={form[fieldKey] ?? ""}
          onChange={(event) => setForm((current) => ({ ...current, [fieldKey]: type === "number" ? Number(event.target.value) : event.target.value }))}
        />
      )}
    </label>
  );
}
