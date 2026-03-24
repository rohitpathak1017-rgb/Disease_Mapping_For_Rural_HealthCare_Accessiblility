import api from "./api.js";

// ── Submit Feedback (Public) ──────────────────────────────────────────────────
export const submitFeedback = async (feedbackData) => {
  const response = await api.post("/feedback", feedbackData);
  return response.data;
};

// ── Get Feedback For Worker ───────────────────────────────────────────────────
export const getFeedbackForWorker = async (workerId, filters = {}) => {
  // filters: { category, rating }
  const response = await api.get(`/feedback/worker/${workerId}`, {
    params: filters,
  });
  return response.data;
};

// ── Get All Feedbacks (Admin) ─────────────────────────────────────────────────
export const getAllFeedbacks = async (filters = {}) => {
  // filters: { villageId, isApproved, rating }
  const response = await api.get("/feedback", { params: filters });
  return response.data;
};

// ── Get Single Feedback ───────────────────────────────────────────────────────
export const getFeedbackById = async (feedbackId) => {
  const response = await api.get(`/feedback/${feedbackId}`);
  return response.data;
};

// ── Toggle Feedback Approval (Admin) ─────────────────────────────────────────
export const toggleFeedbackApproval = async (feedbackId) => {
  const response = await api.patch(`/feedback/${feedbackId}/toggle-approval`);
  return response.data;
};

// ── Delete Feedback ───────────────────────────────────────────────────────────
export const deleteFeedback = async (feedbackId) => {
  const response = await api.delete(`/feedback/${feedbackId}`);
  return response.data;
};

// ── Worker Rating Stats ───────────────────────────────────────────────────────
export const getWorkerRatingStats = async (workerId) => {
  const response = await api.get(`/feedback/stats/${workerId}`);
  return response.data;
};