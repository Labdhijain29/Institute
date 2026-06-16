const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export function getToken() {
  return localStorage.getItem("crm_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("crm_token", token);
  else localStorage.removeItem("crm_token");
}

export async function api(path, options = {}) {
  const token = getToken();
  const request = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, request);
  } catch (error) {
    throw new Error(`API not reachable. Check backend server. ${error?.message || ""}`.trim());
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function publicApi(path, options = {}) {
  return api(path, { ...options, headers: { ...(options.headers || {}) } });
}
