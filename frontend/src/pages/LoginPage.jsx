import React from "react";
import { useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { navigateTo } from "../components/PublicLayout.jsx";
import logoMark from "../assets/coding-wallah-mark-transparent.png";

const registerRoles = ["Manager", "HR", "Telecaller", "Counsellor", "Receptionist", "Accountant", "Faculty", "Student", "Parent"];
const states = ["Delhi", "Haryana", "Punjab", "Rajasthan", "Uttar Pradesh", "Madhya Pradesh", "Maharashtra", "Gujarat", "Karnataka", "Other"];
const citiesByState = {
  Delhi: ["New Delhi", "Dwarka", "Rohini"],
  Haryana: ["Gurugram", "Faridabad", "Panipat"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur"],
  "Uttar Pradesh": ["Noida", "Lucknow", "Kanpur"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru"],
  Other: ["Other"]
};

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
  dateOfJoining: ""
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

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const submitLogin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
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
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        mobile: form.mobile,
        role: form.role,
        address: {
          permanent: form.permanentAddress,
          current: form.currentAddress,
          state: form.state,
          city: form.city,
          pincode: form.pincode
        },
        dateOfJoining: form.dateOfJoining
      });
      setSuccess("Registration successful. Ab aap email aur password se login karein.");
      setLoginForm({ email: form.email, password: "", remember: true });
      setForm(initialForm);
      setMode("login");
    } catch (err) {
      setError(err.message);
    }
  };

  const selectedCities = form.state ? citiesByState[form.state] || ["Other"] : [];

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
            <span className="grid h-14 w-20 place-items-center rounded-md bg-[#111315] p-1.5 shadow-sm ring-1 ring-white/10">
              <img src={logoMark} alt="Coding Wallah" className="h-full w-full object-contain" />
            </span>
            <div>
              <p className="text-sm font-black">Coding Wallah</p>
              <p className="text-xs text-slate-300">ERP Control Panel</p>
            </div>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#fdba74]">Coding Wallah</p>
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
              <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {registerRoles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </Field>
            <Field label="Permanent Address">
              <input className={inputClass} value={form.permanentAddress} onChange={(e) => setForm({ ...form, permanentAddress: e.target.value })} />
            </Field>
            <Field label="Address">
              <input className={inputClass} value={form.currentAddress} onChange={(e) => setForm({ ...form, currentAddress: e.target.value })} />
            </Field>
            <Field label="State">
              <select className={inputClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, city: "" })}>
                <option value="">Select state...</option>
                {states.map((state) => (
                  <option key={state}>{state}</option>
                ))}
              </select>
            </Field>
            <Field label="City">
              <select className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} disabled={!form.state}>
                <option value="">{form.state ? "Select city..." : "Select state first"}</option>
                {selectedCities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
            </Field>
            <Field label="Pincode">
              <input inputMode="numeric" maxLength="6" className={inputClass} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            </Field>
            <Field label="Date of Joining">
              <input type="date" className={inputClass} value={form.dateOfJoining} onChange={(e) => setForm({ ...form, dateOfJoining: e.target.value })} />
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
