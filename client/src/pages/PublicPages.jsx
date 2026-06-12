import React, { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronRight, Mail, MapPin, Phone, Search, Send } from "lucide-react";
import { publicApi } from "../api/client.js";
import { navigateTo, Footer } from "../components/PublicLayout.jsx";
import { courses, partners, services, stats, testimonials, trainers, trustMilestones, values, whyChoose } from "../data/publicContent.js";

const sectionClass = "mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8";
const inputClass = "h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-pine focus:ring-2 focus:ring-pine/15 dark:border-white/10 dark:bg-white/5 dark:text-white";

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-coral">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">{text}</p>}
    </div>
  );
}

function PrimaryButton({ children, to = "/courses" }) {
  return (
    <button onClick={() => navigateTo(to)} className="inline-flex h-12 items-center gap-2 rounded-md bg-pine px-5 text-sm font-bold text-white shadow-soft hover:bg-ink">
      {children}
      <ArrowRight size={17} />
    </button>
  );
}

function SecondaryButton({ children, to = "/login" }) {
  return (
    <button onClick={() => navigateTo(to)} className="inline-flex h-12 items-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-bold text-ink hover:border-pine hover:text-pine dark:border-white/15 dark:bg-white/5 dark:text-white">
      {children}
    </button>
  );
}

function CourseCard({ course }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-white/10 dark:bg-white/5">
      <img src={course.image} alt={`${course.name} course`} className="h-44 w-full object-cover" loading="lazy" />
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-black">{course.name}</h3>
          <span className="rounded-md bg-amberline/20 px-2.5 py-1 text-xs font-bold text-[#7a4a00] dark:text-amberline">{course.level}</span>
        </div>
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
        <div className="mt-4 flex flex-wrap gap-2">
          {course.skills.map((skill) => (
            <span key={skill} className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
              {skill}
            </span>
          ))}
        </div>
        <button onClick={() => navigateTo("/contact")} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-pine">
          Learn More
          <ChevronRight size={16} />
        </button>
      </div>
    </article>
  );
}

function CTA() {
  return (
    <section className="bg-ink text-white dark:bg-pine">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-amberline">Admissions Open</p>
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
  return (
    <>
      <main>
        <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-ink text-white">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80" alt="Students learning coding together" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,32,38,.92),rgba(15,118,110,.66),rgba(232,93,79,.24))]" />
          <div className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amberline">Coding Institute Website & Management System</p>
              <h1 className="mt-5 text-4xl font-black leading-tight md:text-6xl">CodeVista Institute</h1>
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
                <p className="text-3xl font-black text-pine">{value}</p>
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
                  <Icon className="text-coral" size={26} />
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
            {courses.map((course) => (
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
                      <p className="text-sm text-pine">{item.course}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.feedback}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {partners.map((partner) => (
                <div key={partner} className="grid h-16 place-items-center rounded-md border border-slate-200 bg-slate-50 text-sm font-black text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  {partner}
                </div>
              ))}
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
          <SectionHeader eyebrow="About CodeVista" title="A modern coding institute with a management backbone." text="We combine classroom training, project mentorship, admissions workflows, fee tracking, and role-based dashboards so learning and operations stay connected." />
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              ["Institute Story", "CodeVista was created for students who want structured technical learning without losing the practical rhythm of real software teams."],
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
                  <Icon className="text-pine" size={26} />
                  <h3 className="mt-4 font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHeader eyebrow="Trainers" title="Mentors with classroom clarity and industry depth." />
          <div className="grid gap-5 md:grid-cols-3">
            {trainers.map((trainer) => (
              <article key={trainer.name} className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
                <img src={trainer.image} alt={trainer.name} className="h-64 w-full object-cover" loading="lazy" />
                <div className="p-5">
                  <h3 className="text-lg font-black">{trainer.name}</h3>
                  <p className="mt-1 text-sm text-pine">{trainer.expertise}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{trainer.experience} experience</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustMilestones.map(([value, label, Icon]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                <Icon className="text-coral" size={24} />
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
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const filtered = useMemo(
    () => courses.filter((course) => (level === "All" || course.level === level) && course.name.toLowerCase().includes(query.toLowerCase())),
    [query, level]
  );

  return (
    <>
      <main className={sectionClass}>
        <SectionHeader eyebrow="Courses" title="Search courses by skill level and career path." text="Each program includes course structure, syllabus direction, duration, fees, and career outcomes." />
        <div className="mb-7 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="flex h-12 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-white/5">
            <Search size={18} className="text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" className="w-full bg-transparent text-sm outline-none" />
          </label>
          <div className="flex flex-wrap gap-2">
            {["All", "Beginner", "Intermediate", "Advanced"].map((item) => (
              <button key={item} onClick={() => setLevel(item)} className={`h-12 rounded-md px-4 text-sm font-bold ${level === item ? "bg-pine text-white" : "border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.name} course={course} />
          ))}
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {filtered.map((course) => (
            <article key={`${course.name}-details`} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <h2 className="text-xl font-black">{course.name} Details</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{course.overview}</p>
              <div className="mt-4 space-y-2 text-sm">
                <p><strong>Syllabus:</strong> {course.syllabus}</p>
                <p><strong>Duration:</strong> {course.duration}</p>
                <p><strong>Career opportunities:</strong> {course.careers}</p>
              </div>
            </article>
          ))}
        </div>
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
              <Icon className="text-coral" size={28} />
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              <button onClick={() => navigateTo("/contact")} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-pine">
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
  const [form, setForm] = useState({ fullName: "", mobile: "", email: "", course: "MERN Stack", message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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
      setForm({ fullName: "", mobile: "", email: "", course: "MERN Stack", message: "" });
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
                  {courses.map((course) => (
                    <option key={course.name}>{course.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-bold md:col-span-2">
                Message
                <textarea required rows="5" className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-ink outline-none focus:border-pine focus:ring-2 focus:ring-pine/15 dark:border-white/10 dark:bg-white/5 dark:text-white" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
              </label>
            </div>
            {status && <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"><CheckCircle2 size={18} />{status}</p>}
            {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            <button className="mt-5 inline-flex h-12 items-center gap-2 rounded-md bg-pine px-5 text-sm font-bold text-white hover:bg-ink">
              <Send size={17} />
              Submit Enquiry
            </button>
          </form>

          <aside className="space-y-5">
            {[
              [Phone, "Phone Number", "+91 98765 43210"],
              [Mail, "Email", "admissions@codevista.in"],
              [MapPin, "Address", "2nd Floor, Tech Park Road, New Delhi"]
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                <Icon className="text-coral" size={24} />
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
