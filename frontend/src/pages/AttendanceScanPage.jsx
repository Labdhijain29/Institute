import React, { useEffect, useState } from "react";
import { CheckCircle2, ScanLine } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";

export function AttendanceScanPage() {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || ["Student", "Parent"].includes(user.role)) return;
    setLoading(true);
    api("/attendance/today").then(setResult).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [user]);

  const scan = async () => {
    setLoading(true); setError("");
    try {
      const data = await api("/attendance/scan", { method: "POST", body: JSON.stringify({}) });
      setResult(data);
    } catch (requestError) { setError(requestError.message || "Unable to mark attendance"); }
    finally { setLoading(false); }
  };

  if (!user) { window.history.replaceState({}, "", "/login"); window.dispatchEvent(new Event("popstate")); return null; }
  if (["Student", "Parent"].includes(user.role)) return <div className="mx-auto mt-16 max-w-md rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">Employee attendance is not available for this account.</div>;
  const attendance = result?.attendance;
  return <main className="grid min-h-screen place-items-center bg-[#f8f5ef] p-4"><section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#fff3e8] text-[#c2410c]"><ScanLine size={28} /></span><h1 className="mt-4 text-2xl font-black">QR Attendance</h1><p className="mt-2 text-sm text-slate-500">Signed in as {user.name}. Your identity is securely taken from your CRM session.</p>{(result?.message || error) && <p className={`mt-5 rounded-md p-3 text-sm font-semibold ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{error || result.message}</p>}<button disabled={loading || result?.action === "completed"} onClick={scan} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Checking..." : <><CheckCircle2 size={18} /> {attendance?.loginTime && !attendance?.logoutTime ? "Scan to mark logout" : "Mark attendance"}</>}</button>{attendance && <div className="mt-5 grid grid-cols-2 gap-2 text-left text-sm"><p className="rounded bg-slate-50 p-3">Status<br /><strong>{result.status || attendance.status}</strong></p><p className="rounded bg-slate-50 p-3">Working<br /><strong>{attendance.totalWorkingMinutes ? `${Math.floor(attendance.totalWorkingMinutes / 60)}h ${attendance.totalWorkingMinutes % 60}m` : "In progress"}</strong></p></div>}</section></main>;
}
