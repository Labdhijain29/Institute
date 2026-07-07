import React, { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Download, LogIn, LogOut, RefreshCw, Save } from "lucide-react";
import { api } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { SearchableSelect } from "../components/SearchableSelect.jsx";

const inputClass = "h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#f97316]";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]";
const secondaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#f97316] hover:text-[#c2410c]";

const statusOptions = ["Present", "Absent", "Late", "Half Day", "Leave", "Pending Logout"];
const typeOptions = ["Student", "Faculty", "Staff"];
const asOptions = (items) => items.map((item) => ({ value: item, label: item }));
const dropdownClass = "mt-0";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("en-IN") : "-";
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
}

function timeInputValue(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function currentTimeValue() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function combineDateAndTime(dateValue, timeValue) {
  if (!timeValue) return undefined;
  const baseDate = dateValue ? new Date(dateValue).toLocaleDateString("en-CA") : today();
  return new Date(`${baseDate}T${timeValue}`).toISOString();
}

function workingMinutesForTimes(dateValue, loginValue, logoutValue) {
  const loginTime = combineDateAndTime(dateValue, loginValue);
  const logoutTime = combineDateAndTime(dateValue, logoutValue);
  return loginTime && logoutTime ? Math.max(Math.round((new Date(logoutTime) - new Date(loginTime)) / 60000), 0) : 0;
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

function TimeEditor({ value, disabled, onSave }) {
  const [time, setTime] = useState(value || "");

  useEffect(() => {
    setTime(value || "");
  }, [value]);

  const save = () => {
    if (!disabled && time !== (value || "")) onSave(time);
  };

  return (
    <input
      type="time"
      className="h-9 min-w-[128px] rounded-md border border-slate-200 px-2 text-sm outline-none focus:border-[#f97316] disabled:bg-slate-100"
      value={time}
      disabled={disabled}
      onChange={(event) => setTime(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
    />
  );
}

function TimeQuickField({ value, onChange, onNow, label, actionLabel, icon: Icon }) {
  return (
    <label className="block rounded-lg border border-slate-200 bg-slate-50 p-3">
      <span className="mb-2 flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-black normal-case tracking-normal text-slate-700 shadow-sm transition hover:border-[#f97316] hover:bg-[#fff3e8] hover:text-[#c2410c]"
          onClick={onNow}
        >
          <Icon size={14} />
          {actionLabel}
        </button>
      </span>
      <input
        type="time"
        aria-label={label}
        className={`${inputClass} bg-white`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function AttendancePreview({ status, workingMinutes }) {
  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-2 md:col-span-2">
      <p>
        <span className="text-slate-500">System status:</span>{" "}
        <strong className="text-[#111315]">{status}</strong>
      </p>
      <p>
        <span className="text-slate-500">Working duration:</span>{" "}
        <strong className="text-[#111315]">{minutes(workingMinutes)}</strong>
      </p>
    </div>
  );
}

export function AttendanceDashboardPage() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingTimeId, setSavingTimeId] = useState("");
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
  const formWorkingMinutes = workingMinutesForTimes(form.date, form.loginTime, form.logoutTime);
  const formSystemStatus = form.loginTime && !form.logoutTime && ["Present", "Pending Logout"].includes(form.status)
    ? "Pending Logout"
    : form.loginTime && form.logoutTime && form.status === "Pending Logout"
      ? "Present"
      : form.status;

  const submitAttendance = async (event) => {
    event.preventDefault();
    const selectedStudent = studentMap[form.student];
    if (form.type === "Student" && !form.student) {
      setMessage("Please select a student.");
      return;
    }
    if (form.type !== "Student" && !form.user) {
      setMessage(`Please select a ${form.type.toLowerCase()}.`);
      return;
    }
    const baseDate = form.date || today();
    const loginTime = combineDateAndTime(baseDate, form.loginTime);
    const logoutTime = combineDateAndTime(baseDate, form.logoutTime);
    const totalWorkingMinutes = formWorkingMinutes;
    const status = formSystemStatus;
    const payload = {
      date: baseDate,
      type: form.type,
      status,
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

  const updateAttendanceTime = async (row, field, value) => {
    setSavingTimeId(`${row._id}-${field}`);
    setMessage("");
    const loginTime = field === "loginTime" ? combineDateAndTime(row.date, value) : row.loginTime;
    const logoutTime = field === "logoutTime" ? combineDateAndTime(row.date, value) : row.logoutTime;
    const totalWorkingMinutes = loginTime && logoutTime ? Math.max(Math.round((new Date(logoutTime) - new Date(loginTime)) / 60000), 0) : 0;
    const status = loginTime && !logoutTime && ["Present", "Pending Logout"].includes(row.status)
      ? "Pending Logout"
      : loginTime && logoutTime && row.status === "Pending Logout"
        ? "Present"
        : row.status;

    try {
      await api(`/attendance/${row._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          [field]: (field === "loginTime" ? loginTime : logoutTime) || null,
          totalWorkingMinutes,
          status
        })
      });
      setMessage("Attendance time updated");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSavingTimeId("");
    }
  };

  const columns = [
    { key: "date", label: "Date", render: (row) => formatDate(row.date) },
    { key: "type", label: "Type" },
    { key: "personName", label: "Name" },
    { key: "batchName", label: "Batch" },
    { key: "status", label: "Status" },
    {
      key: "loginTime",
      label: "In",
      render: (row) => (
        <TimeEditor
          value={timeInputValue(row.loginTime)}
          disabled={savingTimeId === `${row._id}-loginTime`}
          onSave={(value) => updateAttendanceTime(row, "loginTime", value)}
        />
      )
    },
    {
      key: "logoutTime",
      label: "Out",
      render: (row) => (
        <TimeEditor
          value={timeInputValue(row.logoutTime)}
          disabled={savingTimeId === `${row._id}-logoutTime`}
          onSave={(value) => updateAttendanceTime(row, "logoutTime", value)}
        />
      )
    },
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
            <SearchableSelect className={dropdownClass} options={asOptions(typeOptions)} value={form.type} onChange={(type) => setForm({ ...form, type, student: "", user: "" })} placeholder="Select type..." searchPlaceholder="Search type..." />
            <SearchableSelect
              className={dropdownClass}
              options={candidatePeople.map((item) => ({ value: item._id, label: `${item.name} ${item.role ? `(${item.role})` : ""}` }))}
              value={form.type === "Student" ? form.student : form.user}
              onChange={(value) => setForm(form.type === "Student" ? { ...form, student: value } : { ...form, user: value })}
              placeholder={`Select ${form.type.toLowerCase()}...`}
              searchPlaceholder={`Search ${form.type.toLowerCase()}...`}
            />
            <SearchableSelect
              className={dropdownClass}
              options={[{ value: "", label: "Auto / no batch" }, ...batches.map((batch) => ({ value: batch._id, label: batch.name }))]}
              value={form.batch}
              onChange={(batch) => setForm({ ...form, batch })}
              placeholder="Auto / no batch"
              searchPlaceholder="Search batch..."
            />
            <div className="md:col-span-2 grid gap-3 lg:grid-cols-[0.7fr_1.3fr]">
              <SearchableSelect className={dropdownClass} options={asOptions(statusOptions)} value={form.status} onChange={(status) => setForm({ ...form, status })} placeholder="Select status..." searchPlaceholder="Search status..." />
              <div className="grid gap-3 sm:grid-cols-2">
                <TimeQuickField label="Login time" actionLabel="Clock in" icon={LogIn} value={form.loginTime} onChange={(loginTime) => setForm({ ...form, loginTime })} onNow={() => setForm({ ...form, loginTime: currentTimeValue(), status: "Pending Logout" })} />
                <TimeQuickField label="Logout time" actionLabel="Clock out" icon={LogOut} value={form.logoutTime} onChange={(logoutTime) => setForm({ ...form, logoutTime })} onNow={() => setForm({ ...form, logoutTime: currentTimeValue(), status: form.loginTime ? "Present" : form.status })} />
              </div>
            </div>
            <AttendancePreview status={formSystemStatus} workingMinutes={formWorkingMinutes} />
            <input className={`${inputClass} md:col-span-2`} placeholder="Remarks" value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} />
            <button className={`${buttonClass} md:col-span-2`}><Save size={16} /> Save Attendance</button>
          </form>
        </Panel>

        <Panel title="Filters" action={loading ? <span className="text-sm text-slate-500">Loading...</span> : null}>
          <div className="grid gap-3 md:grid-cols-2">
            <input type="date" className={inputClass} value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
            <SearchableSelect className={dropdownClass} options={asOptions(["All", ...typeOptions])} value={filters.type} onChange={(type) => setFilters({ ...filters, type })} placeholder="All" searchPlaceholder="Search type..." />
            <SearchableSelect className={dropdownClass} options={asOptions(["All", ...statusOptions])} value={filters.status} onChange={(status) => setFilters({ ...filters, status })} placeholder="All" searchPlaceholder="Search status..." />
            <SearchableSelect
              className={dropdownClass}
              options={[{ value: "All", label: "All batches" }, ...batches.map((batch) => ({ value: batch._id, label: batch.name }))]}
              value={filters.batch}
              onChange={(batch) => setFilters({ ...filters, batch })}
              placeholder="All batches"
              searchPlaceholder="Search batch..."
            />
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
