import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../api/client";

const AuthContext = createContext(null);

function browserMetadata() {
  if (typeof navigator === "undefined") return {};
  return { userAgent: navigator.userAgent };
}

function optionalBrowserLocation() {
  if (typeof navigator === "undefined" || !navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 1200, maximumAge: 10 * 60 * 1000 }
    );
  });
}

async function attendanceMetadata() {
  const location = await optionalBrowserLocation();
  return {
    ...browserMetadata(),
    ...(location ? { attendanceLocation: location } : {})
  };
}

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
        const metadata = await attendanceMetadata();
        const data = await api("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password, ...metadata })
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
      async logout() {
        try {
          const metadata = await attendanceMetadata();
          await api("/auth/logout", {
            method: "POST",
            body: JSON.stringify(metadata)
          });
        } catch {
          // Local sign-out should never be blocked by attendance capture.
        } finally {
          setToken(null);
          setUser(null);
          setPermissions([]);
        }
      }
    }),
    [user, permissions, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
