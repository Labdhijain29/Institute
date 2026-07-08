import crypto from "crypto";
import { Attendance } from "../models/Attendance.js";
import { Student } from "../models/Student.js";

const OFFICE_START_HOUR = Number(process.env.OFFICE_START_HOUR || 10);
const REQUIRED_WORKING_HOURS = Number(process.env.REQUIRED_WORKING_HOURS || 8);
const GEO_TIMEOUT_MS = Number(process.env.IP_GEOLOCATION_TIMEOUT_MS || 2500);

function startOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value = new Date()) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.headers["x-real-ip"] || req.socket?.remoteAddress || req.ip || "";
}

function normalizeIp(ip) {
  return String(ip || "").replace("::ffff:", "").trim();
}

function isPrivateIp(ip) {
  const value = normalizeIp(ip);
  return !value ||
    value === "::1" ||
    value === "127.0.0.1" ||
    value.startsWith("10.") ||
    value.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(value) ||
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    value.startsWith("fe80:");
}

function parseUserAgent(userAgent = "") {
  const agent = String(userAgent);
  const browser = agent.includes("Edg/")
    ? "Microsoft Edge"
    : agent.includes("Chrome/")
      ? "Chrome"
      : agent.includes("Firefox/")
        ? "Firefox"
        : agent.includes("Safari/")
          ? "Safari"
          : "Unknown Browser";
  const operatingSystem = agent.includes("Windows")
    ? "Windows"
    : agent.includes("Mac OS")
      ? "macOS"
      : agent.includes("Android")
        ? "Android"
        : agent.includes("iPhone") || agent.includes("iPad")
          ? "iOS"
          : agent.includes("Linux")
            ? "Linux"
            : "Unknown OS";
  const deviceType = /Mobi|Android|iPhone/i.test(agent) ? "Mobile" : /iPad|Tablet/i.test(agent) ? "Tablet" : "Desktop";
  return { browser, operatingSystem, deviceType };
}

