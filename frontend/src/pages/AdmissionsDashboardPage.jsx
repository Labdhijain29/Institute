import React, { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, UserCheck, X } from "lucide-react";
import { api } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";
import { StatCard } from "../components/StatCard.jsx";

const inputClass = "h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#f97316] disabled:bg-slate-100";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]";
const secondaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#f97316] hover:text-[#c2410c]";

const idOf = (value) => value?._id || value || "";
const todayInput = () => new Date().toISOString().slice(0, 10);

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("en-IN") : "-";
}

function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
}

function downloadFile(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows = []) {
  const headers = ["Date", "Student ID", "Name", "Mobile", "Course", "Batch", "Status"];
  const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const body = rows.map((row) => [
    formatDate(row.admissionDate || row.createdAt),
    row.studentId,
    row.name,
    row.mobile,
    row.courseName,
    row.batchName,
    row.status
  ].map(cell).join(","));
  return [headers.join(","), ...body].join("\n");
}

function Panel({ title, children, action }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function admissionStage(lead) {
  if (lead.convertedStudent || lead.admissionStatus === "Done" || ["Admission Done", "Converted"].includes(lead.status)) return "Converted";
  if (lead.facultyAssigned || lead.status === "Forwarded to Faculty" || lead.status === "Faculty Approved") return "Faculty Review";
  if (lead.counsellorAssigned || ["Forwarded", "Forwarded to Counsellor"].includes(lead.status)) return "Counselling";
  return "Enquiry";
}

export function AdmissionsDashboardPage() {
  const [leads, setLeads] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [fees, setFees] = useState([]);
  const [activeLead, setActiveLead] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("Ready");
  const [form, setForm] = useState({
    course: "",
    batch: "",
    totalFees: "",
    discount: "0",
    initialPayment: "0",
    paymentMode: "Cash",
    admissionDate: todayInput()
  });

  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [leadData, studentData, courseData, batchData, feeData] = await Promise.all([
        api("/leads?limit=100"),
        api("/students?limit=100"),
        api("/courses?limit=100"),
        api("/batches?limit=100"),
        api("/fees?limit=100")
      ]);
      setLeads(leadData.items || []);
      setStudents(studentData.items || []);
      setCourses(courseData.items || []);
      setBatches(batchData.items || []);
      setFees(feeData.items || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const courseMap = useMemo(() => Object.fromEntries(courses.map((course) => [course._id, course])), [courses]);
  const batchMap = useMemo(() => Object.fromEntries(batches.map((batch) => [batch._id, batch])), [batches]);

  const enrichedStudents = useMemo(() => students.map((student) => ({
    ...student,
    courseName: courseMap[idOf(student.course)]?.name || student.courseName || "Not assigned",
    batchName: batchMap[idOf(student.batch)]?.name || "Not assigned"
  })), [batchMap, courseMap, students]);

  const activeStudents = enrichedStudents.filter((student) => student.status === "Active");
  const convertedLeads = leads.filter((lead) => admissionStage(lead) === "Converted");
  const readyLeads = leads.filter((lead) => !lead.convertedStudent && (["Faculty Approved", "Forwarded to Faculty", "Converted"].includes(lead.status) || lead.admissionStatus === "Done"));
  const counsellingLeads = leads.filter((lead) => admissionStage(lead) === "Counselling");
  const totalBooked = fees.reduce((sum, fee) => sum + Number(fee.totalFees || 0), 0);
  const totalPending = fees.reduce((sum, fee) => sum + Number(fee.pendingFees || 0), 0);

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const stage = admissionStage(lead);
    if (filter === "All") return true;
    if (filter === "Ready") return readyLeads.some((item) => item._id === lead._id);
    return stage === filter;
  }), [filter, leads, readyLeads]);

  const openAdmission = (lead) => {
    const courseId = idOf(lead.courseInterested);
    const course = courseMap[courseId];
    setActiveLead(lead);
    setForm({
      course: courseId || "",
      batch: "",
      totalFees: course?.fees ?? "",
      discount: "0",
      initialPayment: "0",
      paymentMode: "Cash",
      admissionDate: todayInput()
    });
  };

  const selectCourse = (courseId) => {
    const course = courseMap[courseId];
    setForm({ ...form, course: courseId, batch: "", totalFees: course?.fees ?? "" });
  };

  const convertLead = async (event) => {
    event.preventDefault();
    if (!activeLead?._id) return;
    try {
      await api(`/leads/${activeLead._id}/convert`, {
        method: "POST",
        body: JSON.stringify({
          course: form.course,
          batch: form.batch || undefined,
          totalFees: Number(form.totalFees) || 0,
          discount: Number(form.discount) || 0,
          initialPayment: Number(form.initialPayment) || 0,
          paymentMode: form.paymentMode
        })
      });
      setMessage("Admission completed and fee record initialized");
      setActiveLead(null);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const courseNameForLead = (lead) => lead.courseName || courseMap[idOf(lead.courseInterested)]?.name || (typeof lead.courseInterested === "string" ? lead.courseInterested : "-");
  const availableBatches = batches.filter((batch) => idOf(batch.course) === form.course && !["Completed", "Cancelled"].includes(batch.status));

  const leadColumns = [
    { key: "leadDate", label: "Date", render: (row) => formatDate(row.leadDate || row.createdAt) },
    { key: "name", label: "Name" },
    { key: "mobile", label: "Mobile" },
    { key: "courseInterested", label: "Course", render: (row) => courseNameForLead(row) },
    { key: "priority", label: "Priority" },
    { key: "stage", label: "Stage", render: (row) => admissionStage(row) },
    { key: "status", label: "Status" },
    { key: "remarks", label: "Remarks" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => row.convertedStudent ? "-" : (
        <button onClick={() => openAdmission(row)} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-[#ea580c] hover:bg-[#fff3e8]">
          <UserCheck size={15} /> Admit
        </button>
      )
    }
  ];

  const studentColumns = [
    { key: "admissionDate", label: "Admission", render: (row) => formatDate(row.admissionDate || row.createdAt) },
    { key: "studentId", label: "Student ID" },
    { key: "name", label: "Name" },
    { key: "mobile", label: "Mobile" },
    { key: "courseName", label: "Course" },
    { key: "batchName", label: "Batch" },
    { key: "status", label: "Status" }
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#f97316]">Admissions Dashboard</p>
            <h2 className="mt-1 text-2xl font-bold">Lead to admission control center</h2>
            <p className="mt-1 text-sm text-slate-500">Track counselling pipeline, convert ready leads, assign courses and initialize fees.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={load} className={secondaryButtonClass}><RefreshCw size={16} /> Refresh</button>
            <button onClick={() => downloadFile(`admissions-${todayInput()}.csv`, toCsv(enrichedStudents))} className={secondaryButtonClass}><Download size={16} /> Export CSV</button>
          </div>
        </div>
      </section>

      {message && <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{message}</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Active Admissions" value={activeStudents.length} tone="pine" />
        <StatCard label="Ready Leads" value={readyLeads.length} tone="amber" />
        <StatCard label="Counselling" value={counsellingLeads.length} tone="ink" />
        <StatCard label="Fees Booked" value={money(totalBooked)} tone="coral" />
        <StatCard label="Fees Pending" value={money(totalPending)} tone="amber" />
      </section>

      <Panel title="Admission Pipeline" action={loading ? <span className="text-sm text-slate-500">Loading...</span> : null}>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <select className={inputClass} value={filter} onChange={(event) => setFilter(event.target.value)}>
            {["Ready", "All", "Enquiry", "Counselling", "Faculty Review", "Converted"].map((item) => <option key={item}>{item}</option>)}
          </select>
          {["Enquiry", "Counselling", "Faculty Review"].map((stage) => (
            <div key={stage} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-500">{stage}:</span> <strong>{leads.filter((lead) => admissionStage(lead) === stage).length}</strong>
            </div>
          ))}
        </div>
        <DataTable columns={leadColumns} rows={filteredLeads} />
      </Panel>

      <Panel title="Recent Admissions">
        <DataTable columns={studentColumns} rows={enrichedStudents.slice(0, 30)} />
      </Panel>

      {activeLead && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Complete Admission</h2>
                <p className="text-sm text-slate-500">{activeLead.name} - {activeLead.mobile}</p>
              </div>
              <button onClick={() => setActiveLead(null)} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close admission modal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={convertLead} className="grid gap-3 sm:grid-cols-2">
              <Field label="Course">
                <select required className={inputClass} value={form.course} onChange={(event) => selectCourse(event.target.value)}>
                  <option value="">Select course</option>
                  {courses.filter((course) => course.isActive !== false).map((course) => <option key={course._id} value={course._id}>{course.name} ({course.duration || "Duration NA"})</option>)}
                </select>
              </Field>
              <Field label="Batch">
                <select className={inputClass} value={form.batch} onChange={(event) => setForm({ ...form, batch: event.target.value })} disabled={!form.course}>
                  <option value="">{form.course ? "Select batch" : "Select course first"}</option>
                  {availableBatches.map((batch) => <option key={batch._id} value={batch._id}>{batch.name} - {batch.timing || "Timing NA"}</option>)}
                </select>
              </Field>
              <Field label="Admission Date">
                <input type="date" className={inputClass} value={form.admissionDate} onChange={(event) => setForm({ ...form, admissionDate: event.target.value })} />
              </Field>
              <Field label="Total Fees">
                <input required min="0" type="number" className={inputClass} value={form.totalFees} onChange={(event) => setForm({ ...form, totalFees: event.target.value })} />
              </Field>
              <Field label="Discount">
                <input min="0" type="number" className={inputClass} value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} />
              </Field>
              <Field label="Initial Payment">
                <input min="0" type="number" className={inputClass} value={form.initialPayment} onChange={(event) => setForm({ ...form, initialPayment: event.target.value })} />
              </Field>
              <Field label="Payment Mode">
                <select className={inputClass} value={form.paymentMode} onChange={(event) => setForm({ ...form, paymentMode: event.target.value })}>
                  {["Cash", "UPI", "Card", "Bank Transfer", "Cheque"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <div className="flex items-end justify-end gap-2">
                <button type="button" onClick={() => setActiveLead(null)} className={secondaryButtonClass}>Cancel</button>
                <button className={buttonClass}><UserCheck size={16} /> Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
