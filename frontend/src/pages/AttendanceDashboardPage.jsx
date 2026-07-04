import React, { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Download, Plus, RefreshCw, Save } from "lucide-react";
import { api } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";
import { StatCard } from "../components/StatCard.jsx";

const inputClass = "h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#f97316]";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]";
const secondaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#f97316] hover:text-[#c2410c]";

const statusOptions = ["Present", "Absent", "Late", "Half Day", "Leave"];
const typeOptions = ["Student", "Faculty", "Staff"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("en-IN") : "-";
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
}

function minutes(value) {
  if (!value) return "-";
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return `${hours}h ${mins}m`;
}

function sameDay(value, date) {
  return value?.slice(0, 10) === date;
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
  const headers = ["Date", "Type", "Name", "Batch", "Status", "Login", "Logout", "Working", "Remarks"];
  const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const body = rows.map((row) => [
    formatDate(row.date),
    row.type,
    row.personName,
    row.batchName,
    row.status,
    formatTime(row.loginTime),
    formatTime(row.logoutTime),
    minutes(row.totalWorkingMinutes),
    row.remarks
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

export function AttendanceDashboardPage() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ date: today(), type: "All", status: "All", batch: "All" });
  const [form, setForm] = useState({
    date: today(),
    type: "Student",
    student: "",
    user: "",
    batch: "",
    status: "Present",
    loginTime: "",
    logoutTime: "",
    remarks: ""
  });

  const loadData = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [attendanceData, studentsData, batchesData, usersData] = await Promise.all([
        api("/attendance?limit=100"),
        api("/students?limit=100"),
        api("/batches?limit=100"),
        api("/users?limit=100")
      ]);
      setAttendance(attendanceData.items || []);
      setStudents(studentsData.items || []);
      setBatches(batchesData.items || []);
      setUsers(usersData.items || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const studentMap = useMemo(() => Object.fromEntries(students.map((student) => [student._id, student])), [students]);
  const batchMap = useMemo(() => Object.fromEntries(batches.map((batch) => [batch._id, batch])), [batches]);
  const userMap = useMemo(() => Object.fromEntries(users.map((user) => [user._id, user])), [users]);

  const enrichedRows = useMemo(() => attendance.map((row) => {
    const student = studentMap[row.student];
    const user = userMap[row.user];
    const batch = batchMap[row.batch || student?.batch];
    return {
      ...row,
      personName: row.type === "Student" ? student?.name || row.student || "-" : user?.name || row.user || "-",
      batchName: batch?.name || "-",
      courseName: student?.courseName || user?.courseName || "-"
    };
  }), [attendance, batchMap, studentMap, userMap]);

  const filteredRows = useMemo(() => enrichedRows.filter((row) => {
    const matchesDate = !filters.date || sameDay(row.date, filters.date);
    const matchesType = filters.type === "All" || row.type === filters.type;
    const matchesStatus = filters.status === "All" || row.status === filters.status;
    const matchesBatch = filters.batch === "All" || row.batch === filters.batch || studentMap[row.student]?.batch === filters.batch;
    return matchesDate && matchesType && matchesStatus && matchesBatch;
  }), [enrichedRows, filters, studentMap]);

  const todaysRows = useMemo(() => enrichedRows.filter((row) => sameDay(row.date, today())), [enrichedRows]);
  const presentToday = todaysRows.filter((row) => row.status === "Present").length;
  const absentToday = todaysRows.filter((row) => row.status === "Absent").length;
  const lateToday = todaysRows.filter((row) => row.status === "Late").length;
  const pendingLogout = todaysRows.filter((row) => row.status === "Pending Logout").length;
  const studentAttendance = filteredRows.filter((row) => row.type === "Student");
  const studentPresent = studentAttendance.filter((row) => row.status === "Present" || row.status === "Late").length;
  const studentPercent = studentAttendance.length ? Math.round((studentPresent / studentAttendance.length) * 100) : 0;

  const candidatePeople = form.type === "Student"
    ? students
    : users.filter((item) => form.type === "Faculty" ? item.role === "Faculty" : item.role !== "Student");

  const submitAttendance = async (event) => {
    event.preventDefault();
    const selectedStudent = studentMap[form.student];
    const baseDate = form.date || today();
    const loginTime = form.loginTime ? new Date(`${baseDate}T${form.loginTime}`).toISOString() : undefined;
    const logoutTime = form.logoutTime ? new Date(`${baseDate}T${form.logoutTime}`).toISOString() : undefined;
    const totalWorkingMinutes = loginTime && logoutTime ? Math.max(Math.round((new Date(logoutTime) - new Date(loginTime)) / 60000), 0) : 0;
    const payload = {
      date: baseDate,
      type: form.type,
      status: form.status,
      remarks: form.remarks,
      batch: form.batch || selectedStudent?.batch || undefined,
      student: form.type === "Student" ? form.student : undefined,
      user: form.type === "Student" ? undefined : form.user,
      loginTime,
      logoutTime,
      totalWorkingMinutes
    };

    try {
      await api("/attendance", { method: "POST", body: JSON.stringify(payload) });
      setMessage("Attendance marked successfully");
      setForm({ ...form, student: "", user: "", status: "Present", loginTime: "", logoutTime: "", remarks: "" });
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const columns = [
    { key: "date", label: "Date", render: (row) => formatDate(row.date) },
    { key: "type", label: "Type" },
    { key: "personName", label: "Name" },
    { key: "batchName", label: "Batch" },
    { key: "status", label: "Status" },
    { key: "loginTime", label: "In", render: (row) => formatTime(row.loginTime) },
    { key: "logoutTime", label: "Out", render: (row) => formatTime(row.logoutTime) },
    { key: "totalWorkingMinutes", label: "Working", render: (row) => minutes(row.totalWorkingMinutes) },
    { key: "remarks", label: "Remarks" }
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#f97316]">Attendance Dashboard</p>
            <h2 className="mt-1 text-2xl font-bold">Daily student and staff attendance control</h2>
            <p className="mt-1 text-sm text-slate-500">Mark attendance, review today&apos;s presence, and filter batch-wise records.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={loadData} className={secondaryButtonClass}><RefreshCw size={16} /> Refresh</button>
            <button onClick={() => downloadFile(`attendance-${filters.date || today()}.csv`, toCsv(filteredRows))} className={secondaryButtonClass}><Download size={16} /> Export CSV</button>
          </div>
        </div>
      </section>

      {message && <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{message}</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Present Today" value={presentToday} tone="pine" />
        <StatCard label="Absent Today" value={absentToday} tone="coral" />
        <StatCard label="Late Today" value={lateToday} tone="amber" />
        <StatCard label="Pending Logout" value={pendingLogout} tone="ink" />
        <StatCard label="Student Attendance" value={`${studentPercent}%`} tone="pine" />
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Mark Attendance" action={<span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"><CalendarCheck size={16} /> Quick entry</span>}>
          <form onSubmit={submitAttendance} className="grid gap-3 md:grid-cols-2">
            <input type="date" className={inputClass} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
            <select className={inputClass} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value, student: "", user: "" })}>
              {typeOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select required className={inputClass} value={form.type === "Student" ? form.student : form.user} onChange={(event) => setForm(form.type === "Student" ? { ...form, student: event.target.value } : { ...form, user: event.target.value })}>
              <option value="">Select {form.type.toLowerCase()}</option>
              {candidatePeople.map((item) => <option key={item._id} value={item._id}>{item.name} {item.role ? `(${item.role})` : ""}</option>)}
            </select>
            <select className={inputClass} value={form.batch} onChange={(event) => setForm({ ...form, batch: event.target.value })}>
              <option value="">Auto / no batch</option>
              {batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.name}</option>)}
            </select>
            <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {statusOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="time" className={inputClass} value={form.loginTime} onChange={(event) => setForm({ ...form, loginTime: event.target.value })} />
              <input type="time" className={inputClass} value={form.logoutTime} onChange={(event) => setForm({ ...form, logoutTime: event.target.value })} />
            </div>
            <input className={`${inputClass} md:col-span-2`} placeholder="Remarks" value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} />
            <button className={`${buttonClass} md:col-span-2`}><Save size={16} /> Save Attendance</button>
          </form>
        </Panel>

        <Panel title="Filters" action={loading ? <span className="text-sm text-slate-500">Loading...</span> : null}>
          <div className="grid gap-3 md:grid-cols-2">
            <input type="date" className={inputClass} value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
            <select className={inputClass} value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
              <option>All</option>
              {typeOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className={inputClass} value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option>All</option>
              {["Present", "Absent", "Late", "Half Day", "Leave", "Pending Logout"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className={inputClass} value={filters.batch} onChange={(event) => setFilters({ ...filters, batch: event.target.value })}>
              <option value="All">All batches</option>
              {batches.map((batch) => <option key={batch._id} value={batch._id}>{batch.name}</option>)}
            </select>
          </div>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <p className="rounded-md bg-slate-50 p-3"><span className="text-slate-500">Records:</span> <strong>{filteredRows.length}</strong></p>
            <p className="rounded-md bg-slate-50 p-3"><span className="text-slate-500">Students:</span> <strong>{studentAttendance.length}</strong></p>
            <p className="rounded-md bg-slate-50 p-3"><span className="text-slate-500">Batches:</span> <strong>{new Set(filteredRows.map((row) => row.batchName).filter((item) => item !== "-")).size}</strong></p>
          </div>
        </Panel>
      </div>

      <Panel title="Attendance Records">
        <DataTable columns={columns} rows={filteredRows} />
      </Panel>
    </div>
  );
}
