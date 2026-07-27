import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Clock3, Code2, Database, Globe2, Headphones, HelpCircle, Layers3, Mail, MapPin, Palette, Phone, Rocket, Search, Send, Server, ShieldCheck, ShoppingCart, Smartphone, Star, Users, X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Marquee from "react-fast-marquee";
import { api, publicApi } from "../api/client.js";
import { navigateTo, Footer } from "../components/PublicLayout.jsx";
import { courses as staticCourses, partners, services, stats, testimonials, trainers, trustMilestones, values, whyChoose } from "../data/publicContent.js";
import { EnquiryForm } from "../components/EnquiryForm.jsx";
import { courseSlug } from "../data/courseDetails.js";

const sectionClass = "mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8";
const inputClass = "h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/15 dark:border-white/10 dark:bg-white/5 dark:text-white";

function normalizePublicCourse(course, index) {
  const fallback = staticCourses[index % staticCourses.length] || staticCourses[0];
  return {
    ...fallback,
    name: course.name || fallback.name,
    level: course.level || fallback.level || "Beginner",
    duration: course.duration || fallback.duration,
    fees: course.fees !== undefined ? `Rs. ${Number(course.fees || 0).toLocaleString("en-IN")}` : fallback.fees,
    image: course.image || fallback.image,
    skills: course.skills?.length ? course.skills : course.modules?.length ? course.modules : course.technologies?.length ? course.technologies : fallback.skills,
    overview: course.description || course.overview || fallback.overview,
    syllabus: course.syllabus || fallback.syllabus || "Contact admissions for the detailed syllabus.",
    careers: course.careers || fallback.careers || "Career guidance is shared during counselling."
  };
}

function usePublicCourses() {
  const [items, setItems] = useState(staticCourses);

  useEffect(() => {
    let active = true;
    const loadCourses = async () => {
      try {
        return await publicApi("/public/courses");
      } catch {
        return api("/courses?limit=100");
      }
    };

    loadCourses()
      .then((data) => {
        if (!active) return;
        const fetchedCourses = (data.items || []).map(normalizePublicCourse);
        // const coursesByName = new Map(staticCourses.map((course) => [course.name, course]));
        fetchedCourses.forEach((course) => coursesByName.set(course.name, course));
        setItems([...coursesByName.values()]);
      })
      .catch(() => {
        if (active) setItems(staticCourses);
      });
    return () => { active = false; };
  }, []);

  return items;
}

const itCourseKeywords = [
  "full stack",
  "java",
  "python",
  "mern",
  "mean",
  "data",
  "ai",
  "ml",
  "cloud",
  "aws",
  "devops",
  "cyber",
  "ios",
  "android",
  "flutter",
  "networking"
];

function isITCourse(course) {
  const text = [course.name, course.overview, course.syllabus, ...(course.skills || [])].join(" ").toLowerCase();
  return itCourseKeywords.some((keyword) => text.includes(keyword));
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f97316] sm:text-sm">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl md:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{text}</p>}
    </div>
  );
}

