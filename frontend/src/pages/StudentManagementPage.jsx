import React, { useEffect, useRef, useState } from "react";
import { Download, FileSearch, Pencil, Printer, UserCheck, UserPlus, X } from "lucide-react";
import { api } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";
import { RegistrationPaper } from "../student/pages/RegistrationForm.jsx";
import { downloadRegistrationPdf } from "../utils/registrationPdf.js";

const idOf = (value) => value?._id || value || "";
const initialAssignment = { course: "", batch: "", admissionDate: new Date().toISOString().slice(0, 10), totalFees: "", discount: "0" };

export function StudentManagementPage() {
  const [students, setStudents] = useState([]); const [courses, setCourses] = useState([]); const [batches, setBatches] = useState([]); const [fees, setFees] = useState([]);
  const [counsellors, setCounsellors] = useState([]); const [registrationOpen, setRegistrationOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null); const [reviewStudent, setReviewStudent] = useState(null); const [editStudent, setEditStudent] = useState(null); const [form, setForm] = useState(initialAssignment); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);

  const load = async () => {
    const [studentData, courseData, batchData, feeData, userData] = await Promise.all([api("/students?limit=100"), api("/courses?limit=100"), api("/batches?limit=100"), api("/fees?limit=100"), api("/users?limit=100")]);
    setStudents(studentData.items || []); setCourses(courseData.items || []); setBatches(batchData.items || []); setFees(feeData.items || []);
    setCounsellors((userData.items || []).filter((user) => user.role === "Counsellor" && user.isActive !== false));
  };
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, []);

  const openAssignment = (student) => {
    const fee = fees.find((item) => idOf(item.student) === student._id); const courseId = idOf(student.course);
    const course = courses.find((item) => item._id === courseId);
    setActiveStudent(student); setMessage("");
    setForm({ course: courseId, batch: idOf(student.batch), admissionDate: student.admissionDate?.slice(0, 10) || new Date().toISOString().slice(0, 10), totalFees: fee?.totalFees ?? course?.fees ?? "", discount: fee?.discount ?? "0" });
  };
  const selectCourse = (courseId) => { const course = courses.find((item) => item._id === courseId); setForm({ ...form, course: courseId, batch: "", totalFees: course?.fees ?? "" }); };
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { const result = await api(`/student-enrollment/${activeStudent._id}/assign`, { method: "PATCH", body: JSON.stringify({ ...form, totalFees: Number(form.totalFees) || 0, discount: Number(form.discount) || 0 }) }); setActiveStudent(null); setMessage(result.message); await load(); } catch (error) { setMessage(error.message); } finally { setSaving(false); } };

  const courseName = (value) => courses.find((item) => item._id === idOf(value))?.name || "Not assigned";
  const batchName = (value) => batches.find((item) => item._id === idOf(value))?.name || "Not assigned";
  const columns = [
    { key: "studentId", label: "Student ID" }, { key: "name", label: "Student Name" }, { key: "email", label: "Email" },
    { key: "course", label: "Course", render: (row) => courseName(row.course) }, { key: "batch", label: "Batch", render: (row) => batchName(row.batch) },
    { key: "status", label: "Status" }, { key: "actions", label: "Actions", render: (row) => <div className="flex flex-wrap gap-2"><button onClick={() => setReviewStudent(row)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#f97316] hover:bg-[#fff3e8] hover:text-[#c2410c]"><FileSearch size={15} /> Review Form</button><button onClick={() => setEditStudent(row)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-[#f97316] hover:bg-[#fff3e8] hover:text-[#c2410c]"><Pencil size={15} /> Edit Form</button><button onClick={() => openAssignment(row)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-[#ea580c] hover:bg-[#fff3e8]"><UserCheck size={15} /> Assign</button></div> }
  ];
  const availableBatches = batches.filter((batch) => idOf(batch.course) === form.course && !["Completed", "Cancelled"].includes(batch.status));

  return <div className="space-y-5">
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">Students</h2><p className="text-sm text-slate-500">Assign registered students to a course and batch, then initialize their fee structure.</p></div><button onClick={() => setRegistrationOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]"><UserPlus size={16} /> Register Student</button></div></section>
    {message && <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{message}</p>}
    <DataTable columns={columns} rows={students} />
    <StudentRegistrationModal open={registrationOpen} courses={courses} batches={batches} counsellors={counsellors} onClose={() => setRegistrationOpen(false)} onSaved={async (text) => { setRegistrationOpen(false); setMessage(text); await load(); }} />
    {reviewStudent && <StudentRegistrationReview student={reviewStudent} courseName={courseName(reviewStudent.course)} batchName={batchName(reviewStudent.batch)} onClose={() => setReviewStudent(null)} />}
    {editStudent && <StudentRegistrationEditor student={editStudent} onClose={() => setEditStudent(null)} onSaved={async (text) => { setEditStudent(null); setMessage(text); await load(); }} />}
    {activeStudent && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-xl"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold">Assign Course & Batch</h2><p className="text-sm text-slate-500">{activeStudent.name} · {activeStudent.studentId}</p></div><button onClick={() => setActiveStudent(null)} className="rounded-md p-2 hover:bg-slate-100"><X size={18} /></button></div>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <Field label="Course"><select required className={inputClass} value={form.course} onChange={(e) => selectCourse(e.target.value)}><option value="">Select course</option>{courses.filter((item) => item.isActive !== false).map((course) => <option key={course._id} value={course._id}>{course.name} ({course.duration})</option>)}</select></Field>
        <Field label="Batch"><select required disabled={!form.course} className={inputClass} value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}><option value="">{form.course ? "Select batch" : "Select course first"}</option>{availableBatches.map((batch) => <option key={batch._id} value={batch._id}>{batch.name} · {batch.timing}</option>)}</select></Field>
        <Field label="Admission Date"><input required type="date" className={inputClass} value={form.admissionDate} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} /></Field>
        <Field label="Total Fees"><input required min="0" type="number" className={inputClass} value={form.totalFees} onChange={(e) => setForm({ ...form, totalFees: e.target.value })} /></Field>
        <Field label="Discount"><input min="0" type="number" className={inputClass} value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></Field>
        <div className="flex items-end justify-end gap-2"><button type="button" onClick={() => setActiveStudent(null)} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button><button disabled={saving} className="rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315] disabled:opacity-60">{saving ? "Assigning..." : "Save Assignment"}</button></div>
      </form>
    </div></div>}
  </div>;
}

