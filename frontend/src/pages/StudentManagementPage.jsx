import React, { useEffect, useState } from "react";
import { UserCheck, X } from "lucide-react";
import { api } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";

const idOf = (value) => value?._id || value || "";
const initialAssignment = { course: "", batch: "", admissionDate: new Date().toISOString().slice(0, 10), totalFees: "", discount: "0" };

export function StudentManagementPage() {
  const [students, setStudents] = useState([]); const [courses, setCourses] = useState([]); const [batches, setBatches] = useState([]); const [fees, setFees] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null); const [form, setForm] = useState(initialAssignment); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);

  const load = async () => {
    const [studentData, courseData, batchData, feeData] = await Promise.all([api("/students?limit=100"), api("/courses?limit=100"), api("/batches?limit=100"), api("/fees?limit=100")]);
    setStudents(studentData.items || []); setCourses(courseData.items || []); setBatches(batchData.items || []); setFees(feeData.items || []);
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
    { key: "status", label: "Status" }, { key: "actions", label: "Actions", render: (row) => <button onClick={() => openAssignment(row)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-[#ea580c] hover:bg-[#fff3e8]"><UserCheck size={15} /> Assign</button> }
  ];
  const availableBatches = batches.filter((batch) => idOf(batch.course) === form.course && !["Completed", "Cancelled"].includes(batch.status));

  return <div className="space-y-5">
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-bold">Students</h2><p className="text-sm text-slate-500">Assign registered students to a course and batch, then initialize their fee structure.</p></section>
    {message && <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{message}</p>}
    <DataTable columns={columns} rows={students} />
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
