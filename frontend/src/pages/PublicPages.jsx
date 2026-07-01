import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronRight, Mail, MapPin, Phone, Search, Send, X } from "lucide-react";
import { api, publicApi } from "../api/client.js";
import { navigateTo, Footer } from "../components/PublicLayout.jsx";
import { courses as staticCourses, partners, services, stats, testimonials, trainers, trustMilestones, values, whyChoose } from "../data/publicContent.js";

const sectionClass = "mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8";
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
        const nextCourses = (data.items || []).map(normalizePublicCourse);
        setItems(nextCourses.length ? nextCourses : staticCourses);
      })
      .catch(() => {
        if (active) setItems(staticCourses);
      });
    return () => { active = false; };
  }, []);

  return items;
}

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f97316]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{text}</p>}
    </div>
  );
}

function PrimaryButton({ children, to = "/courses" }) {
  return (
    <button onClick={() => navigateTo(to)} className="inline-flex h-12 items-center gap-2 rounded-md bg-[#f97316] px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(249,115,22,0.22)] transition hover:bg-[#111315]">
      {children}
      <ArrowRight size={17} />
    </button>
  );
}

function SecondaryButton({ children, to = "/login" }) {
  return (
    <button onClick={() => navigateTo(to)} className="inline-flex h-12 items-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-bold text-[#111315] shadow-sm transition hover:border-[#f97316] hover:text-[#c2410c] dark:border-white/15 dark:bg-white/5 dark:text-white">
      {children}
    </button>
  );
}

