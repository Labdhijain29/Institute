import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  Filter,
  Laptop,
  LogIn,
  LogOut,
  Moon,
  MoreHorizontal,
  Printer,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  Smartphone,
  Trash2,
  UserCheck,
  UserMinus,
  Wifi,
  WifiOff,
  X
} from "lucide-react";
import { api } from "../api/client.js";
import { SearchableSelect } from "../components/SearchableSelect.jsx";

const inputClass = "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 disabled:bg-slate-100 disabled:text-slate-400";
const labelClass = "mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500";
const actionClass = "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#f97316] hover:bg-[#fff3e8] hover:text-[#c2410c]";
const primaryActionClass = "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#111315]";
const statusOptions = ["Present", "Absent", "Late", "Half Day", "Leave", "Pending Logout"];
const typeOptions = ["Student", "Faculty", "Staff"];
const asOptions = (items) => items.map((item) => ({ value: item, label: item }));
const dropdownClass = "mt-0";

function today() {
  return localDateKey(new Date());
}

function localDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateKey(value) {
  return value ? localDateKey(value) : "";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-";
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
  const baseDate = dateValue || today();
  return new Date(`${baseDate}T${timeValue}`).toISOString();
}

function workingMinutesForTimes(dateValue, loginValue, logoutValue) {
  const loginTime = combineDateAndTime(dateValue, loginValue);
  const logoutTime = combineDateAndTime(dateValue, logoutValue);
  return loginTime && logoutTime ? Math.max(Math.round((new Date(logoutTime) - new Date(loginTime)) / 60000), 0) : 0;
}

function minutes(value) {
  const count = Number(value || 0);
  if (!count) return "0h 0m";
  const hours = Math.floor(count / 60);
  const mins = count % 60;
  return `${hours}h ${mins}m`;
}

function sameDay(value, date) {
  return dateKey(value) === date;
}

function avatarText(name = "-") {
  return String(name).split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "NA";
}

function getBrowser() {
  const agent = navigator.userAgent;
  if (agent.includes("Edg")) return "Microsoft Edge";
  if (agent.includes("Chrome")) return "Chrome";
  if (agent.includes("Firefox")) return "Firefox";
  if (agent.includes("Safari")) return "Safari";
  return "Browser";
}

function getOperatingSystem() {
  const agent = navigator.userAgent;
  if (agent.includes("Windows")) return "Windows";
  if (agent.includes("Mac OS")) return "macOS";
  if (agent.includes("Android")) return "Android";
  if (agent.includes("iPhone") || agent.includes("iPad")) return "iOS";
  if (agent.includes("Linux")) return "Linux";
  return "Unknown OS";
}

function getDeviceType() {
  const agent = navigator.userAgent;
  if (/Mobi|Android|iPhone/i.test(agent)) return "Mobile";
  if (/iPad|Tablet/i.test(agent)) return "Tablet";
  return "Desktop";
}

function getClientMetadata() {
  return {
    browser: getBrowser(),
    operatingSystem: getOperatingSystem(),
    deviceType: getDeviceType(),
    userAgent: navigator.userAgent,
    deviceInfo: navigator.userAgent
  };
}

function downloadFile(name, text, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function csvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function rowsToCsv(rows = []) {
  const headers = [
    "Employee Name",
    "Employee ID",
    "Department",
    "Type",
    "Date",
    "Login Time",
    "Logout Time",
    "Working Hours",
    "Attendance Status",
    "Late Minutes",
    "IP Address",
    "Location",
    "Timezone",
    "Browser",
    "Operating System",
    "Device",
    "Session Duration",
    "Remarks"
  ];
  const body = rows.map((row) => [
    row.personName,
    row.employeeId,
    row.department,
    row.type,
    formatDate(row.date),
    formatTime(row.loginTime),
    formatTime(row.logoutTime),
    minutes(row.totalWorkingMinutes),
    row.status,
    row.lateMinutes,
    row.ipAddress,
    row.locationLabel,
    row.timezone,
    row.browser,
    row.operatingSystem,
    row.device,
    minutes(row.totalWorkingMinutes),
    row.remarks
  ].map(csvValue).join(","));
  return [headers.join(","), ...body].join("\n");
}

function rowsToExcel(rows = []) {
  const htmlRows = rows.map((row) => `
    <tr>
      <td>${row.personName}</td><td>${row.employeeId}</td><td>${row.department}</td><td>${row.type}</td>
      <td>${formatDate(row.date)}</td><td>${formatTime(row.loginTime)}</td><td>${formatTime(row.logoutTime)}</td>
      <td>${minutes(row.totalWorkingMinutes)}</td><td>${row.status}</td><td>${row.ipAddress || "-"}</td>
      <td>${row.locationLabel}</td><td>${row.timezone || "-"}</td><td>${row.browser}</td><td>${row.operatingSystem}</td><td>${row.device}</td>
      <td>${row.remarks || "-"}</td>
    </tr>
  `).join("");
  return `<table><thead><tr><th>Name</th><th>ID</th><th>Department</th><th>Type</th><th>Date</th><th>Login</th><th>Logout</th><th>Working</th><th>Status</th><th>IP</th><th>Location</th><th>Timezone</th><th>Browser</th><th>OS</th><th>Device</th><th>Remarks</th></tr></thead><tbody>${htmlRows}</tbody></table>`;
}

function MiniBars({ values = [], color = "#f97316" }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-8 items-end gap-1">
      {values.map((value, index) => (
        <span key={index} className="w-1.5 rounded-full" style={{ height: `${Math.max((value / max) * 100, 12)}%`, backgroundColor: color, opacity: 0.35 + index * 0.08 }} />
      ))}
    </div>
  );
}

