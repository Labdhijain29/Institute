import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, PhoneCall, Plus, Send, UserCheck, X } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { EmployeeDashboardWidget } from "../components/EmployeeDashboardWidget.jsx";
import { SearchableSelect } from "../components/SearchableSelect.jsx";
import { courses as publicCourses } from "../data/publicContent.js";

const emptyLead = {
  name: "",
  mobile: "",
  courseInterested: "",
  leadDate: new Date().toISOString().slice(0, 10),
  college: "",
  source: "Website",
  priority: "Warm",
  remarks: ""
};

const dummyFacultyUsers = [
  { _id: "000000000000000000000101", name: "Faculty A" },
  { _id: "000000000000000000000102", name: "Faculty B" },
  { _id: "000000000000000000000103", name: "Faculty C" }
];

const FACULTY_HANDOFF_KEY = "crm_faculty_handoffs";
const emptyFollowUp = {
  followUpDate: new Date().toISOString().slice(0, 10),
  nextFollowUpDate: "",
  status: "Interested",
  remarks: ""
};
const followUpStatuses = ["Interested", "Not Interested", "Call Back Later", "Demo Scheduled", "Converted", "Lost"];

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-");
const idOf = (value) => (typeof value === "object" ? value?._id : value);
const objectIdPattern = /^[a-f\d]{24}$/i;
const dateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export function normalizeLeadPayload(values) {
  const payload = { ...values };
  if (payload.courseInterested && !objectIdPattern.test(payload.courseInterested)) {
    payload.courseName = payload.courseInterested;
    payload.courseInterested = null;
  } else if (payload.courseInterested) {
    payload.courseName = "";
  }
  if (!payload.courseInterested && !payload.courseName) {
    payload.courseInterested = null;
    payload.courseName = "";
  }
  if (!payload.leadDate) delete payload.leadDate;
  delete payload._id;
  return payload;
}

function leadToForm(lead) {
  return {
    name: lead.name || "",
    mobile: lead.mobile || "",
    courseInterested: lead.courseName || idOf(lead.courseInterested) || "",
    leadDate: dateInput(lead.leadDate || lead.createdAt) || new Date().toISOString().slice(0, 10),
    college: lead.college || "",
    source: lead.source || "Website",
    priority: lead.priority || "Warm",
    remarks: lead.remarks || "",
    status: lead.status || "New"
  };
}

