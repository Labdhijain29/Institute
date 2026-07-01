import React, { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";

const emptyCourse = { name: "", duration: "", fees: "", description: "", isActive: true };

export function CourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyCourse);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => api("/courses?limit=100").then((data) => setCourses(data.items || []));
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, []);

  const showCreate = () => { setEditing(null); setForm(emptyCourse); setOpen(true); setMessage(""); };
  const showEdit = (course) => { setEditing(course); setForm({ name: course.name || "", duration: course.duration || "", fees: course.fees ?? "", description: course.description || "", isActive: course.isActive !== false }); setOpen(true); setMessage(""); };
  const submit = async (event) => {
    event.preventDefault();
    try {
      await api(editing ? `/courses/${editing._id}` : "/courses", { method: editing ? "PATCH" : "POST", body: JSON.stringify({ ...form, fees: Number(form.fees) || 0 }) });
      setOpen(false); setMessage(editing ? "Course updated successfully" : "Course created successfully"); await load();
    } catch (error) { setMessage(error.message); }
  };
  const removeCourse = async (course) => {
    if (!window.confirm(`Delete course ${course.name}?`)) return;
    try {
      await api(`/courses/${course._id}`, { method: "DELETE" });
      setMessage("Course deleted successfully");
      await load();
    } catch (error) { setMessage(error.message); }
  };

  const columns = [
    { key: "name", label: "Course Name" }, { key: "duration", label: "Duration" },
    { key: "fees", label: "Total Fees", render: (row) => `₹${Number(row.fees || 0).toLocaleString("en-IN")}` },
    { key: "isActive", label: "Status", render: (row) => row.isActive === false ? "Inactive" : "Active" },
    { key: "actions", label: "Actions", render: (row) => <div className="flex gap-2"><button onClick={() => showEdit(row)} className="rounded-md border border-slate-200 p-2 text-[#ea580c] hover:bg-[#fff3e8]" title="Edit course"><Pencil size={16} /></button><button onClick={() => removeCourse(row)} className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50" title="Delete course"><Trash2 size={16} /></button></div> }
  ];

  return <div className="space-y-5">
    <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-bold">Courses</h2><p className="text-sm text-slate-500">Create courses with duration, fees and active status.</p></div><button onClick={showCreate} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]"><Plus size={17} /> New Course</button></section>
    {message && <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{message}</p>}
    <DataTable columns={columns} rows={courses} />
    {open && <Modal title={editing ? "Edit Course" : "New Course"} onClose={() => setOpen(false)}><form onSubmit={submit} className="space-y-3">
      <Field label="Course Name"><input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Duration"><input required placeholder="e.g. 6 Months" className={inputClass} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Field><Field label="Total Fees"><input required min="0" type="number" className={inputClass} value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} /></Field></div>
      <Field label="Description"><textarea className={`${inputClass} min-h-24`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active Course</label>
      <Actions onClose={() => setOpen(false)} label={editing ? "Update Course" : "Create Course"} />
    </form></Modal>}
  </div>;
}

const inputClass = "mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]";
function Field({ label, children }) { return <label className="block text-sm font-semibold">{label}{children}</label>; }
function Actions({ onClose, label }) { return <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button><button className="rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]">{label}</button></div>; }
function Modal({ title, onClose, children }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-xl rounded-lg bg-white p-5 shadow-xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button onClick={onClose} className="rounded-md p-2 hover:bg-slate-100"><X size={18} /></button></div>{children}</div></div>; }
