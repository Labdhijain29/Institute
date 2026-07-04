import React, { useEffect, useMemo, useState } from "react";
import { Download, LogIn, LogOut, Plus, RefreshCw, Save } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { StatCard } from "../components/StatCard.jsx";

const inputClass = "h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#f97316]";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]";
const secondaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#f97316] hover:text-[#c2410c]";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function monthNow() {
  return new Date().toISOString().slice(0, 7);
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

function downloadFile(name, text, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows = []) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]).filter((key) => !["_id", "__v"].includes(key));
  const cell = (value) => `"${String(typeof value === "object" && value !== null ? JSON.stringify(value) : value ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map((row) => keys.map((key) => cell(row[key])).join(","))].join("\n");
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

export function EmployeeOperationsPage({ module }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [me, setMe] = useState(null);
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(monthNow());
  const path = module?.path || "employee-desk";
  const canPayroll = ["Super Admin", "Admin", "HR", "Accountant"].includes(user.role);
  const canOfficeIp = ["Super Admin", "Admin"].includes(user.role);
  const canSubmitLectureReport = ["Super Admin", "Admin", "Faculty"].includes(user.role);
  const pageDescription = path === "employee-reports"
    ? "View all employee profiles, departments, roles, salary basics, and staff status in one place."
    : "Attendance, leave, payroll, lecture reports, and role-wise staff reporting.";

  const [leaveForm, setLeaveForm] = useState({ leaveType: "Casual", fromDate: today(), toDate: today(), days: 1, reason: "" });
  const [lectureForm, setLectureForm] = useState({ date: today(), courseName: "", batchName: "", classTiming: "", topicTaught: "", durationMinutes: 60, studentAttendanceCount: 0, notes: "" });
  const [payrollForm, setPayrollForm] = useState({ user: "", month: monthNow(), bonus: 0, incentives: 0, deductions: 0, advanceSalary: 0 });
  const [ipForm, setIpForm] = useState({ label: "", ipAddress: "", remarks: "" });

  const loadBase = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [summaryData, meData] = await Promise.all([
        ["Super Admin", "Admin", "Manager", "HR", "Accountant"].includes(user.role) ? api(`/employee/summary?month=${month}`) : Promise.resolve(null),
        api(`/employee/me?month=${month}`)
      ]);
      setSummary(summaryData);
      setMe(meData);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRows = async () => {
    try {
      const endpoint = path === "payroll"
        ? `/salaries?limit=100`
        : path === "leave-requests"
          ? `/employee/leaves`
          : path === "lecture-reports"
            ? `/employee/lecture-reports`
            : path === "office-ips"
              ? `/office-ips?limit=100`
              : path === "employee-reports"
                ? `/employee/employees`
              : `/attendance?limit=100`;
      const data = await api(endpoint);
      setRows(data.items || []);
    } catch (error) {
      setRows([]);
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadBase();
  }, [month]);

  useEffect(() => {
    loadRows();
  }, [path]);

  useEffect(() => {
    if (!canPayroll) return;
    api("/employee/payroll-employees")
      .then((data) => setUsers(data.items || []))
      .catch(() => setUsers([]));
  }, [canPayroll]);

  const attendanceColumns = [
    { key: "date", label: "Date", render: (row) => row.date?.slice(0, 10) || "-" },
    { key: "loginTime", label: "Login", render: (row) => formatTime(row.loginTime) },
    { key: "logoutTime", label: "Logout", render: (row) => formatTime(row.logoutTime) },
    { key: "totalWorkingMinutes", label: "Hours", render: (row) => minutes(row.totalWorkingMinutes) },
    { key: "status", label: "Status" },
    { key: "ipAddress", label: "IP" },
    { key: "remarks", label: "Remarks" }
  ];

  const columns = useMemo(() => {
    if (path === "payroll") return [
      { key: "month", label: "Month" },
      { key: "monthlySalary", label: "Monthly", render: (row) => `₹${Number(row.monthlySalary || row.grossAmount || 0).toLocaleString("en-IN")}` },
      { key: "deductions", label: "Deductions", render: (row) => `₹${Number(row.deductions || 0).toLocaleString("en-IN")}` },
      { key: "netAmount", label: "Payable", render: (row) => `₹${Number(row.netAmount || 0).toLocaleString("en-IN")}` },
      { key: "status", label: "Status" }
    ];
    if (path === "leave-requests") return [
      { key: "leaveType", label: "Type" },
      { key: "fromDate", label: "From", render: (row) => row.fromDate?.slice(0, 10) || "-" },
      { key: "toDate", label: "To", render: (row) => row.toDate?.slice(0, 10) || "-" },
      { key: "days", label: "Days" },
      { key: "status", label: "Status" },
      { key: "reason", label: "Reason" }
    ];
    if (path === "lecture-reports") return [
      { key: "date", label: "Date", render: (row) => row.date?.slice(0, 10) || "-" },
      { key: "courseName", label: "Course" },
      { key: "batchName", label: "Batch" },
      { key: "topicTaught", label: "Topic" },
      { key: "durationMinutes", label: "Duration" },
      { key: "studentAttendanceCount", label: "Students" }
    ];
    if (path === "office-ips") return [
      { key: "label", label: "Office" },
      { key: "ipAddress", label: "IP Address" },
      { key: "isActive", label: "Active", render: (row) => row.isActive === false ? "No" : "Yes" },
      { key: "remarks", label: "Remarks" }
    ];
    if (path === "employee-reports") return [
      { key: "employeeId", label: "Employee ID" },
      { key: "name", label: "Name" },
      { key: "mobile", label: "Mobile" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "monthlySalary", label: "Monthly Salary", render: (row) => `₹${Number(row.monthlySalary || 0).toLocaleString("en-IN")}` },
      { key: "status", label: "Status" }
    ];
    return attendanceColumns;
  }, [path]);

  const login = async () => {
    try {
      const result = await api("/employee/attendance/login", { method: "POST", body: JSON.stringify({}) });
      setMessage(result.message);
      await loadBase();
      await loadRows();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const logout = async () => {
    try {
      const result = await api("/employee/attendance/logout", { method: "POST", body: JSON.stringify({}) });
      setMessage(result.message);
      await loadBase();
      await loadRows();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const submitLeave = async (event) => {
    event.preventDefault();
    try {
      await api("/employee/leaves", { method: "POST", body: JSON.stringify(leaveForm) });
      setLeaveForm({ leaveType: "Casual", fromDate: today(), toDate: today(), days: 1, reason: "" });
      setMessage("Leave request submitted");
      await loadRows();
      await loadBase();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const submitLecture = async (event) => {
    event.preventDefault();
    try {
      await api("/employee/lecture-reports", { method: "POST", body: JSON.stringify(lectureForm) });
      setLectureForm({ date: today(), courseName: "", batchName: "", classTiming: "", topicTaught: "", durationMinutes: 60, studentAttendanceCount: 0, notes: "" });
      setMessage("Lecture report submitted");
      await loadRows();
      await loadBase();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const calculatePayroll = async (event) => {
    event.preventDefault();
    try {
      await api("/employee/payroll/calculate", { method: "POST", body: JSON.stringify(payrollForm) });
      setMessage("Payroll calculated");
      await loadRows();
      await loadBase();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveIp = async (event) => {
    event.preventDefault();
    try {
      await api("/office-ips", { method: "POST", body: JSON.stringify(ipForm) });
      setIpForm({ label: "", ipAddress: "", remarks: "" });
      setMessage("Office IP added");
      await loadRows();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const exportReport = async (type, format) => {
    try {
      const result = await api(`/employee/reports/export?type=${type}&month=${month}&format=${format}`);
      if (format === "excel") downloadFile(`${type}-${month}.csv`, toCsv(result.items || []));
      else downloadFile(`${type}-${month}.json`, JSON.stringify(result.items || [], null, 2), "application/json");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#f97316]">{module?.label || "Employee Desk"}</p>
            <h2 className="mt-1 text-2xl font-bold">{path === "employee-reports" ? "All employee details" : "Employee activity and operations"}</h2>
            <p className="mt-1 text-sm text-slate-500">{pageDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input type="month" className={inputClass} value={month} onChange={(event) => setMonth(event.target.value)} />
            <button onClick={loadBase} className={secondaryButtonClass}><RefreshCw size={16} /> Refresh</button>
          </div>
        </div>
      </section>

      {message && <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{message}</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={summary?.totalEmployees ?? me?.employee?.role ?? "-"} tone="ink" />
        <StatCard label="Present Today" value={summary?.today?.present ?? me?.todayAttendance?.status ?? "Not logged"} tone="pine" />
        <StatCard label="Late Today" value={summary?.today?.late ?? me?.monthlySummary?.late ?? 0} tone="amber" />
        <StatCard label="Payroll Payable" value={summary ? `₹${Number(summary.salarySummary?.payable || 0).toLocaleString("en-IN")}` : me?.salary?.status || "-"} tone="coral" />
      </section>

      {path === "employee-desk" && (
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel title="Today Attendance">
            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={login} className={buttonClass}><LogIn size={16} /> Login</button>
              <button onClick={logout} className={secondaryButtonClass}><LogOut size={16} /> Logout</button>
            </div>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <p><span className="text-slate-500">Status:</span> <strong>{me?.todayAttendance?.status || "Not logged"}</strong></p>
              <p><span className="text-slate-500">Login:</span> <strong>{formatTime(me?.todayAttendance?.loginTime)}</strong></p>
              <p><span className="text-slate-500">Logout:</span> <strong>{formatTime(me?.todayAttendance?.logoutTime)}</strong></p>
              <p><span className="text-slate-500">Working:</span> <strong>{minutes(me?.todayAttendance?.totalWorkingMinutes)}</strong></p>
            </div>
          </Panel>
          <Panel title="Employee Profile">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Employee ID", me?.employee?.id],
                ["Name", me?.employee?.name],
                ["Role", me?.employee?.role],
                ["Department", me?.employee?.department],
                ["Designation", me?.employee?.designation],
                ["Monthly Salary", me?.employee?.monthlySalary ? `₹${Number(me.employee.monthlySalary).toLocaleString("en-IN")}` : "-"]
              ].map(([label, value]) => <p key={label}><span className="text-slate-500">{label}:</span> <strong>{value || "-"}</strong></p>)}
            </div>
          </Panel>
        </div>
      )}

      {path === "leave-requests" && (
        <Panel title="Apply Leave">
          <form onSubmit={submitLeave} className="grid gap-3 md:grid-cols-5">
            <select className={inputClass} value={leaveForm.leaveType} onChange={(event) => setLeaveForm({ ...leaveForm, leaveType: event.target.value })}>{["Casual", "Sick", "Paid", "Unpaid"].map((item) => <option key={item}>{item}</option>)}</select>
            <input type="date" className={inputClass} value={leaveForm.fromDate} onChange={(event) => setLeaveForm({ ...leaveForm, fromDate: event.target.value })} />
            <input type="date" className={inputClass} value={leaveForm.toDate} onChange={(event) => setLeaveForm({ ...leaveForm, toDate: event.target.value })} />
            <input type="number" min="1" className={inputClass} value={leaveForm.days} onChange={(event) => setLeaveForm({ ...leaveForm, days: Number(event.target.value) })} />
            <button className={buttonClass}><Plus size={16} /> Apply</button>
            <input className={`${inputClass} md:col-span-5`} placeholder="Reason" value={leaveForm.reason} onChange={(event) => setLeaveForm({ ...leaveForm, reason: event.target.value })} />
          </form>
        </Panel>
      )}

      {path === "lecture-reports" && canSubmitLectureReport && (
        <Panel title="Submit Faculty Lecture Report">
          <form onSubmit={submitLecture} className="grid gap-3 md:grid-cols-3">
            <input type="date" className={inputClass} value={lectureForm.date} onChange={(event) => setLectureForm({ ...lectureForm, date: event.target.value })} />
            <input className={inputClass} placeholder="Course name" value={lectureForm.courseName} onChange={(event) => setLectureForm({ ...lectureForm, courseName: event.target.value })} />
            <input className={inputClass} placeholder="Batch name" value={lectureForm.batchName} onChange={(event) => setLectureForm({ ...lectureForm, batchName: event.target.value })} />
            <input className={inputClass} placeholder="Class timing" value={lectureForm.classTiming} onChange={(event) => setLectureForm({ ...lectureForm, classTiming: event.target.value })} />
            <input required className={inputClass} placeholder="Topic taught" value={lectureForm.topicTaught} onChange={(event) => setLectureForm({ ...lectureForm, topicTaught: event.target.value })} />
            <input type="number" className={inputClass} placeholder="Duration minutes" value={lectureForm.durationMinutes} onChange={(event) => setLectureForm({ ...lectureForm, durationMinutes: Number(event.target.value) })} />
            <input type="number" className={inputClass} placeholder="Student attendance count" value={lectureForm.studentAttendanceCount} onChange={(event) => setLectureForm({ ...lectureForm, studentAttendanceCount: Number(event.target.value) })} />
            <input className={`${inputClass} md:col-span-2`} placeholder="Notes / remarks" value={lectureForm.notes} onChange={(event) => setLectureForm({ ...lectureForm, notes: event.target.value })} />
            <button className={buttonClass}><Save size={16} /> Submit Report</button>
          </form>
        </Panel>
      )}

      {path === "payroll" && canPayroll && (
        <Panel title="Calculate Payroll">
          <form onSubmit={calculatePayroll} className="grid gap-3 md:grid-cols-4">
            <select required className={inputClass} value={payrollForm.user} onChange={(event) => setPayrollForm({ ...payrollForm, user: event.target.value })}>
              <option value="">Select employee</option>
              {users.map((item) => <option key={item._id} value={item._id}>{item.name} ({item.role})</option>)}
            </select>
            <input type="month" className={inputClass} value={payrollForm.month} onChange={(event) => setPayrollForm({ ...payrollForm, month: event.target.value })} />
            {["bonus", "incentives", "deductions", "advanceSalary"].map((field) => (
              <input key={field} type="number" className={inputClass} placeholder={field} value={payrollForm[field]} onChange={(event) => setPayrollForm({ ...payrollForm, [field]: Number(event.target.value) })} />
            ))}
            <button className={buttonClass}><Save size={16} /> Calculate</button>
          </form>
        </Panel>
      )}

      {path === "office-ips" && canOfficeIp && (
        <Panel title="Allowed Office IP">
          <form onSubmit={saveIp} className="grid gap-3 md:grid-cols-4">
            <input required className={inputClass} placeholder="Office label" value={ipForm.label} onChange={(event) => setIpForm({ ...ipForm, label: event.target.value })} />
            <input required className={inputClass} placeholder="IP address" value={ipForm.ipAddress} onChange={(event) => setIpForm({ ...ipForm, ipAddress: event.target.value })} />
            <input className={inputClass} placeholder="Remarks" value={ipForm.remarks} onChange={(event) => setIpForm({ ...ipForm, remarks: event.target.value })} />
            <button className={buttonClass}><Plus size={16} /> Add IP</button>
          </form>
        </Panel>
      )}

      {path === "employee-reports" && (
        <Panel title="Exports">
          <div className="flex flex-wrap gap-2">
            {["attendance", "salary", "lecture"].map((type) => (
              <React.Fragment key={type}>
                <button onClick={() => exportReport(type, "excel")} className={secondaryButtonClass}><Download size={16} /> {type} Excel</button>
                <button onClick={() => exportReport(type, "pdf")} className={secondaryButtonClass}><Download size={16} /> {type} PDF Data</button>
              </React.Fragment>
            ))}
          </div>
        </Panel>
      )}

      <Panel title={path === "employee-desk" ? "Monthly Attendance" : "Records"} action={loading ? <span className="text-sm text-slate-500">Loading...</span> : null}>
        <DataTable columns={path === "employee-desk" ? attendanceColumns : columns} rows={path === "employee-desk" ? (me?.attendance || []) : rows} />
      </Panel>
    </div>
  );
}
