import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Download, Edit3, Eye, Plus, Printer, Trash2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { CertificateModal } from "../components/CertificateModal.jsx";
import { CertificatePreview } from "../components/CertificatePreview.jsx";
import { createCertificate, deleteCertificate, fetchCertificates } from "../store/certificatesSlice.js";
import { downloadCertificatePdf } from "../utils/certificatePdf.js";

const emptyCertificate = {
  studentName: "",
  studentId: "",
  courseName: "",
  batch: "",
  issueDate: new Date().toISOString().slice(0, 10)
};

const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-");

export function CertificatesPage() {
  const dispatch = useDispatch();
  const { items, loading, saving, error } = useSelector((state) => state.certificates);
  const [search, setSearch] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [form, setForm] = useState(emptyCertificate);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    dispatch(fetchCertificates());
  }, [dispatch]);

  const filteredItems = useMemo(() => items, [items]);

  async function searchCertificates(event) {
    event.preventDefault();
    await dispatch(fetchCertificates(search));
  }

  async function generateCertificate(event) {
    event.preventDefault();
    setLocalError("");
    setMessage("");
    try {
      const created = await dispatch(createCertificate(form)).unwrap();
      await dispatch(fetchCertificates(search));
      setForm(emptyCertificate);
      setGenerateOpen(false);
      setSelected(created);
      setMessage(`Certificate ${created.certificateNumber || created.certificateNo} generated successfully`);
    } catch (err) {
      setLocalError(err?.message || "Certificate generate nahi ho pa raha. Backend restart karke dobara try karein.");
    }
  }

  async function removeCertificate(certificate) {
    const ok = window.confirm(`Delete certificate ${certificate.certificateNumber || certificate.certificateNo}?`);
    if (!ok) return;
    await dispatch(deleteCertificate(certificate._id)).unwrap();
    setMessage("Certificate deleted");
  }

  async function quickPdf(certificate) {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<CertificatePreview certificate={certificate} />);
    setTimeout(async () => {
      await downloadCertificatePdf(container.firstChild, certificate.certificateNumber || certificate.certificateNo);
      root.unmount();
      container.remove();
    }, 100);
  }

  function quickPrint(certificate) {
    setSelected(certificate);
    setTimeout(() => {
      document.body.classList.add("printing-certificate");
      window.print();
      setTimeout(() => document.body.classList.remove("printing-certificate"), 300);
    }, 100);
  }

  return (
    <div className="space-y-5">
      <section className="no-print rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black">Certificate Dashboard</h2>
            <p className="text-sm text-slate-500">Generate, edit, print and download premium completion certificates.</p>
          </div>
          <button onClick={() => setGenerateOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white hover:bg-ink">
            <Plus size={17} /> Generate Certificate
          </button>
        </div>
        <form onSubmit={searchCertificates} className="mt-4 flex flex-col gap-2 md:flex-row">
          <input
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-pine"
            placeholder="Search by Student Name, Student ID, Certificate Number"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Search</button>
        </form>
      </section>

      {(message || error || localError) && (
        <p className={`no-print rounded-md border px-4 py-3 text-sm font-semibold ${localError || error ? "border-coral/30 bg-coral/10 text-coral" : "border-pine/20 bg-pine/10 text-pine"}`}>
          {localError || error || message}
        </p>
      )}

      <div className="table-wrap rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Certificate No</th>
              <th className="px-4 py-3 font-semibold">Student Name</th>
              <th className="px-4 py-3 font-semibold">Student ID</th>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Batch</th>
              <th className="px-4 py-3 font-semibold">Issue Date</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((certificate) => (
              <tr key={certificate._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold">{certificate.certificateNumber || certificate.certificateNo}</td>
                <td className="px-4 py-3">{certificate.studentName}</td>
                <td className="px-4 py-3">{certificate.studentId}</td>
                <td className="px-4 py-3">{certificate.courseName}</td>
                <td className="px-4 py-3">{certificate.batch}</td>
                <td className="px-4 py-3">{date(certificate.issueDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelected(certificate)} className="rounded-md border border-slate-200 p-2 text-pine hover:bg-pine/10" title="View">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => setSelected(certificate)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Edit">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => quickPrint(certificate)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Print">
                      <Printer size={16} />
                    </button>
                    <button onClick={() => quickPdf(certificate)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Download PDF">
                      <Download size={16} />
                    </button>
                    <button onClick={() => removeCertificate(certificate)} className="rounded-md border border-slate-200 p-2 text-coral hover:bg-coral/10" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredItems.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                  {loading ? "Loading certificates..." : "No certificates found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <GenerateCertificateModal
        open={generateOpen}
        form={form}
        setForm={setForm}
        saving={saving}
        onSubmit={generateCertificate}
        onClose={() => setGenerateOpen(false)}
      />
      <CertificateModal open={Boolean(selected)} certificate={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function GenerateCertificateModal({ open, form, setForm, saving, onSubmit, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-3">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2 className="text-lg font-black">Generate Certificate</h2>
            <p className="text-sm text-slate-500">Certificate number is created automatically.</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="grid gap-3 p-4 md:grid-cols-2">
          {[
            ["studentName", "Student Name", "text"],
            ["studentId", "Student ID", "text"],
            ["courseName", "Course Name", "text"],
            ["batch", "Batch", "text"],
            ["issueDate", "Issue Date", "date"]
          ].map(([key, label, type]) => (
            <label key={key} className="block text-sm">
              <span className="font-semibold text-slate-600">{label}</span>
              <input
                required
                type={type}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-pine"
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
              />
            </label>
          ))}
          <div className="flex flex-col-reverse gap-2 md:col-span-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button>
            <button disabled={saving} className="rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {saving ? "Generating..." : "Generate Certificate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
