import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { Shell } from "./layouts/Shell.jsx";
import { PublicLayout } from "./components/PublicLayout.jsx";
import { AboutPage, ContactPage, CoursesPage, HomePage, ITServicesPage, ServicesPage } from "./pages/PublicPages.jsx";
import { StudentPortal } from "./student/StudentPortal.jsx";
import { MarketingPortal } from "./marketing/MarketingPortal.jsx";

function usePath() {
  const [path, setPath] = useState(window.location.pathname || "/");

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return path;
}

function replacePath(path) {
  window.history.replaceState({}, "", path);
  window.dispatchEvent(new Event("popstate"));
}

function RedirectToDashboard({ user }) {
  const destination = user.role === "Student" ? "/student/dashboard" : user.role === "Digital Marketing Executive" ? "/marketing/dashboard" : "/dashboard";
  useEffect(() => {
    replacePath(destination);
  }, [destination]);

  return user.role === "Student" ? <StudentPortal path={destination} /> : user.role === "Digital Marketing Executive" ? <MarketingPortal path={destination} /> : <Shell />;
}

function Root() {
  const { user, loading } = useAuth();
  const path = usePath();
  const [dark, setDark] = useState(false);

  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-slate-600">Loading secure workspace...</div>;

  if (path === "/student" || path.startsWith("/student/")) {
    if (!user) return <LoginPage />;
    if (user.role !== "Student") return <RedirectToDashboard user={user} />;
    return <StudentPortal path={path} />;
  }

  if (path === "/marketing" || path.startsWith("/marketing/")) {
    if (!user) return <LoginPage />;
    if (user.role !== "Digital Marketing Executive") return <RedirectToDashboard user={user} />;
    return <MarketingPortal path={path} />;
  }

  if (path === "/dashboard") {
    if (!user) return <LoginPage />;
    return ["Student", "Digital Marketing Executive"].includes(user.role) ? <RedirectToDashboard user={user} /> : <Shell />;
  }

  if (path === "/login" || path === "/register") {
    if (user) {
      return <RedirectToDashboard user={user} />;
    }
    return <LoginPage initialMode={path === "/register" ? "register" : "login"} />;
  }

  const pages = {
    "/": HomePage,
    "/about": AboutPage,
    "/courses": CoursesPage,
    "/it-services": ITServicesPage,
    "/services": ServicesPage,
    "/contact": ContactPage
  };
  const Page = pages[path] || HomePage;

  return (
    <PublicLayout path={pages[path] ? path : "/"} dark={dark} setDark={setDark}>
      <Page />
    </PublicLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
