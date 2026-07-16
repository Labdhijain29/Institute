import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { StudentLayout } from "./StudentLayout.jsx";
import { StudentAssignments } from "./pages/Assignments.jsx";
import { StudentAttendance } from "./pages/Attendance.jsx";
import { StudentCourse } from "./pages/Course.jsx";
import { StudentDashboard } from "./pages/Dashboard.jsx";
import { StudentFees } from "./pages/Fees.jsx";
import { StudentMaterials } from "./pages/Materials.jsx";
import { StudentProfile } from "./pages/Profile.jsx";
import { StudentRegistrationForm } from "./pages/RegistrationForm.jsx";

const pages = {
  "/student/dashboard": StudentDashboard,
  "/student/course": StudentCourse,
  "/student/attendance": StudentAttendance,
  "/student/assignments": StudentAssignments,
  "/student/materials": StudentMaterials,
  "/student/fees": StudentFees,
  "/student/registration-form": StudentRegistrationForm,
  "/student/profile": StudentProfile
};

export function StudentPortal({ path }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/student-portal/me").then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="grid min-h-screen place-items-center bg-[#f8f5ef] p-5"><div className="rounded-lg border border-red-200 bg-white p-6 text-center text-sm text-red-700">{error}</div></div>;
  if (!data) return <div className="grid min-h-screen place-items-center bg-[#f8f5ef] text-sm text-slate-600">Loading student dashboard...</div>;

  const Page = pages[path] || StudentDashboard;
  return <StudentLayout path={pages[path] ? path : "/student/dashboard"} student={data.student}><Page data={data} /></StudentLayout>;
}