function StatTile({ icon: Icon, label, value, tone, trend = "Live", chart = [3, 6, 4, 7, 8] }) {
  const tones = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    orange: "border-orange-200 bg-[#fff3e8] text-[#c2410c]",
    blue: "border-sky-200 bg-sky-50 text-sky-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700"
  };
  const colors = { green: "#059669", red: "#e11d48", amber: "#d97706", orange: "#f97316", blue: "#0284c7", slate: "#475569", violet: "#7c3aed" };
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className={`rounded-md border p-2 ${tones[tone] || tones.slate}`}>
          <Icon size={18} />
        </span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-black uppercase text-emerald-700">{trend}</span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-[#111315]">{value}</p>
        </div>
        <MiniBars values={chart} color={colors[tone] || colors.slate} />
      </div>
    </article>
  );
}

function Panel({ title, icon: Icon, children, action, className = "" }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {Icon && <span className="rounded-md bg-[#fff3e8] p-2 text-[#c2410c]"><Icon size={17} /></span>}
          <h2 className="text-base font-black text-[#111315]">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function PersonAvatar({ name, image }) {
  return image ? (
    <img src={image} alt="" className="h-10 w-10 rounded-full object-cover" />
  ) : (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111315] text-xs font-black text-white">{avatarText(name)}</span>
  );
}

function StatusBadge({ status }) {
  const tone = {
    Present: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Absent: "border-rose-200 bg-rose-50 text-rose-700",
    Late: "border-amber-200 bg-amber-50 text-amber-700",
    "Half Day": "border-sky-200 bg-sky-50 text-sky-700",
    Leave: "border-violet-200 bg-violet-50 text-violet-700",
    "Pending Logout": "border-orange-200 bg-[#fff3e8] text-[#c2410c]"
  };
  return <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-black ${tone[status] || tone.Present}`}>{status || "-"}</span>;
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
      className="h-9 w-[118px] rounded-md border border-slate-200 bg-white px-2 text-sm outline-none focus:border-[#f97316] disabled:bg-slate-100"
      value={time}
      disabled={disabled}
      onChange={(event) => setTime(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
    />
  );
}

function TimeQuickField({ value, onChange, onNow, label, actionLabel, icon: Icon }) {
  return (
    <label className="block rounded-lg border border-slate-200 bg-slate-50 p-3">
      <span className="mb-2 flex items-center justify-between gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-black normal-case tracking-normal text-slate-700 shadow-sm transition hover:border-[#f97316] hover:bg-[#fff3e8] hover:text-[#c2410c]" onClick={onNow}>
          <Icon size={14} />
          {actionLabel}
        </button>
      </span>
      <input type="time" aria-label={label} className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function MetricBar({ label, value, max, color = "bg-[#f97316]" }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(max ? (value / max) * 100 : 0, 100)}%` }} />
      </div>
    </div>
  );
}

