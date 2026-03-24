import api from "./api.js";

// ── Submit Disease Report ─────────────────────────────────────────────────────
export const submitReport = async (reportData) => {
  const response = await api.post("/reports", reportData);
  return response.data;
};

// ── Get All Reports (Admin: all | Worker: own) ────────────────────────────────
export const getAllReports = async (filters = {}) => {
  // filters: { villageId, month, year, isReviewed }
  const response = await api.get("/reports", { params: filters });
  return response.data;
};

// ── Get Single Report ─────────────────────────────────────────────────────────
export const getReportById = async (reportId) => {
  const response = await api.get(`/reports/${reportId}`);
  return response.data;
};

// ── Update Report ─────────────────────────────────────────────────────────────
export const updateReport = async (reportId, reportData) => {
  const response = await api.patch(`/reports/${reportId}`, reportData);
  return response.data;
};

// ── Admin Review Report ───────────────────────────────────────────────────────
export const reviewReport = async (reportId) => {
  const response = await api.patch(`/reports/${reportId}/review`);
  return response.data;
};

// ── Village Chart Data ────────────────────────────────────────────────────────
export const getVillageChartData = async (villageId, year) => {
  const response = await api.get(`/reports/stats/village/${villageId}`, {
    params: year ? { year } : {},
  });
  return response.data;
};

// ── Overall Stats (Admin Dashboard Charts) ────────────────────────────────────
export const getOverallStats = async (year) => {
  const response = await api.get("/reports/stats/overview", {
    params: year ? { year } : {},
  });
  return response.data;
};