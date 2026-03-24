import api from "./api.js";
import { setToken, removeToken } from "../utils/helpers.js";

// ── Register Public User ──────────────────────────────────────────────────────
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  const { accessToken } = response.data.data;
  setToken(accessToken);
  return response.data;
};

// ── Login (All Roles) ─────────────────────────────────────────────────────────
export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  const { accessToken } = response.data.data;
  setToken(accessToken);
  return response.data;
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logoutUser = async () => {
  await api.post("/auth/logout");
  removeToken();
};

// ── Get My Profile ────────────────────────────────────────────────────────────
export const getMyProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// ── Change Password ───────────────────────────────────────────────────────────
export const changePassword = async (passwordData) => {
  // passwordData = { oldPassword, newPassword }
  const response = await api.patch("/auth/change-password", passwordData);
  return response.data;
};

// ── Refresh Token ─────────────────────────────────────────────────────────────
export const refreshToken = async () => {
  const response = await api.post("/auth/refresh-token");
  const { accessToken } = response.data.data;
  setToken(accessToken);
  return response.data;
};