const inputClass = "mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316] disabled:bg-slate-100";
function Field({ label, children }) { return <label className="block text-sm font-semibold">{label}{children}</label>; }

function registrationDetails(student) {
  try { return typeof student.performance === "string" ? JSON.parse(student.performance || "{}") : student.performance || {}; } catch { return {}; }
}

function StudentRegistrationReview({ student, courseName, batchName, onClose }) {
  const printRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const details = registrationDetails(student);
  const printableStudent = {
    ...student,
    ...details,
    courseName: student.courseName || courseName,
    batchName: student.batchName || batchName
  };
  const download = async () => {
    setDownloading(true);
    try { await downloadRegistrationPdf(printRef.current, student.studentId); } finally { setDownloading(false); }
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-[#f8f5ef] p-5 shadow-xl">
    <div className="no-print mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold">Registration Form</h2><p className="text-sm text-slate-500">Review {student.name}'s submitted registration details.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:border-[#f97316] hover:text-[#f97316]"><Printer size={16} /> Print</button><button type="button" disabled={downloading} onClick={download} className="inline-flex items-center gap-2 rounded-md bg-[#111315] px-3 py-2 text-sm font-semibold text-white hover:bg-[#f97316] disabled:opacity-60"><Download size={16} /> {downloading ? "Preparing..." : "Download PDF"}</button><button type="button" onClick={onClose} className="rounded-md border border-slate-300 bg-white p-2 hover:bg-slate-100" aria-label="Close"><X size={18} /></button></div></div>
    <RegistrationPaper student={printableStudent} printRef={printRef} className="print:shadow-none" />
  </div></div>;
}

function StudentRegistrationEditor({ student, onClose, onSaved }) {
  const details = registrationDetails(student);
  const [form, setForm] = useState(() => ({
    name: student.name || "", email: student.email || "", mobile: student.mobile || "", admissionDate: student.admissionDate?.slice(0, 10) || "",
    parentName: student.parentName || "", parentMobile: student.parentMobile || "", address: student.address?.line1 || "", city: student.address?.city || "", state: student.address?.state || "", pincode: student.address?.pincode || "",
    gender: details.gender || "", dateOfBirth: details.dateOfBirth?.slice(0, 10) || "", highestQualification: details.highestQualification || "", currentStatus: details.currentStatus || "", learningMode: details.learningMode || "", remarks: details.remarks || ""
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      await api(`/students/${student._id}`, { method: "PATCH", body: JSON.stringify({
        name: form.name, email: form.email, mobile: form.mobile, admissionDate: form.admissionDate || undefined,
        parentName: form.parentName, parentMobile: form.parentMobile, address: { line1: form.address, city: form.city, state: form.state, pincode: form.pincode },
        performance: JSON.stringify({ ...details, gender: form.gender, dateOfBirth: form.dateOfBirth, highestQualification: form.highestQualification, currentStatus: form.currentStatus, learningMode: form.learningMode, remarks: form.remarks })
      }) });
      await onSaved(`Registration form for ${form.name} updated successfully`);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
    <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold">Edit Registration Form</h2><p className="text-sm text-slate-500">{student.studentId}</p></div><button type="button" onClick={onClose} className="rounded-md p-2 hover:bg-slate-100" aria-label="Close"><X size={18} /></button></div>
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <SectionTitle>Student Information</SectionTitle>
      <Field label="Full Name"><input required className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
      <Field label="Admission Date"><input type="date" className={inputClass} value={form.admissionDate} onChange={(e) => set("admissionDate", e.target.value)} /></Field>
      <Field label="Email Address"><input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
      <Field label="Mobile Number"><input inputMode="numeric" maxLength="10" className={inputClass} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} /></Field>
      <Field label="Gender"><select className={inputClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></Field>
      <Field label="Date of Birth"><input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></Field>
      <SectionTitle>Guardian & Address</SectionTitle>
      <Field label="Guardian Name"><input className={inputClass} value={form.parentName} onChange={(e) => set("parentName", e.target.value)} /></Field>
      <Field label="Guardian Mobile"><input inputMode="numeric" maxLength="10" className={inputClass} value={form.parentMobile} onChange={(e) => set("parentMobile", e.target.value)} /></Field>
      <Field label="Address"><input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
      <Field label="City"><input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
      <Field label="State"><input className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
      <Field label="Pincode"><input inputMode="numeric" className={inputClass} value={form.pincode} onChange={(e) => set("pincode", e.target.value)} /></Field>
      <SectionTitle>Academic Details</SectionTitle>
      <Field label="Highest Qualification"><input className={inputClass} value={form.highestQualification} onChange={(e) => set("highestQualification", e.target.value)} /></Field>
      <Field label="Current Status"><input className={inputClass} value={form.currentStatus} onChange={(e) => set("currentStatus", e.target.value)} /></Field>
      <Field label="Learning Mode"><select className={inputClass} value={form.learningMode} onChange={(e) => set("learningMode", e.target.value)}><option value="">Select mode</option><option>Online</option><option>Offline</option><option>Hybrid</option></select></Field>
      <label className="block text-sm font-semibold sm:col-span-2">Remarks<textarea rows="3" className={`${inputClass} h-auto`} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} /></label>
      {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
      <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button><button disabled={saving} className="rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315] disabled:opacity-60">{saving ? "Saving..." : "Save Changes"}</button></div>
    </form>
  </div></div>;
}

const today = () => new Date().toISOString().slice(0, 10);
const emptyRegistration = () => ({ admissionDate: today(), firstName: "", lastName: "", gender: "", dateOfBirth: "", mobile: "", email: "", photo: null, guardianName: "", guardianMobile: "", address: "", city: "", state: "", highestQualification: "", currentStatus: "", course: "", batch: "", learningMode: "", totalFees: "", registrationFee: "0", discount: "0", leadSource: "", counsellor: "", remarks: "" });

function SectionTitle({ children }) { return <h3 className="border-b border-slate-200 pb-2 text-sm font-bold text-[#ea580c] sm:col-span-2">{children}</h3>; }
function fileUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error("Unable to read student photo")); reader.readAsDataURL(file); }); }

function StudentRegistrationModal({ open, courses, batches, counsellors, onClose, onSaved }) {
  const [form, setForm] = useState(emptyRegistration);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const printRef = useRef(null);
  if (!open) return null;

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => { setForm(emptyRegistration()); setError(""); };
  const selectedCourse = courses.find((course) => course._id === form.course);
  const availableBatches = batches.filter((batch) => idOf(batch.course) === form.course && !["Completed", "Cancelled"].includes(batch.status));
  const printableStudent = {
    name: `${form.firstName} ${form.lastName}`.trim(), email: form.email, mobile: form.mobile,
    gender: form.gender, dateOfBirth: form.dateOfBirth, admissionDate: form.admissionDate,
    parentName: form.guardianName, parentMobile: form.guardianMobile,
    address: { line1: form.address, city: form.city, state: form.state },
    highestQualification: form.highestQualification, currentStatus: form.currentStatus,
    courseName: selectedCourse?.name, batchName: availableBatches.find((batch) => batch._id === form.batch)?.name,
    learningMode: form.learningMode, remarks: form.remarks
  };
  const download = async () => { setDownloading(true); try { await downloadRegistrationPdf(printRef.current); } finally { setDownloading(false); } };

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const name = `${form.firstName.trim()} ${form.lastName.trim()}`;
      const documents = form.photo ? [{ title: form.photo.name, type: form.photo.type, url: await fileUrl(form.photo) }] : [];
      const lead = await api("/leads", { method: "POST", body: JSON.stringify({ name, mobile: form.mobile, email: form.email, courseInterested: form.course, courseName: selectedCourse?.name, source: form.leadSource, counsellorAssigned: form.counsellor, status: "Faculty Approved", admissionStatus: "Done", remarks: form.remarks }) });
      const result = await api(`/leads/${lead._id}/convert`, { method: "POST", body: JSON.stringify({ course: form.course, batch: form.batch || undefined, totalFees: Number(form.totalFees), discount: Number(form.discount) || 0, initialPayment: Number(form.registrationFee) || 0, paymentMode: "Cash", documents }) });
      await api(`/students/${result.student._id}`, { method: "PATCH", body: JSON.stringify({ name, parentName: form.guardianName, parentMobile: form.guardianMobile, address: { line1: form.address, city: form.city, state: form.state }, courseName: selectedCourse?.name, admissionDate: form.admissionDate, performance: JSON.stringify({ gender: form.gender, dateOfBirth: form.dateOfBirth, highestQualification: form.highestQualification, currentStatus: form.currentStatus, learningMode: form.learningMode, remarks: form.remarks }) }) });
      reset(); await onSaved(`Student ${result.student.studentId} registered and admitted successfully`);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold">Register Student</h2><p className="text-sm text-slate-500">Create a student admission record</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold hover:border-[#f97316] hover:text-[#f97316]"><Printer size={16} /> Print Form</button><button type="button" disabled={downloading} onClick={download} className="inline-flex items-center gap-2 rounded-md bg-[#111315] px-3 py-2 text-sm font-semibold text-white hover:bg-[#f97316] disabled:opacity-60"><Download size={16} /> {downloading ? "Preparing..." : "Download PDF"}</button><button onClick={onClose} className="rounded-md p-2 hover:bg-slate-100" aria-label="Close"><X size={18} /></button></div></div>
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <SectionTitle>Basic Information</SectionTitle>
      <Field label="Student ID"><input disabled value="Generated on registration" className={inputClass} /></Field>
      <Field label="Admission Date"><input required type="date" className={inputClass} value={form.admissionDate} onChange={(e) => set("admissionDate", e.target.value)} /></Field>
      <Field label="First Name *"><input required className={inputClass} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
      <Field label="Last Name *"><input required className={inputClass} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
      <Field label="Gender *"><select required className={inputClass} value={form.gender} onChange={(e) => set("gender", e.target.value)}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></Field>
      <Field label="Date of Birth *"><input required type="date" max={today()} className={inputClass} value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></Field>
      <Field label="Mobile Number *"><input required inputMode="numeric" maxLength="10" className={inputClass} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} /></Field>
      <Field label="Email Address *"><input required type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
      <Field label="Student Photo (Optional)"><input type="file" accept="image/*" className={inputClass} onChange={(e) => set("photo", e.target.files?.[0] || null)} /></Field>
      <div />
      <SectionTitle>Parent / Guardian</SectionTitle>
      <Field label="Father / Guardian Name *"><input required className={inputClass} value={form.guardianName} onChange={(e) => set("guardianName", e.target.value)} /></Field>
      <Field label="Father / Guardian Mobile *"><input required inputMode="numeric" maxLength="10" className={inputClass} value={form.guardianMobile} onChange={(e) => set("guardianMobile", e.target.value)} /></Field>
      <SectionTitle>Address</SectionTitle>
      <Field label="Address *"><input required className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
      <Field label="City *"><input required className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
      <Field label="State *"><input required className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} /></Field><div />
      <SectionTitle>Education</SectionTitle>
      <Field label="Highest Qualification"><input className={inputClass} value={form.highestQualification} onChange={(e) => set("highestQualification", e.target.value)} /></Field>
      <Field label="Current Status"><input className={inputClass} value={form.currentStatus} onChange={(e) => set("currentStatus", e.target.value)} /></Field>
      <SectionTitle>Course Information</SectionTitle>
      <Field label="Course *"><select required className={inputClass} value={form.course} onChange={(e) => { const course = courses.find((item) => item._id === e.target.value); setForm({ ...form, course: e.target.value, batch: "", totalFees: course?.fees ?? "" }); }}><option value="">Select course</option>{courses.filter((course) => course.isActive !== false).map((course) => <option key={course._id} value={course._id}>{course.name}</option>)}</select></Field>
      {/* Batch selection is intentionally disabled for student registration.
      <Field label="Batch *"><select required disabled={!form.course} className={inputClass} value={form.batch} onChange={(e) => set("batch", e.target.value)}><option value="">Select batch</option>{availableBatches.map((batch) => <option key={batch._id} value={batch._id}>{batch.name}</option>)}</select></Field>
      */}
      <Field label="Learning Mode *"><select required className={inputClass} value={form.learningMode} onChange={(e) => set("learningMode", e.target.value)}><option value="">Select mode</option><option>Online</option><option>Offline</option><option>Hybrid</option></select></Field><div />
      {/* <SectionTitle>Fee Information</SectionTitle>
      <Field label="Total Course Fee *"><input required min="0" type="number" className={inputClass} value={form.totalFees} onChange={(e) => set("totalFees", e.target.value)} /></Field>
      <Field label="Registration Fee"><input min="0" type="number" className={inputClass} value={form.registrationFee} onChange={(e) => set("registrationFee", e.target.value)} /></Field>
      <Field label="Discount"><input min="0" type="number" className={inputClass} value={form.discount} onChange={(e) => set("discount", e.target.value)} /></Field><div /> */}
      <SectionTitle>Lead Information</SectionTitle>
      <Field label="Lead Source *"><select required className={inputClass} value={form.leadSource} onChange={(e) => set("leadSource", e.target.value)}><option value="">Select source</option>{["Walk-in", "Website", "Referral", "Social Media", "Campaign", "Other"].map((source) => <option key={source}>{source}</option>)}</select></Field>
      <Field label="Counsellor *"><select required className={inputClass} value={form.counsellor} onChange={(e) => set("counsellor", e.target.value)}><option value="">Select counsellor</option>{counsellors.map((user) => <option key={user._id} value={user._id}>{user.name}</option>)}</select></Field>
      <SectionTitle>Remarks (Optional)</SectionTitle>
      <label className="block text-sm font-semibold sm:col-span-2"><textarea rows="3" className={`${inputClass} h-auto`} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} /></label>
      {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
      <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button><button type="button" onClick={reset} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Reset</button><button disabled={saving} className="rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315] disabled:opacity-60">{saving ? "Registering..." : "Register Student"}</button></div>
    </form>
    <RegistrationPaper student={printableStudent} printRef={printRef} className="fixed -left-[10000px] top-0 w-[794px] print:static print:w-[210mm]" />
  </div></div>;
}