function CourseCard({ course, onLearnMore, onCounsellor, showFees = true }) {
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
          <img src={course.image} alt={`${course.name} course`} className="h-56 w-full rounded-md object-cover md:h-full" />
          <div>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{course.overview}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <p className="rounded-md bg-slate-50 p-3 dark:bg-white/5">
                <span className="block text-xs text-slate-500 dark:text-slate-400">Duration</span>
                <span className="font-bold">{course.duration}</span>
              </p>
              <p className="rounded-md bg-slate-50 p-3 dark:bg-white/5">
                <span className="block text-xs text-slate-500 dark:text-slate-400">Fees</span>
                <span className="font-bold">{course.fees}</span>
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

  return (
    <>
      <main>
        <section className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-[#111315] text-white">
          <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=85" alt="Futuristic technology workspace with code screens" className="absolute inset-0 h-full w-full object-cover object-center opacity-90" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(17,19,21,.97)_0%,rgba(17,19,21,.84)_40%,rgba(17,19,21,.36)_72%,rgba(249,115,22,.18)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_32%,rgba(56,189,248,.28),transparent_32%),radial-gradient(circle_at_84%_70%,rgba(249,115,22,.28),transparent_28%),linear-gradient(180deg,rgba(17,19,21,.12)_0%,rgba(17,19,21,.7)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#111315] via-[#111315]/55 to-transparent" />
          <div className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#fdba74]">Coding Walla Website & Management System</p>
              <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">Coding Walla</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100">Professional coding courses with live classes, real projects, placement support, and a role-based management system for every student journey.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <PrimaryButton to="/courses">Explore Courses</PrimaryButton>
                <SecondaryButton to="/login">Login</SecondaryButton>
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

        <section className={sectionClass}>
          <SectionHeader eyebrow="Popular Courses" title="Pick a path and build proof of skill." />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {publicCourses.map((course) => (
              <CourseCard key={course.name} course={course} />
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-[#12181c]">
          <div className={sectionClass}>
            <SectionHeader eyebrow="Testimonials" title="Students trust the process because it stays practical." />
            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((item) => (
                <article key={item.name} className="rounded-lg border border-slate-200 p-5 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-12 w-12 rounded-md object-cover" loading="lazy" />
                    <div>
                      <h3 className="font-black">{item.name}</h3>
                      <p className="text-sm text-[#ea580c]">{item.course}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.feedback}</p>
                </article>
              ))}
            </div>
            <p className="mt-10 text-center text-sm font-bold uppercase tracking-[0.16em] text-[#f97316]">Our Hiring Partners</p>
            <div className="mt-10 overflow-hidden border-y border-slate-200 py-5 dark:border-white/10">
              <div className="partner-marquee flex w-max items-center gap-4">
                {[...partners, ...partners].map((partner, index) => (
                  <div key={`${partner.name}-${index}`} className="flex h-24 w-40 shrink-0 flex-col items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                    {partner.logoText ? (
                      <span className="text-3xl font-black tracking-wide text-[#6f2cff]">{partner.logoText}</span>
                    ) : (
                      <img
                        src={partner.logo}
                        alt=""
                        title={partner.name}
                        className="max-h-10 max-w-32 object-contain"
                        loading="lazy"
                        onError={(event) => {
                          if (event.currentTarget.src !== partner.fallbackLogo) {
                            event.currentTarget.src = partner.fallbackLogo;
                          }
                        }}
                      />
                    )}
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-300">{partner.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <CTA />
      <Footer />
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
              <article key={trainer.name} className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
                <img src={trainer.image} alt={trainer.name} className="h-72 w-full object-cover object-top md:h-80 lg:h-96" loading="lazy" />
                <div className="p-5">
                  <h3 className="text-lg font-black">{trainer.name}</h3>
                  <p className="mt-1 text-sm text-[#ea580c]">{trainer.expertise}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{trainer.experience} experience</p>
                </div>
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
  const levels = useMemo(() => ["All", ...new Set(publicCourses.map((course) => course.level).filter(Boolean))], [publicCourses]);
  const filtered = useMemo(
    () => publicCourses.filter((course) => (level === "All" || course.level === level) && course.name.toLowerCase().includes(query.toLowerCase())),
    [publicCourses, query, level]
  );

  return (
    <>
      <main className={sectionClass}>
        <SectionHeader eyebrow="Courses" title="Search courses by skill level and career path." text="Each program includes course structure, syllabus direction, duration, and career outcomes." />
        <div className="mb-7 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="flex h-12 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-white/5">
            <Search size={18} className="text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <div className="flex flex-wrap gap-2">
            {levels.map((item) => (
              <button key={item} onClick={() => setLevel(item)} className={`h-12 rounded-md px-4 text-sm font-bold ${level === item ? "bg-[#f97316] text-white" : "border border-slate-200 bg-white hover:border-[#f97316] hover:text-[#c2410c] dark:border-white/10 dark:bg-white/5"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.name} course={course} onLearnMore={setSelectedCourse} onCounsellor={setCounsellorCourse} showFees={false} />
          ))}
        </div>
        <CourseDetailsModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
        <CounsellorLeadModal course={counsellorCourse} courseOptions={publicCourses} onClose={() => setCounsellorCourse(null)} />
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

export function ContactPage() {
  const publicCourses = usePublicCourses();
  const defaultCourse = publicCourses[0]?.name || "";
  const [form, setForm] = useState({ fullName: "", mobile: "", email: "", course: defaultCourse, message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (defaultCourse && !form.course) setForm((current) => ({ ...current, course: defaultCourse }));
  }, [defaultCourse, form.course]);

  const submit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");
    try {
      await publicApi("/public/enquiries", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setStatus("Thanks. Our admissions team will contact you shortly.");
      setForm({ fullName: "", mobile: "", email: "", course: defaultCourse, message: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <main className={sectionClass}>
        <SectionHeader eyebrow="Contact" title="Talk to the admissions team." text="Submit an enquiry and it will be added to the lead workflow for follow-up." />
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 md:p-7">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold">
                Full Name
                <input required className={`${inputClass} mt-2`} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
              </label>
              <label className="text-sm font-bold">
                Mobile Number
                <input required inputMode="numeric" className={`${inputClass} mt-2`} value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
              </label>
              <label className="text-sm font-bold">
                Email Address
                <input type="email" className={`${inputClass} mt-2`} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
              <label className="text-sm font-bold">
                Interested Course
                <select className={`${inputClass} mt-2`} value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })}>
                  {publicCourses.map((course) => (
                    <option key={course.name}>{course.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold md:col-span-2">
                Message
                <textarea required rows="5" className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-ink outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/15 dark:border-white/10 dark:bg-white/5 dark:text-white" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
              </label>
            </div>
            {status && <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} />{status}</p>}
            {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            <button className="mt-5 inline-flex h-12 items-center gap-2 rounded-md bg-[#f97316] px-5 text-sm font-bold text-white hover:bg-[#111315]">
              <Send size={17} />
              Submit Enquiry
            </button>
          </form>

          <aside className="space-y-5">
            {[
              [Phone, "Phone Number", "+91 9098875825"],
              [Mail, "Email", "info@codingwallah.com"],
              [MapPin, "Address", "1nd Floor, 91, Ratna Lok Colony RD, Near Medanta Hospital, Vijay nagar, Indore, MP, 452010"]
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                <Icon className="text-[#f97316]" size={24} />
                <h2 className="mt-4 font-black">{title}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{text}</p>
              </div>
            ))}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
              <iframe
                title="Institute map"
                src="https://www.google.com/maps?q=New%20Delhi%20India&output=embed"
                className="h-72 w-full"
                loading="lazy"
              />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Social: LinkedIn · Instagram · YouTube · Facebook</p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