function PrimaryButton({ children, to = "/courses" }) {
  return (
    <button onClick={() => navigateTo(to)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#f97316] px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.22)] transition hover:bg-[#111315] sm:w-auto">
      {children}
      <ArrowRight size={17} />
    </button>
  );
}

function SecondaryButton({ children, to = "/login" }) {
  return (
    <button onClick={() => navigateTo(to)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-bold text-[#111315] shadow-sm transition hover:border-[#f97316] hover:text-[#c2410c] dark:border-white/15 dark:bg-white/5 dark:text-white sm:w-auto">
      {children}
    </button>
  );
}

function CourseCard({ course, onLearnMore, onCounsellor, onBuyNow, showFees = true }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
      <img src={course.image} alt={`${course.name} course`} className="h-44 w-full object-cover" loading="lazy" />
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-black">{course.name}</h3>
          <span className="rounded-md bg-[#fff3e8] px-2.5 py-1 text-xs font-bold text-[#c2410c] dark:bg-[#f97316]/15 dark:text-[#fdba74]">{course.level}</span>
        </div>
        <div className={`mt-4 grid gap-3 text-sm ${showFees ? "grid-cols-2" : "grid-cols-1"}`}>
          <p className="rounded-md bg-slate-50 p-3 dark:bg-white/5">
            <span className="block text-xs text-slate-500 dark:text-slate-400">Duration</span>
            <span className="font-bold">{course.duration}</span>
          </p>
          {showFees && (
            <p className="rounded-md bg-slate-50 p-3 dark:bg-white/5">
              <span className="block text-xs text-slate-500 dark:text-slate-400">Fees</span>
              <span className="font-bold">{course.fees}</span>
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {course.skills.map((skill) => (
            <span key={skill} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
              {skill}
            </span>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button onClick={() => (onLearnMore ? onLearnMore(course) : navigateTo("/contact"))} className="inline-flex items-center gap-2 text-sm font-bold text-[#ea580c] transition hover:text-[#111315] dark:text-[#fdba74]">
            Learn More
            <ChevronRight size={16} />
          </button>
          {onCounsellor && (
            <button onClick={() => onCounsellor(course)} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#f97316] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#111315] dark:hover:bg-white/10">
              Counsellor
              <Send size={15} />
            </button>
          )}
          {onBuyNow && (
            <button onClick={() => onBuyNow(course)} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#111315] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#f97316] dark:bg-white dark:text-[#111315] dark:hover:bg-[#fdba74]">
              <ShoppingCart size={15} />
              Buy Now
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function CourseDetailsModal({ course, onClose }) {
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 px-4 py-6 backdrop-blur-sm">
      <article className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-[#12181c]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f97316]">{course.level} Course</p>
            <h2 className="mt-2 text-2xl font-black">{course.name}</h2>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-500 hover:border-[#f97316] hover:text-[#f97316] dark:border-white/10 dark:text-slate-300">
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-[0.9fr_1.1fr]">
          <img src={course.image} alt={`${course.name} course`} className="h-48 w-full rounded-md object-cover sm:h-56 md:h-full" />
          <div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{course.overview}</p>
            <div className="mt-4 grid gap-3 text-sm">
              <p className="rounded-md bg-slate-50 p-3 dark:bg-white/5">
                <span className="block text-xs text-slate-500 dark:text-slate-400">Duration</span>
                <span className="font-bold">{course.duration}</span>
              </p>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6">
              <p><strong>Syllabus:</strong> {course.syllabus}</p>
              <p><strong>Career opportunities:</strong> {course.careers}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {course.skills.map((skill) => (
                <span key={skill} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function CounsellorLeadModal({ course, courseOptions, onClose }) {
  const [form, setForm] = useState({ fullName: "", mobile: "", course: course?.name || "", message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  if (!course) return null;

  const submit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    try {
      await publicApi("/public/enquiries", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          mobile: form.mobile,
          course: form.course,
          message: form.message,
          sendToCounsellor: true
        })
      });
      setStatus("Submitted. A counsellor will contact you shortly.");
      setForm({ fullName: "", mobile: "", course: course.name, message: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 px-4 py-6 backdrop-blur-sm">
      <article className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-[#12181c]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f97316]">Counsellor Enquiry</p>
            <h2 className="mt-2 text-2xl font-black">{course.name}</h2>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-500 hover:border-[#f97316] hover:text-[#f97316] dark:border-white/10 dark:text-slate-300">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <label className="block text-sm font-bold">
            Name
            <input required className={`${inputClass} mt-2`} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          </label>
          <label className="block text-sm font-bold">
            Contact No.
            <input required inputMode="numeric" className={`${inputClass} mt-2`} value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
          </label>
          <label className="block text-sm font-bold">
            Course Interested In
            <select className={`${inputClass} mt-2`} value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })}>
              {(courseOptions || staticCourses).map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Message
            <textarea rows="3" className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-ink outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/15 dark:border-white/10 dark:bg-white/5 dark:text-white" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          </label>
          {status && <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{status}</p>}
          {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold">
              Cancel
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-bold text-white hover:bg-[#111315]">
              <Send size={16} />
              Submit
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}

function CoursePurchaseModal({ course, courseOptions, onClose }) {
  const [form, setForm] = useState({ fullName: "", mobile: "", email: "", course: course?.name || "", paymentMode: "Online Payment", message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (course?.name) setForm((current) => ({ ...current, course: course.name }));
  }, [course?.name]);

  if (!course) return null;

  const submit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    try {
      await publicApi("/public/enquiries", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          mobile: form.mobile,
          email: form.email,
          course: form.course,
          sendToCounsellor: true,
          message: [
            "Purchase request from Buy Now button.",
            `Preferred payment mode: ${form.paymentMode}`,
            form.message ? `Student note: ${form.message}` : ""
          ].filter(Boolean).join("\n")
        })
      });
      setStatus("Purchase request submitted. Our counsellor will contact you to complete enrollment and payment.");
      setForm({ fullName: "", mobile: "", email: "", course: course.name, paymentMode: "Online Payment", message: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 px-4 py-6 backdrop-blur-sm">
      <article className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-white/10 dark:bg-[#12181c]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f97316]">Buy Course</p>
            <h2 className="mt-2 text-2xl font-black">{course.name}</h2>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-500 hover:border-[#f97316] hover:text-[#f97316] dark:border-white/10 dark:text-slate-300">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <label className="block text-sm font-bold">
            Student Name
            <input required className={`${inputClass} mt-2`} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold">
              Contact No.
              <input required inputMode="numeric" className={`${inputClass} mt-2`} value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
            </label>
            <label className="block text-sm font-bold">
              Email
              <input type="email" className={`${inputClass} mt-2`} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
          </div>
          <label className="block text-sm font-bold">
            Course
            <select className={`${inputClass} mt-2`} value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })}>
              {(courseOptions || staticCourses).map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Payment Preference
            <select className={`${inputClass} mt-2`} value={form.paymentMode} onChange={(event) => setForm({ ...form, paymentMode: event.target.value })}>
              {["Online Payment", "UPI", "Card", "Bank Transfer", "Cash"].map((mode) => (
                <option key={mode}>{mode}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Note
            <textarea rows="3" className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-ink outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/15 dark:border-white/10 dark:bg-white/5 dark:text-white" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
          </label>
          {status && <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{status}</p>}
          {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm font-bold">
              Cancel
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-bold text-white hover:bg-[#111315]">
              <ShoppingCart size={16} />
              Submit Purchase
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}

function CTA() {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#fdba74]">Admissions Open</p>
          <h2 className="mt-3 text-3xl font-black">Start your coding career with guided mentorship.</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton to="/contact">Join Now</PrimaryButton>
          <SecondaryButton to="/login">Login</SecondaryButton>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  const publicCourses = usePublicCourses();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const autoplay = useRef(Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [testimonialViewportRef, testimonialApi] = useEmblaCarousel({ align: "center", loop: true, skipSnaps: false }, [autoplay.current]);

  useEffect(() => {
    if (!testimonialApi) return undefined;
    const updateSelectedTestimonial = () => setTestimonialIndex(testimonialApi.selectedScrollSnap());
    updateSelectedTestimonial();
    testimonialApi.on("select", updateSelectedTestimonial);
    testimonialApi.on("reInit", updateSelectedTestimonial);
    return () => {
      testimonialApi.off("select", updateSelectedTestimonial);
      testimonialApi.off("reInit", updateSelectedTestimonial);
    };
  }, [testimonialApi]);

  const showPreviousTestimonial = () => testimonialApi?.scrollPrev();
  const showNextTestimonial = () => testimonialApi?.scrollNext();

  return (
    <>
      <main>
        <section className="relative overflow-hidden bg-[#07090c] text-white lg:h-[calc(100vh-76px)]">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.22),transparent_30%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.16),transparent_28%),linear-gradient(180deg,#06070a_0%,#0b0f14_55%,#06070a_100%)]" />
  <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:72px_72px]" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_55%,rgba(0,0,0,0.65)_100%)]" />

  <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-[#f97316]/20 blur-3xl animate-pulse" />
  <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" />
  <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#f97316]/10 blur-3xl animate-pulse" />

  <div className="relative mx-auto flex max-w-7xl items-center px-4 py-14 sm:px-6 lg:h-full lg:px-8 lg:py-6">
    <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-8">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-[#fdba74] backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-[#f97316] shadow-[0_0_18px_rgba(249,115,22,0.8)]" />
          🚀 India&apos;s Career-Focused Tech Learning Platform
        </div>

        <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
          <span className="block text-white">Learn.</span>
          <span className="block bg-gradient-to-r from-[#fff7ed] via-[#f97316] to-[#fdba74] bg-clip-text text-transparent">
            Code.
          </span>
          <span className="block text-white">Build. Succeed.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg lg:mt-4">
          Master Java, Python, MERN Stack, Data Analytics, Data Science, and AI/ML with live classes, real-world projects, expert mentorship, and placement support.
        </p>

        <div className="mt-7 flex flex-wrap gap-3 lg:mt-5">
          <PrimaryButton to="/courses">Explore Courses</PrimaryButton>
          <button
            onClick={() => setEnquiryOpen(true)}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-xl transition duration-300 hover:scale-[1.03] hover:border-[#f97316]/40 hover:bg-[#f97316] hover:shadow-[0_0_30px_rgba(249,115,22,0.35)]"
          >
            <Send size={17} /> Book Free Demo
          </button>
        </div>

        <div className="mt-7 flex flex-wrap gap-3 text-sm text-slate-200 lg:mt-5">
          {['Live Classes', 'Real Projects', 'Certifications', 'Placement Support'].map((item) => (
            <div
              key={item}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
            >
              ✓ {item}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:mt-6">
          {stats.map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl lg:p-4"
            >
              <p className="text-3xl font-black text-[#f97316]">{value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-300">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-[#f97316]/20 via-white/5 to-cyan-400/10 blur-2xl" />
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="rounded-[1.6rem] border border-white/10 bg-[#0b1016]/90 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <span className="h-3 w-3 rounded-full bg-green-400/80" />
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                Live Coding Dashboard
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(249,115,22,0.18),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_30%)]" />
                <div className="relative">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#fdba74]">Coding Walla</p>
                  <div className="mt-3 space-y-2 font-mono text-sm text-slate-200">
                    <div><span className="text-[#f97316]">const</span> skill = <span className="text-cyan-300">'career'</span>;</div>
                    <div><span className="text-[#f97316]">function</span> <span className="text-white">buildFuture</span>() {'{'}</div>
                    <div className="pl-4">return <span className="text-[#fdba74]">'From learning to earning'</span>;</div>
                    <div>{'}'}</div>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <div className="rounded-xl bg-white/8 px-3 py-2 text-xs text-slate-200">Java</div>
                    <div className="rounded-xl bg-white/8 px-3 py-2 text-xs text-slate-200">Python</div>
                    <div className="rounded-xl bg-white/8 px-3 py-2 text-xs text-slate-200">MERN</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Analytics</p>
                  <div className="mt-4 h-28 rounded-xl bg-[linear-gradient(135deg,rgba(249,115,22,0.22),rgba(255,255,255,0.06))]" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">AI/ML</p>
                  <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0f141b] py-8 text-sm text-slate-300">
                    Intelligent learning paths
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {['Python', 'Java', 'React', 'JavaScript', 'SQL', 'Power BI'].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute -left-4 top-10 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-semibold text-white shadow-lg backdrop-blur-xl animate-bounce">
          95% Placement
        </div>
        <div className="absolute -right-2 bottom-10 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-semibold text-white shadow-lg backdrop-blur-xl animate-bounce">
          200+ Projects
        </div>
      </div>
    </div>
  </div>
</section>

        <section className={sectionClass}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-3xl font-black text-[#f97316]">{value}</p>
                <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-[#12181c]">
          <div className={sectionClass}>
            <SectionHeader eyebrow="Why Choose Us" title="A training experience built for outcomes." text="Live classes, real reviews, and operational clarity help students move from curiosity to career readiness." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {whyChoose.map(([title, text, Icon]) => (
                <div key={title} className="rounded-lg border border-slate-200 p-5 dark:border-white/10">
                  <Icon className="text-[#f97316]" size={26} />
                  <h3 className="mt-4 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-[#fcfaf8] py-4 dark:bg-[#12181c]">
          <div className={sectionClass}>
            <div className="mx-auto max-w-3xl text-center">
              <SectionHeader eyebrow="Testimonials" title="Students trust the process because it stays practical." text="Real learner stories from classrooms, projects, and career journeys." />
            </div>
            <div className="relative mt-7 sm:mt-10">
              <button onClick={showPreviousTestimonial} className="absolute left-0 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-md transition hover:border-[#f97316] hover:text-[#f97316] dark:border-white/10 dark:bg-[#1b2229] dark:text-white sm:left-4 lg:left-8" aria-label="Show previous testimonial"><ChevronLeft size={20} /></button>
              <button onClick={showNextTestimonial} className="absolute right-0 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-md transition hover:border-[#f97316] hover:text-[#f97316] dark:border-white/10 dark:bg-[#1b2229] dark:text-white sm:right-4 lg:right-8" aria-label="Show next testimonial"><ChevronRight size={20} /></button>
              <div className="overflow-hidden py-8" ref={testimonialViewportRef}>
                <div className="flex touch-pan-y">
                  {testimonials.map((item, index) => {
                    const active = index === testimonialIndex;
                    return <div key={item.name} className="min-w-0 shrink-0 basis-[82%] px-3 sm:basis-[46%] sm:px-4 lg:basis-1/3 lg:px-5">
                      <article className={`min-h-[272px] rounded-3xl border bg-white p-6 shadow-sm transition-all duration-500 ease-out dark:bg-[#171e24] sm:p-7 ${active ? "relative z-10 scale-105 border-[#f97316] opacity-100 shadow-[0_22px_55px_rgba(234,88,12,0.22)] lg:scale-110" : "scale-[0.85] border-slate-200 opacity-50 shadow-none dark:border-white/10"}`}>
                        <span className="text-4xl font-black leading-none text-[#f97316]/35">“</span>
                        <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">{item.feedback}</p>
                        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-white/10">
                          <img src={item.image} alt={item.name} className={`rounded-full object-cover ring-2 ring-[#f97316]/25 transition-all duration-500 ${active ? "h-16 w-16" : "h-11 w-11"}`} loading="lazy" />
                          <div><h3 className="font-black text-slate-950 dark:text-white">{item.name}</h3><p className="mt-0.5 text-sm font-semibold text-[#ea580c]">{item.course}</p></div>
                        </div>
                      </article>
                    </div>;
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-2" aria-label="Testimonial slide navigation">
              {testimonials.map((item, index) => <button key={item.name} onClick={() => testimonialApi?.scrollTo(index)} className={`h-2 rounded-full transition-all ${testimonialIndex === index ? "w-7 bg-[#f97316]" : "w-2 bg-slate-300 dark:bg-white/30"}`} aria-label={`Show testimonial from ${item.name}`} />)}
            </div>
            <div className="mt-16 border-t border-slate-200 pt-12 dark:border-white/10">
              <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-[#f97316]">Our Hiring Partners</p>
              <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-500 dark:text-slate-300">Our learners prepare for opportunities across trusted global and Indian technology companies.</p>
              <div className="mt-8 space-y-4">
                {[partners.slice(0, Math.ceil(partners.length / 2)), partners.slice(Math.ceil(partners.length / 2))].map((partnerRow, rowIndex) => <Marquee key={rowIndex} direction={rowIndex === 0 ? "left" : "right"} speed={34} gradient gradientColor="rgb(252, 250, 248)" gradientWidth={72} pauseOnHover>
                  {partnerRow.map((partner) => <div key={`${partner.name}-${rowIndex}`} className="group mx-2 flex h-24 w-44 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10">
                    {partner.logoText ? <span className="text-3xl font-black tracking-wide text-[#6f2cff]">{partner.logoText}</span> : <img src={partner.logo} alt="" title={partner.name} className="max-h-10 max-w-32 object-contain" loading="lazy" onError={(event) => { if (event.currentTarget.src !== partner.fallbackLogo) event.currentTarget.src = partner.fallbackLogo; }} />}
                    <span className="text-xs font-bold text-slate-500">{partner.name}</span>
                  </div>)}
                </Marquee>)}
              </div>
            </div>
          </div>
        </section>
      </main>
      <CTA />
      <Footer />
      {enquiryOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-[#111315]/70 p-3" role="dialog" aria-modal="true" aria-labelledby="enquiry-modal-title">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-[#f8f5ef] shadow-2xl dark:bg-[#0f1011]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#111315]">
              <div><h2 id="enquiry-modal-title" className="text-lg font-black">Submit an Enquiry</h2><p className="text-sm text-slate-500 dark:text-slate-300">Tell us what you would like to learn.</p></div>
              <button onClick={() => setEnquiryOpen(false)} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/10" aria-label="Close enquiry form"><X size={18} /></button>
            </div>
            <EnquiryForm courses={publicCourses} className="border-0 shadow-none" />
          </div>
        </div>
      )}
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <main>
        <section className={sectionClass}>
          <SectionHeader eyebrow="About Coding Walla" title="A modern Coding Walla with a management backbone." text="We combine classroom training, project mentorship, admissions workflows, fee tracking, and role-based dashboards so learning and operations stay connected." />
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              ["Institute Story", "Coding Walla was created for students who want structured technical learning without losing the practical rhythm of real software teams."],
              ["Mission", "To help learners build job-ready coding skills through live teaching, disciplined practice, and transparent progress tracking."],
              ["Vision", "To become a trusted training partner for students, companies, and institutions seeking dependable digital talent."]
            ].map(([title, text]) => (
              <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
                <h2 className="text-xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-[#12181c]">
          <div className={sectionClass}>
            <SectionHeader eyebrow="Core Values" title="The principles behind every batch." />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {values.map(([title, text, Icon]) => (
                <div key={title} className="rounded-lg border border-slate-200 p-5 dark:border-white/10">
                  <Icon className="text-[#f97316]" size={26} />
                  <h3 className="mt-4 font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHeader eyebrow="Our Industry Trainers" title="Mentors with classroom clarity and industry depth." />
          <div className="grid gap-5 md:grid-cols-3">
            {trainers.map((trainer) => (
              <article key={trainer.name} className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
                <div className="mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-full border-4 border-[#ffe4d2] bg-slate-100 shadow-sm dark:border-[#f97316]/20 dark:bg-white/10">
                  <img src={trainer.image} alt={trainer.name} className="h-full w-full object-cover object-top" loading="lazy" />
                </div>
                <h3 className="mt-6 text-lg font-black">{trainer.name}</h3>
                <p className="mt-3 inline-flex rounded-md bg-[#fff3e8] px-3 py-1 text-sm font-bold text-[#c2410c] dark:bg-[#f97316]/15 dark:text-[#fdba74]">{trainer.expertise}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{trainer.experience} experience</p>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{trainer.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustMilestones.map(([value, label, Icon]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                <Icon className="text-[#f97316]" size={24} />
                <p className="mt-4 text-3xl font-black">{value}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function CoursesPage() {
  const publicCourses = usePublicCourses();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [counsellorCourse, setCounsellorCourse] = useState(null);
  const [purchaseCourse, setPurchaseCourse] = useState(null);
  const levels = useMemo(() => ["All", ...new Set(publicCourses.map((course) => course.level).filter(Boolean))], [publicCourses]);
  const filtered = useMemo(
    () => publicCourses.filter((course) => (level === "All" || course.level === level) && course.name.toLowerCase().includes(query.toLowerCase())),
    [publicCourses, query, level]
  );

  return (
    <>
      <main className={sectionClass}>
        <SectionHeader eyebrow="Courses" title="Search courses by skill level and career path." text="Each program includes course structure, syllabus direction, duration, and career outcomes." />
        <div className="mb-7 grid gap-3 lg:grid-cols-[1fr_auto]">
          <label className="flex h-12 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-white/5">
            <Search size={18} className="text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <div className="flex flex-wrap gap-2">
            {levels.map((item) => (
              <button key={item} onClick={() => setLevel(item)} className={`h-11 rounded-md px-3 text-sm font-bold sm:h-12 sm:px-4 ${level === item ? "bg-[#f97316] text-white" : "border border-slate-200 bg-white hover:border-[#f97316] hover:text-[#c2410c] dark:border-white/10 dark:bg-white/5"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.name} course={course} onLearnMore={(item) => navigateTo(`/courses/${courseSlug(item.name)}`)} onCounsellor={setCounsellorCourse} onBuyNow={setPurchaseCourse} showFees={false} />
          ))}
        </div>
        <CounsellorLeadModal course={counsellorCourse} courseOptions={publicCourses} onClose={() => setCounsellorCourse(null)} />
        <CoursePurchaseModal course={purchaseCourse} courseOptions={publicCourses} onClose={() => setPurchaseCourse(null)} />
      </main>
      <Footer />
    </>
  );
}

export function ServicesPage() {
  return (
    <>
      <main className={sectionClass}>
        <SectionHeader eyebrow="Services" title="Training and career services for every stage." text="From first class to final interview, the institute supports learning, practice, applications, and hiring readiness." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map(([title, text, Icon]) => (
            <article key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
              <Icon className="text-[#f97316]" size={28} />
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              <button onClick={() => navigateTo("/contact")} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#ea580c] hover:text-[#111315]">
                Learn More
                <ChevronRight size={16} />
              </button>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

const serviceSolutions = [
  {
    title: "Web Development",
    Icon: Globe2,
    description: "High-performing websites and web platforms built for brand trust, speed, and conversions.",
    items: ["Business Websites", "E-commerce Websites", "Educational Websites", "Custom Web Applications", "Landing Pages"]
  },
  {
    title: "Full Stack Development",
    Icon: Code2,
    description: "Complete frontend, backend, API, and database implementation for modern digital products.",
    items: ["MERN Stack Applications", "REST APIs", "Authentication Systems", "Admin Dashboards", "Database Integration"]
  },
  {
    title: "Software Development",
    Icon: BriefcaseBusiness,
    description: "Custom software that digitizes operations, improves visibility, and reduces manual work.",
    items: ["ERP Solutions", "CRM Systems", "Inventory Management", "Custom Business Software"]
  },
  {
    title: "Mobile App Development",
    Icon: Smartphone,
    description: "Responsive mobile experiences connected to reliable APIs and long-term support workflows.",
    items: ["Android Apps", "Cross-Platform Apps", "API Integrations", "Maintenance & Support"]
  },
  {
    title: "UI/UX Design",
    Icon: Palette,
    description: "Clean product interfaces designed around clarity, usability, and business outcomes.",
    items: ["Wireframing", "Prototyping", "Responsive Interfaces", "User Experience Improvements"]
  },
  {
    title: "Digital Transformation",
    Icon: Server,
    description: "Technology consulting and automation for teams moving from manual systems to digital workflows.",
    items: ["Business Automation", "Cloud-Based Solutions", "Process Digitization", "Technical Consulting"]
  }
];

const serviceStrengths = [
  ["Experienced Team", Users],
  ["Modern Technologies", Layers3],
  ["Secure Development", ShieldCheck],
  ["Scalable Solutions", Rocket],
  ["Affordable Pricing", BriefcaseBusiness],
  ["On-Time Delivery", Clock3],
  ["Dedicated Support", Headphones],
  ["Quality Assurance", ClipboardCheck]
];

const technologyGroups = [
  ["Frontend", ["HTML", "CSS", "JavaScript", "React.js", "Tailwind CSS"]],
  ["Backend", ["Node.js", "Express.js", "Python", "Django"]],
  ["Database", ["MongoDB", "MySQL"]],
  ["Tools", ["Git", "GitHub", "Postman", "VS Code"]]
];

const developmentSteps = ["Requirement Analysis", "Planning", "UI/UX Design", "Development", "Testing", "Deployment", "Support & Maintenance"];

const portfolioProjects = [
  {
    name: "Institute Management CRM",
    description: "A role-based platform for admissions, batches, leads, receipts, and student operations.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80",
    technologies: ["React", "Node.js", "MongoDB"]
  },
  {
    name: "E-commerce Storefront",
    description: "A conversion-focused online store with product catalog, checkout flow, and admin controls.",
    image: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=900&q=80",
    technologies: ["React", "Express.js", "MySQL"]
  },
  {
    name: "Business Automation Portal",
    description: "A custom dashboard for tracking internal requests, approvals, reports, and team productivity.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    technologies: ["Python", "Django", "Postman"]
  }
];

const serviceTestimonials = [
  {
    name: "Amit Sharma",
    position: "Founder",
    company: "BrightPath Academy",
    feedback: "The team understood our admissions process clearly and delivered a fast, practical CRM that our staff could use from day one."
  },
  {
    name: "Neha Verma",
    position: "Operations Head",
    company: "Urban Retail Co.",
    feedback: "Their software helped us reduce manual reporting and gave our managers better visibility across inventory and sales."
  },
  {
    name: "Rahul Mehta",
    position: "Director",
    company: "SkillBridge Solutions",
    feedback: "We needed a clean website and custom dashboard on a tight timeline. The execution was structured, responsive, and reliable."
  }
];

const serviceFaqs = [
  ["How long does a project take?", "Most websites take 2-4 weeks, while custom software and dashboards depend on scope, integrations, and approval cycles."],
  ["What technologies do you use?", "We work with HTML, CSS, JavaScript, React.js, Tailwind CSS, Node.js, Express.js, Python, Django, MongoDB, and MySQL."],
  ["Do you provide maintenance?", "Yes. We provide maintenance, bug fixes, updates, performance improvements, and ongoing support plans."],
  ["Can you build custom software?", "Yes. We build ERP, CRM, inventory systems, admin dashboards, automation tools, and business-specific applications."],
  ["How can I request a quotation?", "Use the consultation or contact button and share your requirements. The team will review the scope and respond with a quotation."]
];

function ITServiceSection({ eyebrow, title, text, children, className = "" }) {
  return (
    <section className={className}>
      <div className={sectionClass}>
        <SectionHeader eyebrow={eyebrow} title={title} text={text} />
        {children}
      </div>
    </section>
  );
}

export function ITServicesPage() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const reveal = entered ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0";

  return (
    <>
      <main>
        <section className="relative overflow-hidden bg-[#111315] text-white">
          <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=85" alt="Technology hardware and software systems" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(17,19,21,.96)_0%,rgba(17,19,21,.86)_46%,rgba(17,19,21,.55)_100%)]" />
          <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
            <div className={`transition-all duration-700 ease-out ${reveal}`}>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#fdba74]">Corporate IT Solutions</p>
              <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight sm:text-5xl md:text-6xl">IT Services & Technology Solutions</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100">We provide end-to-end digital solutions for businesses, startups, educational institutions, and organizations that want reliable technology, clean execution, and measurable outcomes.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button onClick={() => navigateTo("/contact")} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#f97316] px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.22)] transition hover:bg-white hover:text-[#111315]">
                  Get Free Consultation
                  <ArrowRight size={17} />
                </button>
                <button onClick={() => navigateTo("/contact")} className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:border-[#fdba74] hover:text-[#fdba74]">
                  Contact Us
                  <Phone size={17} />
                </button>
              </div>
            </div>
            <div className={`grid gap-4 transition-all delay-150 duration-700 ease-out ${reveal}`}>
              {[
                ["Digital Products", "Websites, apps, dashboards, and custom portals"],
                ["Business Systems", "CRM, ERP, inventory, automation, and reporting"],
                ["Technical Support", "Maintenance, consulting, deployment, and scaling"]
              ].map(([title, text]) => (
                <div key={title} className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-soft backdrop-blur">
                  <h2 className="text-lg font-black">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ITServiceSection eyebrow="Services" title="Complete IT solutions for modern organizations." text="From customer-facing websites to internal business systems, every solution is planned for usability, security, and long-term growth.">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {serviceSolutions.map(({ title, Icon, description, items }) => (
              <article key={title} className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#f97316] hover:shadow-soft dark:border-white/10 dark:bg-white/5">
                <div className="grid h-12 w-12 place-items-center rounded-md bg-[#fff3e8] text-[#f97316] transition group-hover:bg-[#f97316] group-hover:text-white dark:bg-[#f97316]/15">
                  <Icon size={24} />
                </div>
                <h2 className="mt-5 text-xl font-black">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                <div className="mt-5 grid gap-2">
                  {items.map((item) => (
                    <p key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <CheckCircle2 size={16} className="shrink-0 text-[#f97316]" />
                      {item}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </ITServiceSection>

        <ITServiceSection eyebrow="Why Choose Us" title="Built with discipline from planning to support." className="bg-white dark:bg-[#12181c]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {serviceStrengths.map(([title, Icon]) => (
              <div key={title} className="rounded-lg border border-slate-200 p-5 transition hover:-translate-y-1 hover:border-[#f97316] dark:border-white/10">
                <Icon className="text-[#f97316]" size={26} />
                <h3 className="mt-4 font-black">{title}</h3>
              </div>
            ))}
          </div>
        </ITServiceSection>

        <ITServiceSection eyebrow="Technology Stack" title="Modern tools for reliable delivery." text="We choose practical technologies that are easy to maintain, scale, and hand over to growing teams.">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {technologyGroups.map(([group, items]) => (
              <article key={group} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-3">
                  <Database size={22} className="text-[#f97316]" />
                  <h2 className="text-lg font-black">{group}</h2>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span key={item} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-700 dark:border-white/10 dark:text-slate-200">{item}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </ITServiceSection>

        <ITServiceSection eyebrow="Process" title="A clear development process from idea to launch." className="bg-white dark:bg-[#12181c]">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7">
            {developmentSteps.map((step, index) => (
              <article key={step} className="relative rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-[#f97316] text-sm font-black text-white">{index + 1}</span>
                <h2 className="mt-4 text-sm font-black leading-5">{step}</h2>
              </article>
            ))}
          </div>
        </ITServiceSection>

        <ITServiceSection eyebrow="Portfolio" title="Project previews across business needs." text="A glimpse of the kinds of platforms we build for operations, sales, learning, and management teams.">
          <div className="grid gap-5 md:grid-cols-3">
            {portfolioProjects.map((project) => (
              <article key={project.name} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
                <img src={project.image} alt={project.name} className="h-48 w-full object-cover" loading="lazy" />
                <div className="p-5">
                  <h2 className="text-lg font-black text-[#111315] dark:text-white">{project.name === "Institute Management CRM" ? <>Institute Management <span className="text-[#f97316]">CRM</span></> : project.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{project.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.technologies.map((item) => (
                      <span key={item} className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200">{item}</span>
                    ))}
                  </div>
                  <button onClick={() => navigateTo("/contact")} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#ea580c] transition hover:text-[#111315] dark:text-[#fdba74]">
                    View Details
                    <ChevronRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </ITServiceSection>

        <ITServiceSection eyebrow="Testimonials" title="Trusted by teams that need practical technology." className="bg-white dark:bg-[#12181c]">
          <div className="grid gap-5 md:grid-cols-3">
            {serviceTestimonials.map((item) => (
              <article key={item.name} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex gap-1 text-[#f97316]">
                  {[1, 2, 3, 4, 5].map((rating) => <Star key={rating} size={16} fill="currentColor" />)}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.feedback}</p>
                <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
                  <h2 className="font-black">{item.name}</h2>
                  <p className="text-sm text-[#ea580c]">{item.position}, {item.company}</p>
                </div>
              </article>
            ))}
          </div>
        </ITServiceSection>

        <ITServiceSection eyebrow="FAQ" title="Common questions before starting a project.">
          <div className="grid gap-4 lg:grid-cols-2">
            {serviceFaqs.map(([question, answer]) => (
              <article key={question} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-start gap-3">
                  <HelpCircle size={22} className="mt-0.5 shrink-0 text-[#f97316]" />
                  <div>
                    <h2 className="font-black">{question}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{answer}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </ITServiceSection>

        <section className="bg-[#111315] text-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#fdba74]">Start With A Consultation</p>
              <h2 className="mt-3 text-3xl font-black">Ready to Start Your Project?</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">Share your requirements and we will help you choose the right technology, timeline, and execution plan.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigateTo("/contact")} className="inline-flex h-12 items-center gap-2 rounded-md bg-[#f97316] px-5 text-sm font-bold text-white transition hover:bg-white hover:text-[#111315]">
                Consultation
                <ArrowRight size={17} />
              </button>
              <button onClick={() => navigateTo("/contact")} className="inline-flex h-12 items-center gap-2 rounded-md border border-white/20 px-5 text-sm font-bold text-white transition hover:border-[#fdba74] hover:text-[#fdba74]">
                Contact
                <Phone size={17} />
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function ContactPage() {
  return (
    <>
      <main className={sectionClass}>
        <SectionHeader eyebrow="Contact" title="Talk to the admissions team." text="Submit an enquiry and it will be added to the lead workflow for follow-up." />
        <div>
          <aside className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              [Phone, "Phone Number", "+91 9098875825"],
              [Mail, "Email", "info@codingwallah.com"],
              [MapPin, "Address", "1st Floor, 91, Ratna Lok Colony RD, Near Medanta Hospital, Vijay nagar, Indore, MP, 452010"]
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                <Icon className="text-[#f97316]" size={24} />
                <h2 className="mt-4 font-black">{title}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{text}</p>
              </div>
            ))}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 md:col-span-2 lg:col-span-3">
              <iframe
                title="Institute map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.4261459205277!2d75.89608317534959!3d22.749561279366112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd2bb90129a1%3A0x4b4cd8f83c62a3c4!2sCoding%20Wallah%20%3A%20-%20IT%20%2Cfull%20stack%20development%20%2CData%20Analytics%20%2CAIML%20%2C%20Data%20Science%20Training%20and%20placement%20Institute%2CIndore!5e0!3m2!1sen!2sin!4v1783405333862!5m2!1sen!2sin"
                className="h-72 w-full"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 md:col-span-2 lg:col-span-3">Social: LinkedIn · Instagram · YouTube · Facebook</p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
