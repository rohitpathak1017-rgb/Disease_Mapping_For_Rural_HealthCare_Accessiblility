import api from "./api.js";

// ── Create Camp ───────────────────────────────────────────────────────────────
export const createCamp = async (campData) => {
  const response = await api.post("/camps", campData);
  return response.data;
};

// ── Get All Camps (Admin sees all, Worker sees own) ───────────────────────────
export const getAllCamps = async (filters = {}) => {
  // filters: { villageId, status, workerId }
  const response = await api.get("/camps", { params: filters });
  return response.data;
};

// ── Get Camps By Village (Public) ─────────────────────────────────────────────
export const getCampsByVillage = async (villageId) => {
  const response = await api.get(`/camps/village/${villageId}`);
  return response.data;
};

// ── Get Single Camp ───────────────────────────────────────────────────────────
export const getCampById = async (campId) => {
  const response = await api.get(`/camps/${campId}`);
  return response.data;
};

// ── Update Camp ───────────────────────────────────────────────────────────────
export const updateCamp = async (campId, campData) => {
  const response = await api.patch(`/camps/${campId}`, campData);
  return response.data;
};

// ── Delete Camp ───────────────────────────────────────────────────────────────
export const deleteCamp = async (campId) => {
  const response = await api.delete(`/camps/${campId}`);
  return response.data;
};

// ── Worker Camp Stats (Dashboard) ─────────────────────────────────────────────
export const getWorkerCampStats = async () => {
  const response = await api.get("/camps/stats/worker");
  return response.data;
};