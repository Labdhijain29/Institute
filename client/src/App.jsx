import React from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { Shell } from "./layouts/Shell.jsx";

function Root() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-sm text-slate-600">Loading secure workspace...</div>;
  return user ? <Shell /> : <LoginPage />;
}

export function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
