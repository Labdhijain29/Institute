import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { Shell } from "./layouts/Shell.jsx";
import { PublicLayout } from "./components/PublicLayout.jsx";
import { AboutPage, ContactPage, CoursesPage, HomePage, ServicesPage } from "./pages/PublicPages.jsx";

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

function RedirectToDashboard() {
  useEffect(() => {
    replacePath("/dashboard");
  }, []);

  return <Shell />;
}

function Root() {
  const { user, loading } = useAuth();
  const path = usePath();
  const [dark, setDark] = useState(false);

  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-slate-600">Loading secure workspace...</div>;

  if (path === "/dashboard") {
    return user ? <Shell /> : <LoginPage />;
  }

  if (path === "/login" || path === "/register") {
    if (user) {
      return <RedirectToDashboard />;
    }
    return <LoginPage initialMode={path === "/register" ? "register" : "login"} />;
  }

  const pages = {
    "/": HomePage,
    "/about": AboutPage,
    "/courses": CoursesPage,
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
