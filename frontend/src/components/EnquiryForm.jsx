import React, { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { publicApi } from "../api/client.js";

const fallbackCourses = ["MERN Stack Development", "Java Full Stack", "Python Full Stack", "Data Science", "Data Analytics", "Machine Learning", "Artificial Intelligence", "React.js", "Node.js", "Java Backend", "UI/UX Design", "Motion Graphics", "Digital Marketing", "Other"];
const initialForm = { fullName: "", mobile: "", email: "", city: "", state: "", college: "", qualification: "", currentYear: "", course: "", learningMode: "", preferredTime: "", message: "", howHeard: "" };
const inputClass = "mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-[#111315] outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/15 dark:border-white/10 dark:bg-white/5 dark:text-white";

function EnquiryField({ label, required, children, wide }) {
  return <label className={`text-sm font-bold ${wide ? "md:col-span-2" : ""}`}>{label}{required && <span className="text-red-600"> *</span>}{children}</label>;
}

export function EnquiryForm({ courses = [], className = "" }) {
  const options = [...new Set([...courses.map((course) => course.name || course), ...fallbackCourses])];
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true); setSuccess(""); setError("");
    try {
      await publicApi("/public/enquiries", { method: "POST", body: JSON.stringify(form) });
      setForm(initialForm);
      setSuccess("Thank you for contacting us. Our team will contact you shortly.");
    } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  }

  return <form onSubmit={submit} className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-7 ${className}`}>
    <div className="grid gap-4 md:grid-cols-2">
      <EnquiryField label="Full Name" required><input required minLength={2} className={inputClass} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} /></EnquiryField>
      <EnquiryField label="Mobile Number" required><input required type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" maxLength={10} title="Enter a valid 10-digit Indian mobile number" className={inputClass} value={form.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} /></EnquiryField>
      <EnquiryField label="Email Address"><input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} /></EnquiryField>
      <EnquiryField label="City" required><input required className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} /></EnquiryField>
      <EnquiryField label="State"><input className={inputClass} value={form.state} onChange={(e) => set("state", e.target.value)} /></EnquiryField>
      <EnquiryField label="College / School Name" required><input required className={inputClass} value={form.college} onChange={(e) => set("college", e.target.value)} /></EnquiryField>
      <EnquiryField label="Qualification" required><input required className={inputClass} value={form.qualification} onChange={(e) => set("qualification", e.target.value)} /></EnquiryField>
      <EnquiryField label="Current Year / Semester"><input className={inputClass} value={form.currentYear} onChange={(e) => set("currentYear", e.target.value)} /></EnquiryField>
      <EnquiryField label="Course Interested In" required><select required className={inputClass} value={form.course} onChange={(e) => set("course", e.target.value)}><option value="">Select course</option>{options.map((item) => <option key={item}>{item}</option>)}</select></EnquiryField>
      <EnquiryField label="Preferred Learning Mode" required><select required className={inputClass} value={form.learningMode} onChange={(e) => set("learningMode", e.target.value)}><option value="">Select mode</option>{["Online", "Offline", "Hybrid"].map((item) => <option key={item}>{item}</option>)}</select></EnquiryField>
      <EnquiryField label="Preferred Time"><select className={inputClass} value={form.preferredTime} onChange={(e) => set("preferredTime", e.target.value)}><option value="">Select time</option>{["Morning", "Afternoon", "Evening", "Weekend"].map((item) => <option key={item}>{item}</option>)}</select></EnquiryField>
      <EnquiryField label="How did you hear about us?"><select className={inputClass} value={form.howHeard} onChange={(e) => set("howHeard", e.target.value)}><option value="">Select source</option>{["Google", "Instagram", "Facebook", "LinkedIn", "WhatsApp", "Friend", "College", "Seminar", "Advertisement", "Other"].map((item) => <option key={item}>{item}</option>)}</select></EnquiryField>
      <EnquiryField label="Message / Query" wide><textarea rows={4} className={inputClass} value={form.message} onChange={(e) => set("message", e.target.value)} /></EnquiryField>
    </div>
    {success && <p role="status" className="mt-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} />{success}</p>}
    {error && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
    <button disabled={submitting} className="mt-5 inline-flex h-12 items-center gap-2 rounded-md bg-[#f97316] px-5 text-sm font-bold text-white hover:bg-[#111315] disabled:cursor-not-allowed disabled:opacity-60"><Send size={17} />{submitting ? "Submitting..." : "Submit Enquiry"}</button>
  </form>;
}