async function fetchJson(url, headers = {}) {
  if (typeof fetch !== "function") return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveIpGeolocation(ipAddress) {
  const provider = String(process.env.IP_GEOLOCATION_PROVIDER || "ipapi").toLowerCase();
  const token = process.env.IPINFO_TOKEN;
  const ipForPath = isPrivateIp(ipAddress) ? "" : `/${encodeURIComponent(ipAddress)}`;

  if (provider === "ipinfo" && token) {
    const data = await fetchJson(`https://ipinfo.io${ipForPath}/json?token=${encodeURIComponent(token)}`);
    if (data) {
      const [latitude, longitude] = String(data.loc || "").split(",").map(Number);
      return {
        publicIp: data.ip || ipAddress,
        city: data.city || "",
        state: data.region || "",
        country: data.country || "",
        timezone: data.timezone || "",
        latitude: Number.isFinite(latitude) ? latitude : undefined,
        longitude: Number.isFinite(longitude) ? longitude : undefined
      };
    }
  }

  const url = isPrivateIp(ipAddress)
    ? "https://ipapi.co/json/"
    : `https://ipapi.co/${encodeURIComponent(ipAddress)}/json/`;
  const data = await fetchJson(url, { "User-Agent": "InstituteCRM/1.0" });
  if (!data || data.error) return {};
  return {
    publicIp: data.ip || ipAddress,
    city: data.city || "",
    state: data.region || data.region_code || "",
    country: data.country_name || data.country || "",
    timezone: data.timezone || "",
    latitude: Number.isFinite(Number(data.latitude)) ? Number(data.latitude) : undefined,
    longitude: Number.isFinite(Number(data.longitude)) ? Number(data.longitude) : undefined
  };
}

function normalizeClientLocation(value = {}) {
  const latitude = Number(value.latitude);
  const longitude = Number(value.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return {};
  return {
    latitude,
    longitude,
    accuracy: Number.isFinite(Number(value.accuracy)) ? Number(value.accuracy) : undefined
  };
}

function attendanceType(user) {
  if (user.role === "Student") return "Student";
  if (user.role === "Faculty") return "Faculty";
  return "Staff";
}

function employeeFilter(user, student) {
  return user.role === "Student" ? { student: student?._id } : { user: user._id };
}

async function studentForUser(user) {
  if (user.role !== "Student") return null;
  return Student.findOne({ $or: [{ user: user._id }, { email: user.email }] });
}

async function previousAttendance(user, student) {
  const filter = employeeFilter(user, student);
  if (user.role === "Student" && !student?._id) return null;
  return Attendance.findOne(filter).sort({ date: -1, createdAt: -1 });
}

export function createAttendanceSessionId() {
  return crypto.randomUUID();
}

export async function recordAuthLoginAttendance(user, req, sessionId, clientLocation = {}) {
  if (user.role === "Parent") return null;
  try {
    const now = new Date();
    const student = await studentForUser(user);
    if (user.role === "Student" && !student) return null;

    const rawIp = normalizeIp(clientIp(req));
    const userAgent = req.headers["user-agent"] || req.body?.userAgent || "";
    const parsedAgent = parseUserAgent(userAgent);
    const [geo, previous] = await Promise.all([
      resolveIpGeolocation(rawIp),
      previousAttendance(user, student)
    ]);
    const gps = normalizeClientLocation(clientLocation);
    const filter = {
      ...employeeFilter(user, student),
      date: { $gte: startOfDay(now), $lte: endOfDay(now) }
    };
    const existing = await Attendance.findOne(filter);
    const lateCutoff = new Date(now);
    lateCutoff.setHours(OFFICE_START_HOUR, 0, 0, 0);
    const loginStatus = now > lateCutoff ? "Late" : "Pending Logout";
    const security = {
      differentIp: Boolean(previous?.publicIp && geo.publicIp && previous.publicIp !== geo.publicIp),
      differentBrowser: Boolean(previous?.browser && parsedAgent.browser && previous.browser !== parsedAgent.browser),
      differentDevice: Boolean(previous?.deviceType && parsedAgent.deviceType && previous.deviceType !== parsedAgent.deviceType),
      multipleActiveSessions: Boolean(existing?.loginTime && !existing?.logoutTime),
      differentState: Boolean(previous?.state && geo.state && previous.state !== geo.state),
      differentCountry: Boolean(previous?.country && geo.country && previous.country !== geo.country)
    };
    const location = {
      latitude: gps.latitude ?? geo.latitude,
      longitude: gps.longitude ?? geo.longitude,
      city: geo.city,
      state: geo.state,
      country: geo.country,
      address: [geo.city, geo.state, geo.country].filter(Boolean).join(", ")
    };

    const attendance = existing || new Attendance({
      date: startOfDay(now),
      type: attendanceType(user),
      student: student?._id,
      user: user.role === "Student" ? undefined : user._id,
      batch: student?.batch,
      markedBy: user._id
    });

    if (!attendance.loginTime) attendance.loginTime = now;
    attendance.sessionId = sessionId;
    attendance.status = attendance.logoutTime ? attendance.status : loginStatus;
    attendance.ipAddress = rawIp;
    attendance.publicIp = geo.publicIp || rawIp;
    attendance.browser = parsedAgent.browser;
    attendance.operatingSystem = parsedAgent.operatingSystem;
    attendance.deviceType = parsedAgent.deviceType;
    attendance.userAgent = userAgent;
    attendance.deviceInfo = userAgent;
    attendance.city = geo.city;
    attendance.state = geo.state;
    attendance.country = geo.country;
    attendance.timezone = geo.timezone;
    attendance.latitude = location.latitude;
    attendance.longitude = location.longitude;
    attendance.location = location;
    attendance.security = security;
    attendance.remarks = security.multipleActiveSessions ? "Login recorded; multiple active sessions detected" : "Login recorded automatically";
    await attendance.save();
    return attendance;
  } catch (error) {
    console.error("Attendance login capture failed:", error.message);
    return null;
  }
}

export async function recordAuthLogoutAttendance(user, req, clientLocation = {}) {
  if (user.role === "Parent") return null;
  try {
    const now = new Date();
    const student = await studentForUser(user);
    if (user.role === "Student" && !student) return null;
    const filter = {
      ...employeeFilter(user, student),
      date: { $gte: startOfDay(now), $lte: endOfDay(now) },
      loginTime: { $exists: true },
      logoutTime: { $exists: false }
    };
    const attendance = await Attendance.findOne(req.sessionId ? { ...filter, sessionId: req.sessionId } : filter) || await Attendance.findOne(filter).sort({ loginTime: -1 });
    if (!attendance) return null;

    const rawIp = normalizeIp(clientIp(req));
    const userAgent = req.headers["user-agent"] || req.body?.userAgent || attendance.userAgent || "";
    const parsedAgent = parseUserAgent(userAgent);
    const geo = await resolveIpGeolocation(rawIp);
    const gps = normalizeClientLocation(clientLocation);
    attendance.logoutTime = now;
    attendance.totalWorkingMinutes = Math.max(Math.round((now - attendance.loginTime) / 60000), 0);
    const requiredMinutes = REQUIRED_WORKING_HOURS * 60;
    if (attendance.totalWorkingMinutes < requiredMinutes / 2) attendance.status = "Half Day";
    else if (attendance.status !== "Late") attendance.status = "Present";
    attendance.ipAddress = rawIp || attendance.ipAddress;
    attendance.publicIp = geo.publicIp || attendance.publicIp || rawIp;
    attendance.browser = parsedAgent.browser || attendance.browser;
    attendance.operatingSystem = parsedAgent.operatingSystem || attendance.operatingSystem;
    attendance.deviceType = parsedAgent.deviceType || attendance.deviceType;
    attendance.userAgent = userAgent;
    attendance.deviceInfo = userAgent;
    attendance.city = geo.city || attendance.city;
    attendance.state = geo.state || attendance.state;
    attendance.country = geo.country || attendance.country;
    attendance.timezone = geo.timezone || attendance.timezone;
    attendance.latitude = gps.latitude ?? geo.latitude ?? attendance.latitude;
    attendance.longitude = gps.longitude ?? geo.longitude ?? attendance.longitude;
    attendance.location = {
      latitude: attendance.latitude,
      longitude: attendance.longitude,
      city: attendance.city,
      state: attendance.state,
      country: attendance.country,
      address: [attendance.city, attendance.state, attendance.country].filter(Boolean).join(", ") || attendance.location?.address
    };
    attendance.remarks = attendance.status === "Half Day" ? "Logout recorded automatically; half-day due to low working hours" : "Logout recorded automatically";
    await attendance.save();
    return attendance;
  } catch (error) {
    console.error("Attendance logout capture failed:", error.message);
    return null;
  }
}
