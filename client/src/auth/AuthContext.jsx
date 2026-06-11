import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    const timeout = setTimeout(() => setLoading(false), 8000);
    api("/auth/me")
      .then((data) => {
        setUser(data.user);
        setPermissions(data.permissions || []);
      })
      .catch(() => setToken(null))
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
  }, []);

  const value = useMemo(
    () => ({
      user,
      permissions,
      loading,
      async login(email, password) {
        const data = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
        setToken(data.token);
        setUser(data.user);
        setPermissions(data.user.permissions || []);
      },
      async register(payload) {
        return api("/auth/register", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      },
      logout() {
        setToken(null);
        setUser(null);
        setPermissions([]);
      }
    }),
    [user, permissions, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