function readFacultyHandoffs() {
  try {
    return JSON.parse(localStorage.getItem(FACULTY_HANDOFF_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeFacultyHandoffs(handoffs) {
  localStorage.setItem(FACULTY_HANDOFF_KEY, JSON.stringify(handoffs));
}

export function LeadsPage({ module }) {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [courses, setCourses] = useState([]);
  const [facultyUsers, setFacultyUsers] = useState([]);
  const [facultySelections, setFacultySelections] = useState({});
  const [facultyHandoffs, setFacultyHandoffs] = useState(() => readFacultyHandoffs());
  const [form, setForm] = useState(emptyLead);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [followUpForm, setFollowUpForm] = useState(emptyFollowUp);
  const [followUps, setFollowUps] = useState([]);
  const [message, setMessage] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [leadStatusFilter, setLeadStatusFilter] = useState("");
  const role = user?.role || "";
  const workflowRole = module?.workflowRole || role;

  const canCreateLead = workflowRole === "Telecaller" && ["Super Admin", "Admin", "Manager", "Telecaller", "Receptionist"].includes(role);
  const isTelecallerFlow = workflowRole === "Telecaller";
  const isCounsellorFlow = workflowRole === "Counsellor";
  const isFacultyFlow = workflowRole === "Faculty";
  const isAdmissionsFlow = workflowRole === "Admissions";
  const canWorkTelecaller = isTelecallerFlow && ["Super Admin", "Admin", "Manager", "Telecaller"].includes(role);
  const canWorkCounsellor = isCounsellorFlow && ["Super Admin", "Admin", "Manager", "Counsellor"].includes(role);
  const canWorkFaculty = isFacultyFlow && ["Super Admin", "Admin", "Manager", "Faculty"].includes(role);

  const loadLeads = async () => {
    const data = await api("/leads?limit=100");
    setLeads(data.items || []);
  };

  useEffect(() => {
    loadLeads().catch((err) => setMessage(err.message));
  }, [workflowRole]);

  useEffect(() => {
    api("/courses?limit=100")
      .then((data) => setCourses(data.items || []))
      .catch((err) => setMessage(err.message));
  }, []);

  useEffect(() => {
    if (!isCounsellorFlow) return;
    api("/leads/faculty-options")
      .then((data) => setFacultyUsers(data.items?.length ? data.items : dummyFacultyUsers))
      .catch(() => setFacultyUsers(dummyFacultyUsers));
  }, [isCounsellorFlow]);

  const createLead = async (event) => {
    event.preventDefault();
    await api("/leads", { method: "POST", body: JSON.stringify(normalizeLeadPayload(form)) });
    setForm(emptyLead);
    setCreateOpen(false);
    setMessage("Lead created successfully");
    await loadLeads();
  };

  const openEditLead = (lead) => {
    setActiveLead(lead);
    setForm(leadToForm(lead));
    setEditOpen(true);
  };

  const updateLead = async (event) => {
    event.preventDefault();
    if (!activeLead?._id) return;
    await api(`/leads/${activeLead._id}`, { method: "PATCH", body: JSON.stringify(normalizeLeadPayload(form)) });
    setForm(emptyLead);
    setActiveLead(null);
    setEditOpen(false);
    setMessage("Lead updated successfully");
    await loadLeads();
  };

  const openFollowUp = async (lead) => {
    setActiveLead(lead);
    setFollowUpForm(emptyFollowUp);
    setFollowUpOpen(true);
    try {
      const data = await api(`/leads/${lead._id}/follow-ups`);
      setFollowUps(data.items || []);
    } catch {
      setFollowUps([]);
    }
  };

  const openDetails = async (lead) => {
    setActiveLead(lead);
    setDetailsOpen(true);
    try {
      const data = await api(`/leads/${lead._id}/follow-ups`);
      setFollowUps(data.items || []);
    } catch {
      setFollowUps([]);
    }
  };

  const saveFollowUp = async (event) => {
    event.preventDefault();
    if (!activeLead?._id) return;
    await api(`/leads/${activeLead._id}/follow-ups`, {
      method: "POST",
      body: JSON.stringify(followUpForm)
    });
    setFollowUpOpen(false);
    setActiveLead(null);
    setFollowUpForm(emptyFollowUp);
    setMessage("Follow-up saved successfully");
    await loadLeads();
  };

  const forward = async (lead) => {
    try {
      await api(`/leads/${lead._id}/forward`, { method: "POST", body: JSON.stringify({ remarks: "Forwarded for counselling" }) });
      setMessage("Lead forwarded to counsellor");
      await loadLeads();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const forwardFaculty = async (lead) => {
    const facultyAssigned = facultySelections[lead._id] || facultyUsers[0]?._id;
    const selectedFaculty = facultyUsers.find((faculty) => faculty._id === facultyAssigned);
    if (!facultyAssigned) return;
    try {
      const payload = { facultyAssigned, remarks: "Forwarded for faculty approval" };
      try {
        await api(`/leads/${lead._id}/forward-faculty`, { method: "POST", body: JSON.stringify(payload) });
      } catch (error) {
        if (!error.message.includes("Route not found")) throw error;
        await api(`/leads/${lead._id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...payload, status: "Forwarded", admissionStatus: "Pending" })
        });
      }
      const nextHandoffs = {
        ...facultyHandoffs,
        [lead._id]: { facultyAssigned, facultyName: selectedFaculty?.name || "Faculty", status: "Pending" }
      };
      setFacultyHandoffs(nextHandoffs);
      writeFacultyHandoffs(nextHandoffs);
      setMessage("Lead forwarded to faculty");
      await loadLeads();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const approveAdmission = async (lead) => {
    try {
      const nextHandoffs = {
        ...facultyHandoffs,
        [lead._id]: { ...facultyHandoffs[lead._id], status: "Done" }
      };
      setFacultyHandoffs(nextHandoffs);
      writeFacultyHandoffs(nextHandoffs);
      await api(`/leads/${lead._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Converted", admissionStatus: "Done", remarks: "Admission done" })
      });
      setMessage("Faculty approved lead and admission is done");
      await loadLeads();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const isCourseWebsiteLead = (lead) => lead.source === "Website" && /Interested Course|Course Counsellor Request/i.test(lead.remarks || "");
  const isCounsellorLead = (lead) => ["Forwarded", "Forwarded to Counsellor"].includes(lead.status) || Boolean(lead.counsellorAssigned) || isCourseWebsiteLead(lead);
  const isFacultyLead = (lead) => lead.status === "Forwarded to Faculty" || Boolean(lead.facultyAssigned) || Boolean(facultyHandoffs[lead._id]);
  const admissionStatus = (lead) => lead.admissionStatus || facultyHandoffs[lead._id]?.status || (lead.convertedStudent || lead.status === "Admission Done" || lead.status === "Converted" ? "Done" : "Pending");
  const courseName = (row) => row.courseName || courses.find((course) => course._id === idOf(row.courseInterested))?.name || (typeof row.courseInterested === "object" ? row.courseInterested?.name : "") || "-";
  const telecallerLeadStatus = (lead) => {
    if (["Not Interested", "Lost"].includes(lead.status)) return "Rejected";
    if (["New"].includes(lead.status)) return "Pending";
    return "Active";
  };

  const statusBadgeClass = (status) => {
    if (status === "Rejected") return "border-red-200 bg-red-50 text-red-700";
    if (status === "Active") return "border-emerald-200 bg-emerald-50 text-emerald-700";
    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  const visibleLeads = leads.filter((lead) => {
    if (isTelecallerFlow) return !isCounsellorLead(lead) && !isFacultyLead(lead) && !lead.convertedStudent;
    if (isCounsellorFlow) return isCounsellorLead(lead) && !isFacultyLead(lead) && !lead.convertedStudent;
    if (isFacultyFlow) return isFacultyLead(lead) && admissionStatus(lead) !== "Done";
    if (isAdmissionsFlow) return admissionStatus(lead) === "Done";
    return true;
  });

  const sortedLeads = useMemo(() => {
    const filtered = isTelecallerFlow && leadStatusFilter
      ? visibleLeads.filter((lead) => telecallerLeadStatus(lead) === leadStatusFilter)
      : visibleLeads;
    const direction = sortDirection === "asc" ? 1 : -1;
    return [...filtered].sort((left, right) => {
      const leftValue = sortBy === "name"
        ? left.name || ""
        : sortBy === "course"
          ? courseName(left)
          : new Date(left.createdAt || left.leadDate || 0).getTime();
      const rightValue = sortBy === "name"
        ? right.name || ""
        : sortBy === "course"
          ? courseName(right)
          : new Date(right.createdAt || right.leadDate || 0).getTime();
      if (typeof leftValue === "number" && typeof rightValue === "number") return (leftValue - rightValue) * direction;
      return String(leftValue).localeCompare(String(rightValue), undefined, { sensitivity: "base" }) * direction;
    });
  }, [visibleLeads, isTelecallerFlow, leadStatusFilter, sortBy, sortDirection, courses]);

  const renderActions = (row) => {
    const actions = [];

    if ((canWorkTelecaller || canWorkCounsellor) && !row.convertedStudent) {
      actions.push(
        <button key="edit" onClick={() => openEditLead(row)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Edit lead">
          <Edit3 size={16} />
        </button>
      );
    }

    if (canWorkTelecaller && !row.counsellorAssigned && !row.convertedStudent) {
      actions.push(
        <button key="followup" onClick={() => openFollowUp(row)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-2 text-xs font-semibold text-[#ea580c] hover:bg-[#fff3e8]" title="Follow Up">
          <PhoneCall size={15} /> Follow Up
        </button>
      );
      actions.push(
        <button key="counsellor" onClick={() => forward(row)} className="rounded-md border border-slate-200 p-2 text-[#ea580c] hover:bg-[#fff3e8]" title="Forward to counsellor">
          <Send size={16} />
        </button>
      );
    }

    if (canWorkCounsellor && isCounsellorLead(row) && !isFacultyLead(row) && !row.convertedStudent) {
      actions.push(
        <button key="followup" onClick={() => openFollowUp(row)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-2 text-xs font-semibold text-[#ea580c] hover:bg-[#fff3e8]" title="Follow Up">
          <PhoneCall size={15} /> Follow Up
        </button>
      );
      actions.push(
        <div key="faculty" className="flex min-w-[220px] items-center gap-2">
          <select
            className="h-9 min-w-[150px] rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-[#f97316]"
            value={facultySelections[row._id] || facultyUsers[0]?._id || ""}
            onChange={(event) => setFacultySelections({ ...facultySelections, [row._id]: event.target.value })}
          >
            {!facultyUsers.length && <option value="">No faculty</option>}
            {facultyUsers.map((faculty) => (
              <option key={faculty._id} value={faculty._id}>{faculty.name}</option>
            ))}
          </select>
          <button onClick={() => forwardFaculty(row)} disabled={!facultyUsers.length} className="rounded-md border border-slate-200 p-2 text-[#ea580c] hover:bg-[#fff3e8] disabled:cursor-not-allowed disabled:opacity-50" title="Forward to faculty">
            <Send size={16} />
          </button>
        </div>
      );
    }

    if (canWorkFaculty && isFacultyLead(row) && admissionStatus(row) !== "Done") {
      actions.push(
        <button key="approve" onClick={() => approveAdmission(row)} className="rounded-md border border-slate-200 p-2 text-[#ea580c] hover:bg-[#fff3e8]" title="Approve admission">
          <UserCheck size={16} />
        </button>
      );
    }

    actions.push(
      <button key="details" onClick={() => openDetails(row)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Lead details">
        <Eye size={16} />
      </button>
    );

    return <div className="flex gap-2">{actions.length ? actions : <span className="text-slate-400">-</span>}</div>;
  };

  const pageTitle = isTelecallerFlow ? "Telecaller Dashboard" : isCounsellorFlow ? "Counsellor Dashboard" : isFacultyFlow ? "Faculty Dashboard" : isAdmissionsFlow ? "Admissions" : "Lead Forwarding & Admission Flow";
  const pageDescription = isTelecallerFlow
    ? "Generate leads with full details and forward qualified leads to counsellors."
    : isCounsellorFlow
      ? "Review telecaller leads and forward admission-ready leads to faculty."
      : isFacultyFlow
        ? "Review counsellor-forwarded leads, approve them, and complete admission."
        : isAdmissionsFlow
          ? "Admissions completed by faculty approval."
          : "Leads move step by step from telecaller to counsellor to faculty, then admission is completed.";

  const columns = [
    { key: "leadDate", label: "Date", render: (row) => formatDate(row.leadDate || row.createdAt) },
    { key: "name", label: "Name" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "courseInterested", label: "Course", render: (row) => courseName(row) },
    { key: "college", label: "College" },
    { key: "source", label: "Source" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status", render: (row) => isTelecallerFlow ? <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadgeClass(telecallerLeadStatus(row))}`}>{telecallerLeadStatus(row)}</span> : row.status },
    { key: "admissionStatus", label: "Admission", render: (row) => admissionStatus(row) },
    { key: "remarks", label: "Remarks" },
    { key: "counsellorAssigned", label: "Counsellor", render: (row) => row.counsellorAssigned || "-" },
    { key: "facultyAssigned", label: "Faculty", render: (row) => facultyHandoffs[row._id]?.facultyName || row.facultyAssigned || "-" },
    { key: "followUpDate", label: "Follow-up", render: (row) => (row.followUpDate ? new Date(row.followUpDate).toLocaleDateString() : "-") },
    {
      key: "actions",
      label: "Actions",
      render: renderActions
    }
  ];

  return (
    <div className="space-y-4">
      <section className="min-w-0 space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold">{pageTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{pageDescription}</p>
            </div>
            {canCreateLead && (
              <button onClick={() => { setForm(emptyLead); setCreateOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]">
                <Plus size={17} /> Create Lead
              </button>
            )}
          </div>
        </div>
        {message && <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{message}</p>}
        <EmployeeDashboardWidget compact />
        {isTelecallerFlow && (
          <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_1fr]">
            <label className="text-sm font-semibold text-slate-600">
              Sort by
              <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="course">Course</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-600">
              Order
              <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={sortDirection} onChange={(event) => setSortDirection(event.target.value)}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-slate-600">
              Lead status
              <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={leadStatusFilter} onChange={(event) => setLeadStatusFilter(event.target.value)}>
                <option value="">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>
          </section>
        )}
        <DataTable columns={columns} rows={sortedLeads} />
      </section>
      <CreateLeadModal open={createOpen} form={form} setForm={setForm} courses={courses} onSubmit={createLead} onClose={() => { setCreateOpen(false); setForm(emptyLead); }} isTelecallerFlow={isTelecallerFlow} />
      <CreateLeadModal open={editOpen} form={form} setForm={setForm} courses={courses} onSubmit={updateLead} onClose={() => { setEditOpen(false); setActiveLead(null); setForm(emptyLead); }} title="Edit Lead" submitLabel="Update Lead" />
      <FollowUpModal open={followUpOpen} lead={activeLead} form={followUpForm} setForm={setFollowUpForm} followUps={followUps} onSubmit={saveFollowUp} onClose={() => setFollowUpOpen(false)} />
      <LeadDetailsModal open={detailsOpen} lead={activeLead} courses={courses} followUps={followUps} onClose={() => setDetailsOpen(false)} />
    </div>
  );
}

export function CreateLeadModal({ open, form, setForm, courses = [], onSubmit, onClose, isTelecallerFlow = false, title, submitLabel = "Create Lead" }) {
  if (!open) return null;
  const courseOptions = [
    ...courses.map((course) => ({ value: course._id, label: course.name })),
    ...publicCourses.map((course) => ({ value: course.name, label: course.name }))
  ].filter((course, index, list) => course.label && list.findIndex((item) => item.label === course.label) === index);

  return (
    <ModalShell title={title || (isTelecallerFlow ? "Generate Lead" : "New Lead")} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-3">
        {["name", "mobile", "college", "source"].map((field) => (
          <input key={field} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" placeholder={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
        ))}
        <SearchableSelect
          options={courseOptions}
          value={form.courseInterested}
          onChange={(courseInterested) => setForm({ ...form, courseInterested })}
          placeholder="Select course..."
          searchPlaceholder="Search course..."
        />
        <input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={form.leadDate} onChange={(e) => setForm({ ...form, leadDate: e.target.value })} />
        <select className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option>Hot</option>
          <option>Warm</option>
          <option>Cold</option>
        </select>
        {form.status !== undefined && (
          <select className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {["New", "Assigned", "Contacted", "Interested", "Not Interested", "Follow-up", "Forwarded", "Forwarded to Counsellor", "Forwarded to Faculty", "Demo Scheduled", "Converted", "Lost"].map((status) => <option key={status}>{status}</option>)}
          </select>
        )}
        <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" placeholder="remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button>
          <button className="rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]">{submitLabel}</button>
        </div>
      </form>
    </ModalShell>
  );
}

function FollowUpModal({ open, lead, form, setForm, followUps, onSubmit, onClose }) {
  if (!open) return null;
  return (
    <ModalShell title={`Follow Up${lead?.name ? ` - ${lead.name}` : ""}`} onClose={onClose} wide>
      <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
        <Field label="Follow-up Date">
          <input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} required />
        </Field>
        <Field label="Next Follow-up Date">
          <input type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={form.nextFollowUpDate} onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })} />
        </Field>
        <Field label="Status">
          <select className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {followUpStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </Field>
        <Field label="Remarks" className="md:col-span-2">
          <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
        </Field>
        <div className="flex flex-col-reverse gap-2 md:col-span-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Cancel</button>
          <button className="rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]">Save Follow Up</button>
        </div>
      </form>
      <FollowUpHistory followUps={followUps} />
    </ModalShell>
  );
}

function LeadDetailsModal({ open, lead, courses = [], followUps, onClose }) {
  if (!open) return null;
  const courseName = lead?.courseName || courses.find((course) => course._id === idOf(lead?.courseInterested))?.name || (typeof lead?.courseInterested === "object" ? lead?.courseInterested?.name : lead?.courseInterested);
  return (
    <ModalShell title={`Lead Details${lead?.name ? ` - ${lead.name}` : ""}`} onClose={onClose} wide>
      <div className="grid gap-3 text-sm md:grid-cols-2">
        {[
          ["Name", lead?.name],
          ["Mobile", lead?.mobile],
          ["Email", lead?.email],
          ["Course", courseName],
          ["Date", formatDate(lead?.leadDate || lead?.createdAt)],
          ["College", lead?.college],
          ["Source", lead?.source],
          ["Priority", lead?.priority],
          ["Status", lead?.status],
          ["Remarks", lead?.remarks]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
            <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
            <p className="mt-1 font-semibold">{value || "-"}</p>
          </div>
        ))}
      </div>
      <FollowUpHistory followUps={followUps} />
    </ModalShell>
  );
}

function FollowUpHistory({ followUps }) {
  return (
    <section className="mt-5">
      <h3 className="font-bold">Follow-Up History</h3>
      <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Remarks</th>
              <th className="px-3 py-2">Created By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {followUps.map((item) => (
              <tr key={item._id}>
                <td className="px-3 py-2">{item.dueAt ? new Date(item.dueAt).toLocaleDateString() : "-"}</td>
                <td className="px-3 py-2 font-semibold">{item.status}</td>
                <td className="px-3 py-2">{item.remarks || "-"}</td>
                <td className="px-3 py-2">{item.createdBy?.name || "-"}</td>
              </tr>
            ))}
            {!followUps.length && (
              <tr>
                <td className="px-3 py-5 text-center text-slate-500" colSpan={4}>No follow-ups yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ModalShell({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-3">
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-lg bg-white shadow-soft ${wide ? "max-w-3xl" : "max-w-lg"}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
          <h2 className="text-lg font-black">{title}</h2>
          <button onClick={onClose} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-semibold text-slate-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