function DetailsModal({ row, onClose }) {
  if (!row) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-[#111315]/45 p-3 backdrop-blur-sm sm:items-center">
      <section className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <PersonAvatar name={row.personName} image={row.photo} />
            <div>
              <h2 className="text-lg font-black">{row.personName}</h2>
              <p className="text-sm text-slate-500">{row.employeeId} · {row.department}</p>
            </div>
          </div>
          <button className="rounded-md border border-slate-200 p-2 hover:border-[#f97316] hover:text-[#f97316]" onClick={onClose} aria-label="Close details">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">Login Time</p>
                <p className="mt-1 text-lg font-black">{formatTime(row.loginTime)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">Logout Time</p>
                <p className="mt-1 text-lg font-black">{formatTime(row.logoutTime)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">Working Duration</p>
                <p className="mt-1 text-lg font-black">{minutes(row.totalWorkingMinutes)}</p>
              </div>
            </div>
            <Panel title="Attendance Timeline" icon={Clock}>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="mt-1 h-3 w-3 rounded-full bg-emerald-500" />
                  <div>
                    <p className="font-bold">Clock In · {formatTime(row.loginTime)}</p>
                    <p className="text-sm text-slate-500">{row.browser} on {row.operatingSystem}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 h-3 w-3 rounded-full bg-[#f97316]" />
                  <div>
                    <p className="font-bold">Clock Out · {formatTime(row.logoutTime)}</p>
                    <p className="text-sm text-slate-500">Break duration: {minutes(row.breakDurationMinutes)}</p>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
          <div className="space-y-4">
            <Panel title="Device Information" icon={Laptop}>
              <div className="space-y-3 text-sm">
                <p><span className="font-bold text-slate-500">IP Address:</span> {row.ipAddress || "-"}</p>
                <p><span className="font-bold text-slate-500">Location:</span> {row.locationLabel}</p>
                <p><span className="font-bold text-slate-500">Timezone:</span> {row.timezone || "-"}</p>
                <p><span className="font-bold text-slate-500">Browser:</span> {row.browser}</p>
                <p><span className="font-bold text-slate-500">Operating System:</span> {row.operatingSystem}</p>
                <p><span className="font-bold text-slate-500">Device:</span> {row.device}</p>
              </div>
            </Panel>
            <Panel title="Security Signals" icon={ShieldAlert}>
              <div className="flex flex-wrap gap-2">
                {row.securityFlags.length ? row.securityFlags.map((flag) => (
                  <span key={flag} className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-black text-amber-700"><AlertTriangle size={13} /> {flag}</span>
                )) : <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700"><CheckCircle2 size={13} /> Normal session</span>}
              </div>
            </Panel>
          </div>
        </div>
      </section>
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
  const [selectedRow, setSelectedRow] = useState(null);
  const [sort, setSort] = useState({ key: "date", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    date: today(),
    from: "",
    to: "",
    type: "All",
    status: "All",
    batch: "All",
    course: "All",
    employee: "All",
    department: "All",
    workingHours: "All",
    location: "",
    browser: "All",
    device: "All",
    search: ""
  });
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

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const studentMap = useMemo(() => Object.fromEntries(students.map((student) => [student._id, student])), [students]);
  const batchMap = useMemo(() => Object.fromEntries(batches.map((batch) => [batch._id, batch])), [batches]);
  const userMap = useMemo(() => Object.fromEntries(users.map((user) => [user._id, user])), [users]);

  const enrichedRows = useMemo(() => attendance.map((row) => {
    const student = studentMap[row.student];
    const user = userMap[row.user];
    const batch = batchMap[row.batch || student?.batch];
    const person = row.type === "Student" ? student : user;
    const browser = row.browser || (typeof row.device === "object" ? row.device?.browser : "") || (row.deviceInfo ? "Captured browser" : "-");
    const operatingSystem = row.operatingSystem || row.os || (typeof row.device === "object" ? row.device?.operatingSystem : "") || "-";
    const device = row.deviceType || (typeof row.device === "string" ? row.device : row.device?.type) || row.deviceInfo || "-";
    const city = row.city || row.location?.city || "";
    const state = row.state || row.location?.state || "";
    const country = row.country || row.location?.country || "";
    const coordinates = row.location?.latitude && row.location?.longitude ? `${row.location.latitude}, ${row.location.longitude}` : "";
    const locationLabel = [city, state, country].filter(Boolean).join(", ") || row.location?.address || coordinates || "-";
    const login = row.loginTime ? new Date(row.loginTime) : null;
    const lateCutoff = row.date ? new Date(row.date) : null;
    if (lateCutoff) lateCutoff.setHours(10, 0, 0, 0);
    const lateMinutes = login && lateCutoff && login > lateCutoff ? Math.round((login - lateCutoff) / 60000) : 0;
    const securityFlags = [
      row.security?.differentIp || row.differentIp ? "Different IP Login" : "",
      row.security?.differentBrowser || row.differentBrowser ? "Different Browser" : "",
      row.security?.differentDevice || row.differentDevice ? "Different Device" : "",
      row.security?.multipleActiveSessions || row.multipleActiveSessions ? "Multiple Active Sessions" : "",
      row.security?.differentState || row.differentState ? "Login from another State" : "",
      row.security?.differentCountry || row.differentCountry ? "Login from another Country" : ""
    ].filter(Boolean);
    return {
      ...row,
      ipAddress: row.publicIp || row.ipAddress || "",
      photo: person?.avatar,
      personName: row.type === "Student" ? student?.name || row.student || "-" : user?.name || row.user || "-",
      employeeId: row.type === "Student" ? student?.studentId || "-" : user?.employeeId || "-",
      department: user?.department || (row.type === "Student" ? "Student" : user?.role) || "-",
      batchName: batch?.name || "-",
      courseName: student?.courseName || user?.courseName || "-",
      browser,
      operatingSystem,
      device,
      locationLabel,
      lateMinutes,
      breakDurationMinutes: row.breakDurationMinutes || row.breakDuration || 0,
      securityFlags
    };
  }), [attendance, batchMap, studentMap, userMap]);

  const departments = useMemo(() => Array.from(new Set(enrichedRows.map((row) => row.department).filter((item) => item && item !== "-"))), [enrichedRows]);
  const courses = useMemo(() => Array.from(new Set(enrichedRows.map((row) => row.courseName).filter((item) => item && item !== "-"))), [enrichedRows]);
  const browsers = useMemo(() => Array.from(new Set(enrichedRows.map((row) => row.browser).filter((item) => item && item !== "-"))), [enrichedRows]);
  const devices = useMemo(() => Array.from(new Set(enrichedRows.map((row) => row.device).filter((item) => item && item !== "-"))), [enrichedRows]);

  const filteredRows = useMemo(() => enrichedRows.filter((row) => {
    const rowDate = dateKey(row.date);
    const search = filters.search.trim().toLocaleLowerCase("en-IN");
    const matchesSearch = !search || [row.personName, row.employeeId, row.department, row.batchName, row.status, row.ipAddress, row.locationLabel, row.browser, row.operatingSystem, row.device, row.remarks].some((value) => String(value || "").toLocaleLowerCase("en-IN").includes(search));
    const matchesDate = !filters.date || rowDate === filters.date;
    const matchesFrom = !filters.from || rowDate >= filters.from;
    const matchesTo = !filters.to || rowDate <= filters.to;
    const matchesType = filters.type === "All" || row.type === filters.type;
    const matchesStatus = filters.status === "All" || row.status === filters.status;
    const matchesBatch = filters.batch === "All" || row.batch === filters.batch || studentMap[row.student]?.batch === filters.batch;
    const matchesCourse = filters.course === "All" || row.courseName === filters.course;
    const matchesEmployee = filters.employee === "All" || row.student === filters.employee || row.user === filters.employee;
    const matchesDepartment = filters.department === "All" || row.department === filters.department;
    const matchesWorking = filters.workingHours === "All" || (filters.workingHours === "Under 4h" && row.totalWorkingMinutes < 240) || (filters.workingHours === "4h - 8h" && row.totalWorkingMinutes >= 240 && row.totalWorkingMinutes < 480) || (filters.workingHours === "8h+" && row.totalWorkingMinutes >= 480);
    const matchesLocation = !filters.location || row.locationLabel.toLocaleLowerCase("en-IN").includes(filters.location.toLocaleLowerCase("en-IN"));
    const matchesBrowser = filters.browser === "All" || row.browser === filters.browser;
    const matchesDevice = filters.device === "All" || row.device === filters.device;
    return matchesSearch && matchesDate && matchesFrom && matchesTo && matchesType && matchesStatus && matchesBatch && matchesCourse && matchesEmployee && matchesDepartment && matchesWorking && matchesLocation && matchesBrowser && matchesDevice;
  }), [enrichedRows, filters, studentMap]);

  const sortedRows = useMemo(() => [...filteredRows].sort((a, b) => {
    const direction = sort.direction === "asc" ? 1 : -1;
    const left = a[sort.key] || "";
    const right = b[sort.key] || "";
    if (sort.key === "date" || sort.key.includes("Time")) return (new Date(left || 0) - new Date(right || 0)) * direction;
    if (typeof left === "number" || typeof right === "number") return (Number(left || 0) - Number(right || 0)) * direction;
    return String(left).localeCompare(String(right)) * direction;
  }), [filteredRows, sort]);

  const pageCount = Math.max(Math.ceil(sortedRows.length / pageSize), 1);
  const visibleRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);
  const todaysRows = useMemo(() => enrichedRows.filter((row) => sameDay(row.date, today())), [enrichedRows]);
  const activeRows = todaysRows.filter((row) => row.loginTime && !row.logoutTime);
  const onlineEmployees = activeRows.filter((row) => row.type !== "Student");
  const offlineEmployees = todaysRows.filter((row) => row.type !== "Student" && row.logoutTime);
  const presentToday = todaysRows.filter((row) => row.status === "Present").length;
  const absentToday = todaysRows.filter((row) => row.status === "Absent").length;
  const lateToday = todaysRows.filter((row) => row.status === "Late").length;
  const halfDayToday = todaysRows.filter((row) => row.status === "Half Day").length;
  const pendingLogout = todaysRows.filter((row) => row.status === "Pending Logout").length;
  const averageWorking = todaysRows.length ? Math.round(todaysRows.reduce((sum, row) => sum + (row.totalWorkingMinutes || 0), 0) / todaysRows.length) : 0;
  const attendancePercentage = todaysRows.length ? Math.round((todaysRows.filter((row) => ["Present", "Late", "Pending Logout"].includes(row.status)).length / todaysRows.length) * 100) : 0;

  const candidatePeople = form.type === "Student"
    ? students
    : users.filter((item) => form.type === "Faculty" ? item.role === "Faculty" : item.role !== "Student");
  const selectedPerson = form.type === "Student" ? studentMap[form.student] : userMap[form.user];
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
    const metadata = getClientMetadata();
    const payload = {
      date: baseDate,
      type: form.type,
      status: formSystemStatus,
      remarks: form.remarks,
      batch: form.batch || selectedStudent?.batch || undefined,
      student: form.type === "Student" ? form.student : undefined,
      user: form.type === "Student" ? undefined : form.user,
      loginTime: combineDateAndTime(baseDate, form.loginTime),
      logoutTime: combineDateAndTime(baseDate, form.logoutTime),
      totalWorkingMinutes: formWorkingMinutes,
      ...metadata
    };

    try {
      await api("/attendance", { method: "POST", body: JSON.stringify(payload) });
      setMessage("Attendance marked successfully");
      setForm({ ...form, student: "", user: "", status: "Present", loginTime: "", logoutTime: "", remarks: "" });
      setFilters((current) => ({
        ...current,
        date: baseDate,
        from: "",
        to: "",
        type: "All",
        status: "All",
        batch: "All",
        course: "All",
        employee: "All",
        department: "All",
        workingHours: "All",
        location: "",
        browser: "All",
        device: "All",
        search: ""
      }));
      setPage(1);
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

  const removeAttendance = async (row) => {
    if (!window.confirm(`Delete attendance record for ${row.personName}?`)) return;
    try {
      await api(`/attendance/${row._id}`, { method: "DELETE" });
      setMessage("Attendance record deleted");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const requestSort = (key) => {
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  };

  const clearFilters = () => setFilters({
    date: today(),
    from: "",
    to: "",
    type: "All",
    status: "All",
    batch: "All",
    course: "All",
    employee: "All",
    department: "All",
    workingHours: "All",
    location: "",
    browser: "All",
    device: "All",
    search: ""
  });

  const weeklyStats = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      count: enrichedRows.filter((row) => dateKey(row.date) === key && ["Present", "Late", "Pending Logout"].includes(row.status)).length
    };
  });
  const maxWeekly = Math.max(...weeklyStats.map((item) => item.count), 1);
  const statusCounts = statusOptions.map((status) => ({ status, count: filteredRows.filter((row) => row.status === status).length }));
  const departmentStats = departments.slice(0, 5).map((department) => ({ department, count: filteredRows.filter((row) => row.department === department).length }));
  const maxDepartment = Math.max(...departmentStats.map((item) => item.count), 1);

  const employeeOptions = [
    { value: "All", label: "All people" },
    ...students.map((student) => ({ value: student._id, label: `${student.name} (${student.studentId || "Student"})` })),
    ...users.map((user) => ({ value: user._id, label: `${user.name} (${user.employeeId || user.role || "Employee"})` }))
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-normal text-[#111315]">Attendance Management</h1>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1"><CalendarCheck size={15} /> Today&apos;s attendance overview</span>
              <span className="inline-flex items-center gap-1"><Wifi size={15} /> Live employee activity</span>
              <span className="inline-flex items-center gap-1"><Clock size={15} /> Working hours tracking</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={loadData} className={actionClass}><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
            <button onClick={() => downloadFile(`attendance-${filters.date || today()}.csv`, rowsToCsv(sortedRows))} className={actionClass}><Download size={16} /> Export CSV</button>
            <button onClick={() => downloadFile(`attendance-${filters.date || today()}.xls`, rowsToExcel(sortedRows), "application/vnd.ms-excel")} className={actionClass}><FileSpreadsheet size={16} /> Export Excel</button>
            <button onClick={() => window.print()} className={actionClass}><Printer size={16} /> Print Report</button>
          </div>
        </div>
      </section>

      {message && <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-bold text-[#c2410c]">{message}</p>}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatTile icon={UserCheck} label="Present Today" value={presentToday} tone="green" trend="+ Live" chart={[presentToday, presentToday + 1, presentToday, todaysRows.length, presentToday]} />
        <StatTile icon={UserMinus} label="Absent Today" value={absentToday} tone="red" chart={[1, absentToday, 2, absentToday, 1]} />
        <StatTile icon={Clock} label="Late Today" value={lateToday} tone="amber" chart={[0, lateToday, 1, lateToday, 2]} />
        <StatTile icon={Moon} label="Half Day" value={halfDayToday} tone="blue" chart={[0, halfDayToday, 1, 0, halfDayToday]} />
        <StatTile icon={LogOut} label="Pending Logout" value={pendingLogout} tone="orange" chart={[pendingLogout, 1, pendingLogout, 2, pendingLogout]} />
        <StatTile icon={Wifi} label="Online Employees" value={onlineEmployees.length} tone="green" chart={[1, onlineEmployees.length, 2, onlineEmployees.length, 3]} />
        <StatTile icon={WifiOff} label="Offline Employees" value={offlineEmployees.length} tone="slate" chart={[offlineEmployees.length, 2, 1, offlineEmployees.length, 0]} />
        <StatTile icon={BarChart3} label="Average Working Hours" value={minutes(averageWorking)} tone="violet" chart={[averageWorking, 120, 240, 360, 480]} />
        <StatTile icon={CheckCircle2} label="Attendance Percentage" value={`${attendancePercentage}%`} tone="orange" chart={[40, attendancePercentage, 65, 75, attendancePercentage]} />
      </section>

      <Panel title="Currently Online Employees" icon={Wifi} action={<span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">{onlineEmployees.length} online</span>}>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {onlineEmployees.map((row) => (
            <article key={row._id} className="min-w-[260px] rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <PersonAvatar name={row.personName} image={row.photo} />
                <div className="min-w-0">
                  <p className="truncate font-black">{row.personName}</p>
                  <p className="truncate text-xs text-slate-500">{row.department}</p>
                </div>
                <span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <p className="rounded-md bg-white p-2"><span className="block text-slate-500">Login</span><strong>{formatTime(row.loginTime)}</strong></p>
                <p className="rounded-md bg-white p-2"><span className="block text-slate-500">Working</span><strong>{minutes(Math.round((Date.now() - new Date(row.loginTime)) / 60000))}</strong></p>
              </div>
            </article>
          ))}
          {!onlineEmployees.length && <p className="w-full rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm font-semibold text-slate-500">No employees are currently online.</p>}
        </div>
      </Panel>

      <div className="grid gap-5 2xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <Panel title="Attendance Entry" icon={CalendarCheck} action={<span className="text-xs font-bold text-slate-500">Auto captures browser, OS and device</span>}>
              <form onSubmit={submitAttendance} className="grid gap-3 md:grid-cols-2">
                <label><span className={labelClass}>Date</span><input type="date" className={inputClass} value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
                <label><span className={labelClass}>Person Type</span><SearchableSelect className={dropdownClass} options={asOptions(typeOptions)} value={form.type} onChange={(type) => setForm({ ...form, type, student: "", user: "" })} placeholder="Select type..." searchPlaceholder="Search type..." /></label>
                <label><span className={labelClass}>Search Employee / Student</span><SearchableSelect className={dropdownClass} options={candidatePeople.map((item) => ({ value: item._id, label: `${item.name} ${item.employeeId || item.studentId || item.role ? `(${item.employeeId || item.studentId || item.role})` : ""}` }))} value={form.type === "Student" ? form.student : form.user} onChange={(value) => setForm(form.type === "Student" ? { ...form, student: value, batch: studentMap[value]?.batch || form.batch } : { ...form, user: value })} placeholder={`Select ${form.type.toLowerCase()}...`} searchPlaceholder={`Search ${form.type.toLowerCase()}...`} /></label>
                <label><span className={labelClass}>Batch</span><SearchableSelect className={dropdownClass} options={[{ value: "", label: "Auto / no batch" }, ...batches.map((batch) => ({ value: batch._id, label: batch.name }))]} value={form.batch} onChange={(batch) => setForm({ ...form, batch })} placeholder="Auto / no batch" searchPlaceholder="Search batch..." /></label>
                <div className="md:col-span-2 grid gap-3 lg:grid-cols-[0.7fr_1.3fr]">
                  <label><span className={labelClass}>Attendance Status</span><SearchableSelect className={dropdownClass} options={asOptions(statusOptions)} value={form.status} onChange={(status) => setForm({ ...form, status })} placeholder="Select status..." searchPlaceholder="Search status..." /></label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TimeQuickField label="Login time" actionLabel="Clock in" icon={LogIn} value={form.loginTime} onChange={(loginTime) => setForm({ ...form, loginTime })} onNow={() => setForm({ ...form, loginTime: currentTimeValue(), status: "Pending Logout" })} />
                    <TimeQuickField label="Logout time" actionLabel="Clock out" icon={LogOut} value={form.logoutTime} onChange={(logoutTime) => setForm({ ...form, logoutTime })} onNow={() => setForm({ ...form, logoutTime: currentTimeValue(), status: form.loginTime ? "Present" : form.status })} />
                  </div>
                </div>
                <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm md:col-span-2 sm:grid-cols-3">
                  <p><span className="block text-slate-500">Auto filled</span><strong>{selectedPerson?.name || "Select a person"}</strong></p>
                  <p><span className="block text-slate-500">Department / Course</span><strong>{selectedPerson?.department || selectedPerson?.courseName || "-"}</strong></p>
                  <p><span className="block text-slate-500">System Status</span><strong>{formSystemStatus} · {minutes(formWorkingMinutes)}</strong></p>
                </div>
                <input className={`${inputClass} md:col-span-2`} placeholder="Remarks" value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} />
                <button className={`${primaryActionClass} md:col-span-2`}><Save size={16} /> Save Attendance</button>
              </form>
            </Panel>

            <Panel title="Advanced Filters" icon={Filter} action={<button className="text-xs font-black text-[#c2410c]" onClick={clearFilters}>Reset filters</button>}>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="md:col-span-2"><span className={labelClass}>Search</span><div className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 focus-within:border-[#f97316]"><Search size={16} className="text-slate-400" /><input className="w-full bg-transparent text-sm outline-none" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search employee, department, IP, location..." /></div></label>
                <label><span className={labelClass}>Date</span><input type="date" className={inputClass} value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} /></label>
                <label><span className={labelClass}>Date Range From</span><input type="date" className={inputClass} value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value, date: "" })} /></label>
                <label><span className={labelClass}>Date Range To</span><input type="date" className={inputClass} value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value, date: "" })} /></label>
                <label><span className={labelClass}>Department</span><SearchableSelect className={dropdownClass} options={asOptions(["All", ...departments])} value={filters.department} onChange={(department) => setFilters({ ...filters, department })} /></label>
                <label><span className={labelClass}>Batch</span><SearchableSelect className={dropdownClass} options={[{ value: "All", label: "All batches" }, ...batches.map((batch) => ({ value: batch._id, label: batch.name }))]} value={filters.batch} onChange={(batch) => setFilters({ ...filters, batch })} /></label>
                <label><span className={labelClass}>Course</span><SearchableSelect className={dropdownClass} options={asOptions(["All", ...courses])} value={filters.course} onChange={(course) => setFilters({ ...filters, course })} /></label>
                <label><span className={labelClass}>Employee</span><SearchableSelect className={dropdownClass} options={employeeOptions} value={filters.employee} onChange={(employee) => setFilters({ ...filters, employee })} searchPlaceholder="Search people..." /></label>
                <label><span className={labelClass}>Status</span><SearchableSelect className={dropdownClass} options={asOptions(["All", ...statusOptions])} value={filters.status} onChange={(status) => setFilters({ ...filters, status })} /></label>
                <label><span className={labelClass}>Working Hours</span><SearchableSelect className={dropdownClass} options={asOptions(["All", "Under 4h", "4h - 8h", "8h+"])} value={filters.workingHours} onChange={(workingHours) => setFilters({ ...filters, workingHours })} /></label>
                <label><span className={labelClass}>Browser</span><SearchableSelect className={dropdownClass} options={asOptions(["All", ...browsers])} value={filters.browser} onChange={(browser) => setFilters({ ...filters, browser })} /></label>
                <label><span className={labelClass}>Device</span><SearchableSelect className={dropdownClass} options={asOptions(["All", ...devices])} value={filters.device} onChange={(device) => setFilters({ ...filters, device })} /></label>
                <label className="md:col-span-2"><span className={labelClass}>Location</span><input className={inputClass} value={filters.location} onChange={(event) => setFilters({ ...filters, location: event.target.value })} placeholder="City, state or country" /></label>
              </div>
            </Panel>
          </div>

          <Panel title="Analytics" icon={BarChart3}>
            <div className="grid gap-4 xl:grid-cols-3">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="mb-4 text-sm font-black">Weekly Attendance</p>
                <div className="flex h-44 items-end gap-2">
                  {weeklyStats.map((item) => (
                    <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                      <div className="w-full rounded-t-md bg-[#f97316]" style={{ height: `${Math.max((item.count / maxWeekly) * 100, 6)}%` }} />
                      <span className="text-xs font-bold text-slate-500">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-black">Attendance Trend</p>
                {statusCounts.map((item) => <MetricBar key={item.status} label={item.status} value={item.count} max={Math.max(filteredRows.length, 1)} color={item.status === "Absent" ? "bg-rose-500" : item.status === "Late" ? "bg-amber-500" : "bg-[#f97316]"} />)}
              </div>
              <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-black">Department Attendance</p>
                {departmentStats.length ? departmentStats.map((item) => <MetricBar key={item.department} label={item.department} value={item.count} max={maxDepartment} color="bg-emerald-500" />) : <p className="text-sm text-slate-500">Department data will appear with employee records.</p>}
              </div>
            </div>
          </Panel>

          <Panel title="Attendance History" icon={CalendarCheck} action={<div className="flex items-center gap-2 text-xs font-bold text-slate-500"><span>{sortedRows.length} records</span><SearchableSelect className="w-24" options={asOptions([10, 25, 50].map(String))} value={String(pageSize)} onChange={(value) => setPageSize(Number(value))} /></div>}>
            <div className="table-wrap max-h-[640px] rounded-lg border border-slate-200 bg-white">
              <table className="w-full min-w-[1680px] text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-500 shadow-sm">
                  <tr>
                    {[
                      ["personName", "Employee"],
                      ["employeeId", "Employee ID"],
                      ["department", "Department"],
                      ["date", "Date"],
                      ["loginTime", "Login Time"],
                      ["logoutTime", "Logout Time"],
                      ["totalWorkingMinutes", "Working Hours"],
                      ["status", "Attendance Status"],
                      ["lateMinutes", "Late Minutes"],
                      ["ipAddress", "IP Address"],
                      ["locationLabel", "Location"],
                      ["timezone", "Timezone"],
                      ["browser", "Browser"],
                      ["operatingSystem", "Operating System"],
                      ["device", "Device"],
                      ["totalWorkingMinutes", "Session Duration"],
                      ["remarks", "Remarks"]
                    ].map(([key, label]) => (
                      <th key={`${key}-${label}`} className="whitespace-nowrap px-3 py-3 font-black">
                        <button className="inline-flex items-center gap-1 hover:text-[#c2410c]" onClick={() => requestSort(key)}>{label}<MoreHorizontal size={13} /></button>
                      </th>
                    ))}
                    <th className="sticky right-0 bg-slate-50 px-3 py-3 font-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleRows.map((row) => (
                    <tr key={row._id} className="hover:bg-slate-50">
                      <td className="px-3 py-3"><div className="flex items-center gap-3"><PersonAvatar name={row.personName} image={row.photo} /><div><p className="font-black">{row.personName}</p><p className="text-xs text-slate-500">{row.type}</p></div></div></td>
                      <td className="px-3 py-3">{row.employeeId}</td>
                      <td className="px-3 py-3">{row.department}</td>
                      <td className="px-3 py-3">{formatDate(row.date)}</td>
                      <td className="px-3 py-3"><TimeEditor value={timeInputValue(row.loginTime)} disabled={savingTimeId === `${row._id}-loginTime`} onSave={(value) => updateAttendanceTime(row, "loginTime", value)} /></td>
                      <td className="px-3 py-3"><TimeEditor value={timeInputValue(row.logoutTime)} disabled={savingTimeId === `${row._id}-logoutTime`} onSave={(value) => updateAttendanceTime(row, "logoutTime", value)} /></td>
                      <td className="px-3 py-3 font-bold">{minutes(row.totalWorkingMinutes)}</td>
                      <td className="px-3 py-3"><StatusBadge status={row.status} /></td>
                      <td className="px-3 py-3">{row.lateMinutes ? `${row.lateMinutes}m` : "-"}</td>
                      <td className="px-3 py-3">{row.ipAddress || "-"}</td>
                      <td className="px-3 py-3">{row.locationLabel}</td>
                      <td className="px-3 py-3">{row.timezone || "-"}</td>
                      <td className="px-3 py-3">{row.browser}</td>
                      <td className="px-3 py-3">{row.operatingSystem}</td>
                      <td className="px-3 py-3">{row.device}</td>
                      <td className="px-3 py-3">{minutes(row.totalWorkingMinutes)}</td>
                      <td className="px-3 py-3">{row.remarks || "-"}</td>
                      <td className="sticky right-0 bg-white px-3 py-3">
                        <div className="flex gap-1">
                          <button className="rounded-md border border-slate-200 p-2 hover:border-[#f97316] hover:text-[#f97316]" onClick={() => setSelectedRow(row)} aria-label="View details"><Eye size={15} /></button>
                          <button className="rounded-md border border-slate-200 p-2 hover:border-[#f97316] hover:text-[#f97316]" onClick={() => setSelectedRow(row)} aria-label="Edit"><Edit3 size={15} /></button>
                          <button className="rounded-md border border-slate-200 p-2 hover:border-rose-400 hover:text-rose-600" onClick={() => removeAttendance(row)} aria-label="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!visibleRows.length && (
                    <tr>
                      <td colSpan="18" className="px-4 py-10 text-center text-slate-500">No attendance records match the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-500">Page {page} of {pageCount}</p>
              <div className="flex gap-2">
                <button className={actionClass} disabled={page <= 1} onClick={() => setPage((current) => Math.max(current - 1, 1))}>Previous</button>
                <button className={actionClass} disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(current + 1, pageCount))}>Next</button>
              </div>
            </div>
          </Panel>

          <Panel title="Login History" icon={Laptop}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sortedRows.slice(0, 6).map((row) => (
                <article key={`history-${row._id}`} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black">{row.personName}</p>
                    <StatusBadge status={row.loginTime && !row.logoutTime ? "Pending Logout" : row.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <p><strong>Login:</strong> {formatTime(row.loginTime)}</p>
                    <p><strong>Logout:</strong> {formatTime(row.logoutTime)}</p>
                    <p><strong>IP:</strong> {row.ipAddress || "-"}</p>
                    <p><strong>Duration:</strong> {minutes(row.totalWorkingMinutes)}</p>
                    <p className="col-span-2"><strong>Location:</strong> {row.locationLabel}</p>
                    <p className="col-span-2"><strong>Device:</strong> {row.browser} · {row.operatingSystem}</p>
                  </div>
                </article>
              ))}
              {!sortedRows.length && <p className="text-sm text-slate-500">Saved attendance sessions will appear here.</p>}
            </div>
          </Panel>
        </div>

        <aside className="space-y-5">
          <Panel title="Quick Widgets" icon={Smartphone}>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Today&apos;s Holidays</p><p className="mt-1 font-black">No holiday record</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Birthdays</p><p className="mt-1 font-black">No birthday data</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Employees on Leave</p><p className="mt-1 font-black">{todaysRows.filter((row) => row.status === "Leave").length}</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Late Employees</p><p className="mt-1 font-black">{lateToday}</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Pending Logout</p><p className="mt-1 font-black">{pendingLogout}</p></div>
            </div>
          </Panel>
          <Panel title="Security" icon={ShieldAlert}>
            <div className="space-y-2">
              {filteredRows.filter((row) => row.securityFlags.length).slice(0, 5).map((row) => (
                <div key={`security-${row._id}`} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="font-black text-amber-900">{row.personName}</p>
                  <p className="mt-1 text-xs font-bold text-amber-700">{row.securityFlags.join(", ")}</p>
                </div>
              ))}
              {!filteredRows.some((row) => row.securityFlags.length) && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">No security warnings in the current filtered records.</p>}
            </div>
          </Panel>
          <Panel title="Working Hours" icon={Clock}>
            <div className="space-y-3">
              <MetricBar label="Under 4h" value={filteredRows.filter((row) => row.totalWorkingMinutes < 240).length} max={Math.max(filteredRows.length, 1)} color="bg-rose-500" />
              <MetricBar label="4h - 8h" value={filteredRows.filter((row) => row.totalWorkingMinutes >= 240 && row.totalWorkingMinutes < 480).length} max={Math.max(filteredRows.length, 1)} color="bg-amber-500" />
              <MetricBar label="8h+" value={filteredRows.filter((row) => row.totalWorkingMinutes >= 480).length} max={Math.max(filteredRows.length, 1)} color="bg-emerald-500" />
            </div>
          </Panel>
        </aside>
      </div>

      <DetailsModal row={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  );
}
