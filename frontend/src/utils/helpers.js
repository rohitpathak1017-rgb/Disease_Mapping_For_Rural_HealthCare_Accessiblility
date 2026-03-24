import { MONTHS } from "./constants.js";

// ── Date Formatting ───────────────────────────────────────────────────────────
// "2026-03-22T17:45:15.189Z" → "22 March 2026"
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "long",
    year:  "numeric",
  });
};

// "2026-03-22T17:45:15.189Z" → "22 Mar 2026, 11:15 PM"
export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
};

// ── Month Helpers ─────────────────────────────────────────────────────────────
// 3 → "March"
export const getMonthName = (monthNumber) => {
  const month = MONTHS.find((m) => m.value === monthNumber);
  return month ? month.label : "N/A";
};

// "March 2026"
export const formatMonthYear = (month, year) => {
  return `${getMonthName(month)} ${year}`;
};

// ── String Helpers ────────────────────────────────────────────────────────────
// "uttar pradesh" → "Uttar Pradesh"
export const capitalize = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// "Vector-Borne" → "vector-borne"
export const toLowerCase = (str) => {
  if (!str) return "";
  return str.toLowerCase();
};

// ── Location Helpers ──────────────────────────────────────────────────────────
// { state, district, subdistrict, villageName } → "Lalapur, Soraon, Prayagraj, UP"
export const formatLocation = (village) => {
  if (!village) return "N/A";
  const parts = [
    village.villageName,
    village.subdistrict,
    village.district,
    village.state,
  ].filter(Boolean);
  return parts.join(", ");
};

// ── Number Helpers ────────────────────────────────────────────────────────────
// 45000 → "45,000"
export const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";
  return num.toLocaleString("en-IN");
};

// 4.666666 → "4.7"
export const roundToOne = (num) => {
  if (!num) return 0;
  return Math.round(num * 10) / 10;
};

// ── Rating Helpers ────────────────────────────────────────────────────────────
// 4 → "⭐⭐⭐⭐"
export const getRatingStars = (rating) => {
  return "⭐".repeat(Math.round(rating));
};

// ── Severity Color ────────────────────────────────────────────────────────────
// Used for badge colors in UI
export const getSeverityColor = (severity) => {
  const map = {
    Low:      "green",
    Medium:   "yellow",
    High:     "orange",
    Critical: "red",
  };
  return map[severity] || "gray";
};

// ── Camp Status Color ─────────────────────────────────────────────────────────
export const getCampStatusColor = (status) => {
  const map = {
    Scheduled: "blue",
    Ongoing:   "green",
    Completed: "gray",
    Cancelled: "red",
  };
  return map[status] || "gray";
};

// ── Token Helpers ─────────────────────────────────────────────────────────────
// Store token in localStorage
export const setToken = (token) => {
  localStorage.setItem("accessToken", token);
};

export const getToken = () => {
  return localStorage.getItem("accessToken");
};

export const removeToken = () => {
  localStorage.removeItem("accessToken");
};

// ── Error Message Extractor ───────────────────────────────────────────────────
// Extract readable error message from axios error
export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
};