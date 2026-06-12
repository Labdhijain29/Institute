import React from "react";
import { useEffect, useState } from "react";
import { Send, UserCheck } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext.jsx";
import { DataTable } from "../components/DataTable.jsx";

const emptyLead = {
  name: "",
  mobile: "",
  email: "",
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
  const [facultyUsers, setFacultyUsers] = useState([]);
  const [facultySelections, setFacultySelections] = useState({});
  const [facultyHandoffs, setFacultyHandoffs] = useState(() => readFacultyHandoffs());
  const [form, setForm] = useState(emptyLead);
  const [message, setMessage] = useState("");
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

  useEffect(() => {
    const load = () => api("/leads").then((data) => setLeads(data.items || []));
    load().catch((err) => setMessage(err.message));
  }, [workflowRole]);

  useEffect(() => {
    if (!isCounsellorFlow) return;
    api("/leads/faculty-options")
      .then((data) => setFacultyUsers(data.items?.length ? data.items : dummyFacultyUsers))
      .catch(() => setFacultyUsers(dummyFacultyUsers));
  }, [isCounsellorFlow]);

  const createLead = async (event) => {
    event.preventDefault();
    await api("/leads", { method: "POST", body: JSON.stringify(form) });
    setForm(emptyLead);
    setMessage("Lead created");
    const data = await api("/leads");
    setLeads(data.items || []);
  };

  const forward = async (lead) => {
    try {
      await api(`/leads/${lead._id}/forward`, { method: "POST", body: JSON.stringify({ remarks: "Forwarded for counselling" }) });
      setMessage("Lead forwarded to counsellor");
      const data = await api("/leads");
      setLeads(data.items || []);
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
      const data = await api("/leads");
      setLeads(data.items || []);
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
      const data = await api("/leads");
      setLeads(data.items || []);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const isCounsellorLead = (lead) => ["Forwarded", "Forwarded to Counsellor"].includes(lead.status) || Boolean(lead.counsellorAssigned);
  const isFacultyLead = (lead) => lead.status === "Forwarded to Faculty" || Boolean(lead.facultyAssigned) || Boolean(facultyHandoffs[lead._id]);
  const admissionStatus = (lead) => lead.admissionStatus || facultyHandoffs[lead._id]?.status || (lead.convertedStudent || lead.status === "Admission Done" || lead.status === "Converted" ? "Done" : "Pending");

  const visibleLeads = leads.filter((lead) => {
    if (isTelecallerFlow) return !isCounsellorLead(lead) && !isFacultyLead(lead) && !lead.convertedStudent;
    if (isCounsellorFlow) return isCounsellorLead(lead) && !isFacultyLead(lead) && !lead.convertedStudent;
    if (isFacultyFlow) return isFacultyLead(lead) && admissionStatus(lead) !== "Done";
    if (isAdmissionsFlow) return admissionStatus(lead) === "Done";
    return true;
  });

  const renderActions = (row) => {
    const actions = [];

    if (canWorkTelecaller && !row.counsellorAssigned && !row.convertedStudent) {
      actions.push(
        <button key="counsellor" onClick={() => forward(row)} className="rounded-md border border-slate-200 p-2 text-pine hover:bg-pine/10" title="Forward to counsellor">
          <Send size={16} />
        </button>
      );
    }

    if (canWorkCounsellor && isCounsellorLead(row) && !isFacultyLead(row) && !row.convertedStudent) {
      actions.push(
        <div key="faculty" className="flex min-w-[220px] items-center gap-2">
          <select
            className="h-9 min-w-[150px] rounded-md border border-slate-300 px-2 text-sm outline-none focus:border-pine"
            value={facultySelections[row._id] || facultyUsers[0]?._id || ""}
            onChange={(event) => setFacultySelections({ ...facultySelections, [row._id]: event.target.value })}
          >
            {!facultyUsers.length && <option value="">No faculty</option>}
            {facultyUsers.map((faculty) => (
              <option key={faculty._id} value={faculty._id}>{faculty.name}</option>
            ))}
          </select>
          <button onClick={() => forwardFaculty(row)} disabled={!facultyUsers.length} className="rounded-md border border-slate-200 p-2 text-pine hover:bg-pine/10 disabled:cursor-not-allowed disabled:opacity-50" title="Forward to faculty">
            <Send size={16} />
          </button>
        </div>
      );
    }

    if (canWorkFaculty && isFacultyLead(row) && admissionStatus(row) !== "Done") {
      actions.push(
        <button key="approve" onClick={() => approveAdmission(row)} className="rounded-md border border-slate-200 p-2 text-coral hover:bg-coral/10" title="Approve admission">
          <UserCheck size={16} />
        </button>
      );
    }

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
    { key: "name", label: "Name" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "source", label: "Source" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
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
    <div className={`grid gap-5 ${canCreateLead ? "xl:grid-cols-[360px_1fr]" : ""}`}>
      {(canCreateLead || message) && (
        <aside className="space-y-4">
          {canCreateLead && (
            <form onSubmit={createLead} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">{isTelecallerFlow ? "Generate Lead" : "New Lead"}</h2>
              <div className="mt-4 space-y-3">
                {["name", "mobile", "email", "source"].map((field) => (
                  <input key={field} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-pine" placeholder={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
                ))}
                <select className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-pine" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option>Hot</option>
                  <option>Warm</option>
                  <option>Cold</option>
                </select>
                <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-pine" placeholder="remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
                <button className="w-full rounded-md bg-ink px-4 py-2.5 font-semibold text-white hover:bg-pine">Create Lead</button>
              </div>
            </form>
          )}
          {message && <p className="rounded-md bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">{message}</p>}
        </aside>
      )}
      <section className="min-w-0 space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">{pageTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{pageDescription}</p>
        </div>
        <DataTable columns={columns} rows={visibleLeads} />
      </section>
    </div>
  );
}
