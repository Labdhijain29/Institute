const API_URLS = [
  import.meta.env.VITE_API_URL,
  "http://127.0.0.1:5000/api",
  "http://localhost:5000/api"
].filter(Boolean);

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
  let networkError;

  for (const baseUrl of API_URLS) {
    try {
      response = await fetch(`${baseUrl}${path}`, request);
      break;
    } catch (error) {
      networkError = error;
    }
  }

  if (!response) {
    throw new Error(`API not reachable on port 5000. Check backend server. ${networkError?.message || ""}`.trim());
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function publicApi(path, options = {}) {
  return api(path, { ...options, headers: { ...(options.headers || {}) } });
}
