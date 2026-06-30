import React, { useEffect, useState } from "react";
import { Download, Edit3, Eye, Plus, Printer, Trash2, X } from "lucide-react";
import { createRoot } from "react-dom/client";
import { useDispatch, useSelector } from "react-redux";
import { OfferLetterModal } from "../components/OfferLetterModal.jsx";
import { OfferLetterPreview } from "../components/OfferLetterPreview.jsx";
import { createOffer, deleteOffer, fetchOffers } from "../store/offersSlice.js";
import { downloadOfferPdf } from "../utils/offerPdf.js";

const emptyOffer = {
  studentName: "",
  studentId: "",
  email: "",
  phone: "",
  address: "",
  courseName: "",
  batch: "",
  department: "",
  duration: "",
  feeOffered: 0,
  scholarship: 0,
  finalAmount: 0,
  paymentSchedule: "As per institute fee plan",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  offerDate: new Date().toISOString().slice(0, 10),
  joiningDate: "",
  validTill: "",
  authorizedSignatory: "Lakhan Rathod",
  hrContact: "info@codingwallah.com",
  branchLocation: "Indore",
  reportingManager: "Academic Coordinator",
  trainingLocation: "Coding Walla, Indore",
  mode: "Offline",
  documentNumber: "",
  offerLetterId: "",
  companyCinGst: "",
  remarks: ""
};

const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-");
const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export function OfferLettersPage() {
  const dispatch = useDispatch();
  const { items, loading, saving, error } = useSelector((state) => state.offers);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyOffer);
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(fetchOffers());
  }, [dispatch]);

  async function generateOffer(event) {
    event.preventDefault();
    setMessage("");
    const created = await dispatch(createOffer(form)).unwrap();
    setForm(emptyOffer);
    setGenerateOpen(false);
    setSelected(created);
    setMessage("Offer letter generated successfully");
  }

  async function removeOffer(offer) {
    const ok = window.confirm(`Delete offer letter for ${offer.studentName}?`);
    if (!ok) return;
    await dispatch(deleteOffer(offer._id)).unwrap();
    setMessage("Offer letter deleted");
  }

  async function quickPdf(offer) {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<OfferLetterPreview offer={offer} />);
    setTimeout(async () => {
      await downloadOfferPdf(container.firstChild, offer);
      root.unmount();
      container.remove();
    }, 100);
  }

  function quickPrint(offer) {
    setSelected(offer);
    setTimeout(() => window.print(), 100);
  }

  return (
    <div className="space-y-5">
      <section className="no-print rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black">Offer Letters</h2>
            <p className="text-sm text-slate-500">Generate, edit, print and download student admission offer letters.</p>
          </div>
          <button onClick={() => setGenerateOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]">
            <Plus size={17} /> Generate Offer Letter
          </button>
        </div>
      </section>

      {(message || error) && <p className="no-print rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{error || message}</p>}

      <div className="table-wrap rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Student Name</th>
              <th className="px-4 py-3 font-semibold">Student ID</th>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Batch</th>
              <th className="px-4 py-3 font-semibold">Fee Offered</th>
              <th className="px-4 py-3 font-semibold">Offer Date</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((offer) => (
              <tr key={offer._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{offer.studentName}</td>
                <td className="px-4 py-3">{offer.studentId}</td>
                <td className="px-4 py-3">{offer.courseName}</td>
                <td className="px-4 py-3">{offer.batch}</td>
                <td className="px-4 py-3 font-bold">{money(offer.feeOffered)}</td>
                <td className="px-4 py-3">{date(offer.offerDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelected(offer)} className="rounded-md border border-slate-200 p-2 text-[#ea580c] hover:bg-[#fff3e8]" title="View">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => setSelected(offer)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Edit">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => quickPrint(offer)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Print">
                      <Printer size={16} />
                    </button>
                    <button onClick={() => quickPdf(offer)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Download PDF">
                      <Download size={16} />
                    </button>
                    <button onClick={() => removeOffer(offer)} className="rounded-md border border-slate-200 p-2 text-[#ea580c] hover:bg-[#fff3e8]" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                  {loading ? "Loading offer letters..." : "No offer letters found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <GenerateOfferModal
        open={generateOpen}
        form={form}
        setForm={setForm}
        saving={saving}
        onSubmit={generateOffer}
        onClose={() => setGenerateOpen(false)}
      />
      <OfferLetterModal open={Boolean(selected)} offer={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function GenerateOfferModal({ open, form, setForm, saving, onSubmit, onClose }) {
  if (!open) return null;
  const requiredFields = new Set(["studentName", "studentId", "courseName", "batch", "feeOffered", "startDate", "offerDate"]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-3">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2 className="text-lg font-black">Generate Offer Letter</h2>
            <p className="text-sm text-slate-500">Fill editable offer details. Branding and terms are fixed.</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="grid gap-3 p-4 md:grid-cols-2">
          {[
            ["studentName", "Student Name", "text"],
            ["studentId", "Student ID", "text"],
            ["email", "Email", "email"],
            ["phone", "Phone", "text"],
            ["address", "Address", "text"],
            ["courseName", "Course Name", "text"],
            ["department", "Department", "text"],
            ["batch", "Batch", "text"],
            ["duration", "Duration", "text"],
            ["feeOffered", "Total Fee", "number"],
            ["scholarship", "Scholarship/Discount", "number"],
            ["finalAmount", "Final Amount", "number"],
            ["paymentSchedule", "Payment Schedule", "text"],
            ["offerDate", "Offer Date", "date"],
            ["joiningDate", "Joining Date", "date"],
            ["validTill", "Valid Till Date", "date"],
            ["startDate", "Start Date", "date"],
            ["endDate", "End Date", "date"],
            ["authorizedSignatory", "Authorized Signatory", "text"],
            ["hrContact", "HR Contact", "text"],
            ["branchLocation", "Branch Location", "text"],
            ["reportingManager", "Reporting Manager", "text"],
            ["trainingLocation", "Training Location", "text"],
            ["mode", "Mode", "text"]
          ].map(([key, label, type]) => (
            <label key={key} className="block text-sm">
              <span className="font-semibold text-slate-600">{label}</span>
              <input
                required={requiredFields.has(key)}
                type={type}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]"
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: type === "number" ? Number(event.target.value) : event.target.value }))}
              />
            </label>
          ))}
          <label className="block text-sm md:col-span-2">
            <span className="font-semibold text-slate-600">Remarks</span>
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]"
              value={form.remarks}
              onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))}
            />
          </label>
          <div className="flex flex-col-reverse gap-2 md:col-span-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button>
            <button disabled={saving} className="rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315] disabled:opacity-60">
              {saving ? "Generating..." : "Generate Offer Letter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
