import React from "react";
import { useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { publicApi } from "../api/client.js";
import { navigateTo } from "../components/PublicLayout.jsx";
import { SearchableSelect } from "../components/SearchableSelect.jsx";
import { courses as publicCourses } from "../data/publicContent.js";
import { BrandLockup } from "../components/BrandLogo.jsx";

const registerRoles = [
  ["Manager", "Manager"],
  ["HR", "HR"],
  ["Telecaller", "Telecaller"],
  ["Counsellor", "Counsellor"],
  ["Receptionist", "Receptionist"],
  ["Accountant", "Accountant"],
  ["Faculty", "Faculty"],
  ["Digital Marketing Executive", "Digital Marketing"],
  ["Student", "Student"],
  ["Parent", "Parent"]
];
const roleOptions = registerRoles.map(([value, label]) => ({ value, label }));
const courseOptions = publicCourses.map((course) => ({ value: course.name, label: course.name }));
const facultyOptions = [
  "Java",
  "Python",
  "MERN",
  "MEAN",
  "AI/ML",
  "Data Science",
  "Data Analytics",
  "Full Stack Development",
  "Cloud Computing",
  "AWS",
  "DevOps",
  "Cyber Security",
  "Networking",
  "Automation Testing",
  "Manual Testing",
  "iOS Development",
  "Android Development",
  "Flutter Development"
].map((item) => ({ value: item, label: item }));
const today = new Date().toLocaleDateString("en-CA");

const initialForm = {
  name: "",
  mobile: "",
  email: "",
  password: "",
  role: "Telecaller",
  permanentAddress: "",
  currentAddress: "",
  state: "",
  city: "",
  pincode: "",
  courseName: "",
  facultySpecialty: "",
  dateOfJoining: today
};

function Field({ label, children, wide = false }) {
  return (
    <label className={`block text-xs font-semibold uppercase tracking-wide text-slate-700 ${wide ? "md:col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}

const inputClass = "mt-1.5 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm normal-case tracking-normal outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10";

export function LoginPage({ initialMode = "login" }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState(initialForm);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [indiaStates, setIndiaStates] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    publicApi("/public/locations/states")
      .then((data) => setIndiaStates(data.items || []))
      .catch(() => setIndiaStates([]));
  }, []);

  const submitLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (form.role === "Student" && !form.courseName) {
      setError("Please select a course for student registration.");
      return;
    }
    if (form.role === "Faculty" && !form.facultySpecialty) {
      setError("Please select a faculty for faculty registration.");
      return;
    }
    try {
      await login(loginForm.email, loginForm.password);
    } catch (err) {
      setError(err.message);
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        mobile: form.mobile,
        role: form.role,
        courseName: form.role === "Student" ? form.courseName : "",
        facultySpecialty: form.role === "Faculty" ? form.facultySpecialty : "",
        address: {
          permanent: form.permanentAddress,
          current: form.currentAddress,
          state: form.state,
          city: form.city,
          pincode: form.pincode
        },
        dateOfJoining: form.dateOfJoining
      });
      setSuccess(result.message);
      setLoginForm({ email: form.email, password: "", remember: true });
      setForm(initialForm);
      setMode("login");
    } catch (err) {
      setError(err.message);
    }
  };

  const stateOptions = indiaStates.map((state) => ({ value: state.name, label: state.name }));
  const selectState = async (stateName) => {
    setForm((current) => ({ ...current, state: stateName, city: "" }));
    setCityOptions([]);
    const state = indiaStates.find((item) => item.name === stateName);
    if (!state) return;
    setCitiesLoading(true);
    try {
      const data = await publicApi(`/public/locations/cities?stateCode=${encodeURIComponent(state.isoCode)}`);
      setCityOptions((data.items || []).map((city) => ({ value: city, label: city })));
    } catch {
      setCityOptions([]);
    } finally {
      setCitiesLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[#f8f5ef] text-[#111315] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex min-h-[34vh] items-end overflow-hidden bg-[#111315] px-8 py-10 text-white lg:min-h-screen lg:px-14">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,19,21,.92),rgba(17,19,21,.72),rgba(249,115,22,.35))]" />
        <div className="relative max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <BrandLockup logoClassName="h-16 w-auto" />
          </div>
          {/* <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#fdba74]">Coding Walla</p> */}
          <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">Run every branch, lead, batch and fee workflow from one control room.</h1>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-6">
        {mode === "login" ? (
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <button onClick={() => navigateTo("/")} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#f97316]">
            <ArrowLeft size={16} />
            Back to website
          </button>
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-[#fff3e8] text-[#f97316]">
              <LockKeyhole size={24} />
            </div>
            <h1 className="mt-5 text-2xl font-bold leading-tight">Secure Login</h1>
            <p className="mt-3 text-slate-600">Login to access your dashboard</p>
          </div>

          <form onSubmit={submitLogin} className="mt-9 space-y-5">
            <Field label="Email Address">
              <input required type="email" className={inputClass} value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
            </Field>
            <Field label="Password">
              <input required type="password" className={inputClass} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
            </Field>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={loginForm.remember} onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })} />
              Remember me
            </label>
            {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {success && <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}
            <button className="flex h-14 w-full items-center justify-center gap-2 rounded-md bg-[#111315] font-bold text-white hover:bg-[#f97316]">
              <LogIn size={18} />
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <button className="font-semibold text-[#f97316]" onClick={() => { setMode("register"); setError(""); setSuccess(""); }}>
              Register
            </button>
          </p>
        </div>
      ) : (
        <div className="w-full max-w-[660px] rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-soft md:px-7">
          <button onClick={() => navigateTo("/")} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#f97316]">
            <ArrowLeft size={16} />
            Back to website
          </button>
          <div className="text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-lg bg-[#fff3e8] text-[#f97316]">
              <UserPlus size={22} />
            </div>
            <h1 className="mt-3 text-lg font-semibold text-slate-700">Create your account to continue</h1>
          </div>

          <form onSubmit={submitRegister} className="mt-5 grid gap-x-4 gap-y-3 md:grid-cols-2">
            <Field label="Name">
              <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Contact">
              <input required inputMode="numeric" maxLength="10" placeholder="10-digit number" className={inputClass} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </Field>
            <Field label="Email Address">
              <input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Password">
              <input required type="password" minLength="6" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Field>
            <div className="hidden md:block" />
            <Field label="Role" wide>
              <SearchableSelect options={roleOptions} value={form.role} onChange={(role) => setForm({ ...form, role, courseName: role === "Student" ? form.courseName : "", facultySpecialty: role === "Faculty" ? form.facultySpecialty : "" })} placeholder="Select role..." searchPlaceholder="Search role..." />
            </Field>
            {form.role === "Student" && (
              <Field label="Course" wide>
                <SearchableSelect options={courseOptions} value={form.courseName} onChange={(courseName) => setForm({ ...form, courseName })} placeholder="Select course..." searchPlaceholder="Search course..." />
              </Field>
            )}
            {form.role === "Faculty" && (
              <Field label="Faculties" wide>
                <SearchableSelect options={facultyOptions} value={form.facultySpecialty} onChange={(facultySpecialty) => setForm({ ...form, facultySpecialty })} placeholder="Select faculty..." searchPlaceholder="Search faculty..." />
              </Field>
            )}
            <Field label="Permanent Address">
              <input className={inputClass} value={form.permanentAddress} onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })} />
            </Field>
            <Field label="Address">
              <input className={inputClass} value={form.currentAddress} onChange={(e) => setForm({ ...form, currentAddress: e.target.value })} />
            </Field>
            <Field label="State">
              <SearchableSelect options={stateOptions} value={form.state} onChange={selectState} placeholder="Select state..." searchPlaceholder="Search state..." />
            </Field>
            <Field label="City">
              <SearchableSelect options={cityOptions} value={form.city} onChange={(city) => setForm({ ...form, city })} disabled={!form.state || citiesLoading} placeholder={citiesLoading ? "Loading cities..." : form.state ? "Select city..." : "Select state first"} searchPlaceholder="Search city..." />
            </Field>
            <Field label="Pincode">
              <input inputMode="numeric" maxLength="6" className={inputClass} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            </Field>
            <Field label="Date of Joining">
              <input type="date" min={today} className={inputClass} value={form.dateOfJoining} onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })} />
            </Field>
            {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm normal-case tracking-normal text-red-700 md:col-span-2">{error}</p>}
            <button className="h-11 rounded-md bg-[#111315] text-sm font-bold normal-case tracking-normal text-white hover:bg-[#f97316] md:col-span-2">Register</button>
          </form>

          <p className="mt-3 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button className="font-semibold text-[#f97316]" onClick={() => { setMode("login"); setError(""); }}>
              Login
            </button>
          </p>
        </div>
      )}
      </section>
    </main>
  );
}
