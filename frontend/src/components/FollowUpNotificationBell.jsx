import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check } from "lucide-react";
import { api } from "../api/client.js";

const formatReminderDate = (value) => new Date(value).toLocaleString("en-IN", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
});

export function FollowUpNotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const announcedIds = useRef(new Set());

  const loadReminders = useCallback(async () => {
    try {
      const data = await api("/followups");
      const reminders = data.items || [];
      setItems(reminders);
      const due = reminders.filter((item) => new Date(item.dueAt).getTime() <= Date.now() && !announcedIds.current.has(item._id));
      if (due.length) {
        due.forEach((item) => announcedIds.current.add(item._id));
        const message = due.length === 1
          ? `Follow-up due: ${due[0].lead?.name || "Lead"}`
          : `${due.length} follow-up reminders are due`;
        setToast(message);
        if ("Notification" in window && window.Notification.permission === "granted") {
          new window.Notification("Follow-up reminder", { body: message });
        }
      }
    } catch {
      // Reminders should never interrupt use of the rest of the dashboard.
    }
  }, []);

  useEffect(() => {
    loadReminders();
    const interval = window.setInterval(loadReminders, 30000);
    return () => window.clearInterval(interval);
  }, [loadReminders]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 5000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const toggle = async () => {
    if ("Notification" in window && window.Notification.permission === "default") {
      await window.Notification.requestPermission();
    }
    setOpen((value) => !value);
  };

  const markDone = async (id) => {
    try {
      await api(`/followups/${id}`, { method: "PUT", body: JSON.stringify({ status: "Completed" }) });
      setItems((current) => current.filter((item) => item._id !== id));
      setToast("Follow-up marked as completed");
    } catch (error) {
      setToast(error.message || "Unable to update follow-up");
    }
  };

  return (
    <div className="relative">
      <button onClick={toggle} className="relative rounded-md border border-slate-200 p-2 hover:border-[#f97316] hover:text-[#f97316]" aria-label={`${items.length} pending follow-up reminders`}>
        <Bell size={18} />
        {items.length > 0 && <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f97316] px-1 text-[10px] font-bold text-white">{items.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-bold">Follow-up reminders</div>
          <div className="max-h-96 overflow-y-auto">
            {!items.length && <p className="px-4 py-5 text-sm text-slate-500">No pending reminders.</p>}
            {items.map((item) => (
              <div key={item._id} className="border-b border-slate-100 px-4 py-3 last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.lead?.name || "Lead"}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatReminderDate(item.dueAt)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${item.status === "Overdue" ? "bg-red-100 text-red-700" : "bg-[#fff3e8] text-[#c2410c]"}`}>{item.status}</span>
                </div>
                {item.remarks && <p className="mt-2 text-xs text-slate-600">{item.remarks}</p>}
                <button onClick={() => markDone(item._id)} className="mt-3 inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#f97316] hover:text-[#c2410c]"><Check size={14} /> Mark as Done</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {toast && <div role="status" className="fixed bottom-4 right-4 z-50 rounded-md border border-[#f97316]/20 bg-white px-4 py-3 text-sm font-semibold text-[#c2410c] shadow-lg">{toast}</div>}
    </div>
  );
}
