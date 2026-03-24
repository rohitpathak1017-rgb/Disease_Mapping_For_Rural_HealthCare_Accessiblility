import api from "./api.js";

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

// ── Health Worker Management ──────────────────────────────────────────────────
export const createHealthWorker = async (workerData) => {
  const response = await api.post("/admin/workers", workerData);
  return response.data;
};

export const getAllWorkers = async () => {
  const response = await api.get("/admin/workers");
  return response.data;
};

export const getWorkerById = async (workerId) => {
  const response = await api.get(`/admin/workers/${workerId}`);
  return response.data;
};

export const updateWorker = async (workerId, workerData) => {
  const response = await api.patch(`/admin/workers/${workerId}`, workerData);
  return response.data;
};

export const deleteWorker = async (workerId) => {
  const response = await api.delete(`/admin/workers/${workerId}`);
  return response.data;
};

// ── Worker ↔ Village Assignment ───────────────────────────────────────────────
export const assignWorkerToVillage = async (workerId, villageId) => {
  const response = await api.patch(`/admin/workers/${workerId}/assign`, {
    workerId,
    villageId,
  });
  return response.data;
};

export const unassignWorker = async (workerId) => {
  const response = await api.patch(`/admin/workers/${workerId}/unassign`);
  return response.data;
};

// ── Village Management ────────────────────────────────────────────────────────
export const createVillage = async (villageData) => {
  const response = await api.post("/villages", villageData);
  return response.data;
};

export const getAllVillages = async (filters = {}) => {
  // filters: { state, district, subdistrict, assigned }
  const response = await api.get("/villages", { params: filters });
  return response.data;
};

export const getVillageById = async (villageId) => {
  const response = await api.get(`/villages/${villageId}`);
  return response.data;
};

export const updateVillage = async (villageId, villageData) => {
  const response = await api.patch(`/villages/${villageId}`, villageData);
  return response.data;
};

export const deleteVillage = async (villageId) => {
  const response = await api.delete(`/villages/${villageId}`);
  return response.data;
};

// ── Village Meta (Dropdowns) ──────────────────────────────────────────────────
export const getStates = async () => {
  const response = await api.get("/villages/meta/states");
  return response.data;
};

export const getDistrictsByState = async (state) => {
  const response = await api.get("/villages/meta/districts", {
    params: { state },
  });
  return response.data;
};

export const getSubdistrictsByDistrict = async (state, district) => {
  const response = await api.get("/villages/meta/subdistricts", {
    params: { state, district },
  });
  return response.data;
};

// ── Disease Management ────────────────────────────────────────────────────────
export const createDisease = async (diseaseData) => {
  const response = await api.post("/diseases", diseaseData);
  return response.data;
};

export const getAllDiseases = async () => {
  const response = await api.get("/diseases");
  return response.data;
};

export const getDiseaseById = async (diseaseId) => {
  const response = await api.get(`/diseases/${diseaseId}`);
  return response.data;
};

export const updateDisease = async (diseaseId, diseaseData) => {
  const response = await api.patch(`/diseases/${diseaseId}`, diseaseData);
  return response.data;
};

export const deleteDisease = async (diseaseId) => {
  const response = await api.delete(`/diseases/${diseaseId}`);
  return response.data;
};

// ── Public Users ──────────────────────────────────────────────────────────────
export const getAllPublicUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};