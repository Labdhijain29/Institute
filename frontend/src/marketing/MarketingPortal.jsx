import React, { useEffect, useState } from "react";
import { ClipboardList, LayoutDashboard, ListChecks, LogOut, Menu, PhoneCall, UserRound, X } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import logoMark from "../assets/coding-wallah-mark-charcoal.png";
import { EmptyState, MetricCard, Panel, formatDate } from "../student/components/StudentUI.jsx";

const menu = [
  ["Dashboard", "/marketing/dashboard", LayoutDashboard], ["Leads", "/marketing/leads", PhoneCall],
  ["Follow-ups", "/marketing/follow-ups", ClipboardList], ["Tasks", "/marketing/tasks", ListChecks], ["Profile", "/marketing/profile", UserRound]
];
const leadStatuses = ["New", "Contacted", "Interested", "Follow-up", "Converted", "Not Interested"];
const taskStatuses = ["Pending", "In Progress", "Done", "Blocked"];
const go = (path, replace = false) => { window.history[replace ? "replaceState" : "pushState"]({}, "", path); window.dispatchEvent(new Event("popstate")); };

export function MarketingPortal({ path }) {
  const { user, logout } = useAuth(); const [open, setOpen] = useState(false);
  const active = menu.find((item) => item[1] === path) || menu[0];
  const signOut = () => { logout(); go("/login", true); };
  return <div className="min-h-screen bg-[#f8f5ef] text-[#111315] lg:grid lg:grid-cols-[270px_1fr]">
    {open && <button className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-30 w-[270px] border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5"><div className="flex items-center"><div className="grid h-10 w-14 place-items-center p-1"><img src={logoMark} className="h-full w-full object-contain" alt="Coding Wallah" /></div><div className="ml-3"><p className="text-sm font-bold">Coding Wallah</p><p className="text-xs text-slate-500">Marketing Workspace</p></div></div><button className="lg:hidden" onClick={() => setOpen(false)}><X size={18} /></button></div>
      <nav className="space-y-1 p-3">{menu.map(([label, itemPath, Icon]) => <button key={itemPath} onClick={() => { go(itemPath); setOpen(false); }} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium ${active[1] === itemPath ? "bg-[#f97316] text-white shadow-sm" : "text-slate-700 hover:bg-[#fff3e8] hover:text-[#c2410c]"}`}><Icon size={18} />{label}</button>)}<button onClick={signOut} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-[#fff3e8] hover:text-[#c2410c]"><LogOut size={18} />Logout</button></nav>
    </aside>
    <main className="min-w-0"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-6"><div className="flex items-center gap-3"><button className="rounded-md border border-slate-200 p-2 lg:hidden" onClick={() => setOpen(true)}><Menu size={18} /></button><div><h1 className="text-lg font-bold">{active[0]}</h1><p className="text-xs text-slate-500">Digital Marketing Executive</p></div></div><div className="text-right"><p className="text-sm font-semibold">{user.name}</p><p className="hidden text-xs text-slate-500 sm:block">{user.email}</p></div></header><div className="p-4 md:p-6"><MarketingPage path={active[1]} /></div></main>
  </div>;
}

function MarketingPage({ path }) {
  if (path === "/marketing/leads") return <MarketingLeads />;
  if (path === "/marketing/follow-ups") return <MarketingFollowUps />;
  if (path === "/marketing/tasks") return <MarketingTasks />;
  if (path === "/marketing/profile") return <MarketingProfile />;
  return <MarketingDashboard />;
}

function MarketingDashboard() {
  const [data, setData] = useState(null); const [error, setError] = useState("");
  useEffect(() => { api("/digital-marketing/me/dashboard").then(setData).catch((e) => setError(e.message)); }, []);
  if (error) return <Notice text={error} />; if (!data) return <Loading />;
  return <div className="space-y-5"><Panel><p className="text-sm font-semibold uppercase text-[#f97316]">Executive Dashboard</p><h2 className="mt-1 text-2xl font-bold">Digital Marketing Command Center</h2></Panel><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total Leads" value={data.totalLeads} /><MetricCard label="New Leads" value={data.newLeads} /><MetricCard label="Converted Leads" value={data.convertedLeads} /><MetricCard label="Pending Follow-ups" value={data.pendingFollowUps} /></div></div>;
}

function MarketingLeads() {
  const [items, setItems] = useState([]); const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [message, setMessage] = useState(""); const [followLead, setFollowLead] = useState(null); const [dueAt, setDueAt] = useState(""); const [notes, setNotes] = useState("");
  const load = () => api(`/digital-marketing/me/leads?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`).then((d) => setItems(d.items || []));
  useEffect(() => { load().catch((e) => setMessage(e.message)); }, [status]);
  const update = async (lead, nextStatus) => { try { await api(`/digital-marketing/me/leads/${lead._id}`, { method: "PATCH", body: JSON.stringify({ status: nextStatus, remarks: lead.remarks }) }); await load(); } catch (e) { setMessage(e.message); } };
  const schedule = async (event) => { event.preventDefault(); try { await api("/digital-marketing/me/follow-ups", { method: "POST", body: JSON.stringify({ lead: followLead._id, dueAt, notes }) }); setFollowLead(null); setDueAt(""); setNotes(""); setMessage("Follow-up scheduled"); await load(); } catch (e) { setMessage(e.message); } };
  return <div className="space-y-4"><Panel title="Leads"><div className="flex flex-col gap-2 sm:flex-row"><input className={inputClass} placeholder="Search leads" value={search} onChange={(e) => setSearch(e.target.value)} /><select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{leadStatuses.map((s) => <option key={s}>{s}</option>)}</select><button onClick={() => load().catch((e) => setMessage(e.message))} className={primaryClass}>Search</button></div></Panel>{message && <Notice text={message} />}<Table headers={["Lead Name", "Mobile", "Email", "Interested Course", "Source", "Status", "Assigned Date", "Action"]}>{items.map((lead) => <tr key={lead._id} className="border-b border-slate-100"><Cell strong>{lead.name}</Cell><Cell>{lead.mobile}</Cell><Cell>{lead.email}</Cell><Cell>{lead.courseInterested?.name || "-"}</Cell><Cell>{lead.source}</Cell><Cell><select className="rounded-md border border-slate-200 px-2 py-1" value={leadStatuses.includes(lead.status) ? lead.status : "New"} onChange={(e) => update(lead, e.target.value)}>{leadStatuses.map((s) => <option key={s}>{s}</option>)}</select></Cell><Cell>{formatDate(lead.digitalMarketingAssignedAt)}</Cell><Cell><button onClick={() => setFollowLead(lead)} className="text-xs font-semibold text-[#ea580c]">Follow-up</button></Cell></tr>)}</Table>{!items.length && <EmptyState>No assigned leads found.</EmptyState>}
    {followLead && <Modal title={`Follow-up · ${followLead.name}`} close={() => setFollowLead(null)}><form onSubmit={schedule} className="space-y-3"><label className="block text-sm font-semibold">Follow-up Date<input required type="datetime-local" className={inputClass} value={dueAt} onChange={(e) => setDueAt(e.target.value)} /></label><label className="block text-sm font-semibold">Notes<textarea className={`${inputClass} min-h-24`} value={notes} onChange={(e) => setNotes(e.target.value)} /></label><button className={primaryClass}>Save Follow-up</button></form></Modal>}
  </div>;
}

function MarketingFollowUps() {
  const [items, setItems] = useState([]); const [status, setStatus] = useState(""); const [message, setMessage] = useState("");
  const load = () => api(`/digital-marketing/me/follow-ups?status=${status}`).then((d) => setItems(d.items || [])); useEffect(() => { load().catch((e) => setMessage(e.message)); }, [status]);
  const update = async (id, next) => { try { await api(`/digital-marketing/me/follow-ups/${id}`, { method: "PATCH", body: JSON.stringify({ status: next }) }); await load(); } catch (e) { setMessage(e.message); } };
  return <div className="space-y-4"><Panel title="Follow-ups"><select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{["Pending", "Done", "Missed"].map((s) => <option key={s}>{s}</option>)}</select></Panel>{message && <Notice text={message} />}<Table headers={["Lead Name", "Follow-up Date", "Notes", "Status"]}>{items.map((item) => <tr key={item._id} className="border-b border-slate-100"><Cell strong>{item.lead?.name || "-"}</Cell><Cell>{formatDate(item.dueAt)}</Cell><Cell>{item.remarks}</Cell><Cell><select className="rounded-md border border-slate-200 px-2 py-1" value={item.status} onChange={(e) => update(item._id, e.target.value)}>{["Pending", "Done", "Missed"].map((s) => <option key={s}>{s}</option>)}</select></Cell></tr>)}</Table>{!items.length && <EmptyState>No follow-ups found.</EmptyState>}</div>;
}

function MarketingTasks() {
  const [items, setItems] = useState([]); const [message, setMessage] = useState(""); const load = () => api("/digital-marketing/me/tasks").then((d) => setItems(d.items || [])); useEffect(() => { load().catch((e) => setMessage(e.message)); }, []);
  const update = async (id, status) => { try { await api(`/digital-marketing/me/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); await load(); } catch (e) { setMessage(e.message); } };
  return <div className="space-y-4"><Panel title="Tasks"><p className="text-sm text-slate-500">Tasks assigned to you by Admin.</p></Panel>{message && <Notice text={message} />}<Table headers={["Task Name", "Description", "Due Date", "Status"]}>{items.map((item) => <tr key={item._id} className="border-b border-slate-100"><Cell strong>{item.title}</Cell><Cell>{item.description}</Cell><Cell>{formatDate(item.deadline)}</Cell><Cell><select className="rounded-md border border-slate-200 px-2 py-1" value={item.status} onChange={(e) => update(item._id, e.target.value)}>{taskStatuses.map((s) => <option key={s}>{s}</option>)}</select></Cell></tr>)}</Table>{!items.length && <EmptyState>No tasks assigned.</EmptyState>}</div>;
}

function MarketingProfile() {
  const { user } = useAuth(); const [form, setForm] = useState({ currentPassword: "", newPassword: "" }); const [message, setMessage] = useState("");
  const submit = async (e) => { e.preventDefault(); try { const d = await api("/digital-marketing/me/change-password", { method: "PATCH", body: JSON.stringify(form) }); setMessage(d.message); setForm({ currentPassword: "", newPassword: "" }); } catch (err) { setMessage(err.message); } };
  return <div className="grid gap-5 lg:grid-cols-2"><Panel title="Profile"><div className="grid h-24 w-24 place-items-center rounded-full bg-[#fff3e8] text-3xl font-bold text-[#f97316]">{user.name?.[0]}</div><div className="mt-5 space-y-2 text-sm"><p><span className="text-slate-500">Name:</span> <strong>{user.name}</strong></p><p><span className="text-slate-500">Email:</span> <strong>{user.email}</strong></p><p><span className="text-slate-500">Mobile:</span> <strong>{user.mobile || "-"}</strong></p></div></Panel><Panel title="Change Password"><form onSubmit={submit} className="space-y-3"><input required type="password" className={inputClass} placeholder="Current password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /><input required minLength="6" type="password" className={inputClass} placeholder="New password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />{message && <Notice text={message} />}<button className={primaryClass}>Change Password</button></form></Panel></div>;
}

const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#f97316]"; const primaryClass = "rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]";
function Loading() { return <p className="py-10 text-center text-sm text-slate-500">Loading...</p>; }
function Notice({ text }) { return <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm text-[#c2410c]">{text}</p>; }
function Table({ headers, children }) { return <div className="table-wrap rounded-lg border border-slate-200 bg-white"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{headers.map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>; }
function Cell({ children, strong }) { return <td className={`px-4 py-3 ${strong ? "font-semibold" : ""}`}>{children || "-"}</td>; }
function Modal({ title, close, children }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-lg rounded-lg bg-white p-5"><div className="mb-4 flex justify-between"><h2 className="font-bold">{title}</h2><button onClick={close}><X size={18} /></button></div>{children}</div></div>; }
