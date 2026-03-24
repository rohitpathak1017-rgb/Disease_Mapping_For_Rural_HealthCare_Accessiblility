import { Router } from "express";
import {
  registerPublicUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getMyProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ── Public Routes (No token needed) ──────────────────────────────────────────

// POST /api/auth/register  → Public user self-registration
router.post("/register", registerPublicUser);

// POST /api/auth/login  → All 3 roles login here (role detected from DB)
router.post("/login", loginUser);

// POST /api/auth/refresh-token  → Get new access token using refresh token
router.post("/refresh-token", refreshAccessToken);

// ── Protected Routes (Token required) ────────────────────────────────────────

// POST /api/auth/logout  → Invalidate refresh token in DB + clear cookies
router.post("/logout", verifyJWT, logoutUser);

// GET /api/auth/me  → Get logged-in user's own profile
router.get("/me", verifyJWT, getMyProfile);

// PATCH /api/auth/change-password  → Change own password
router.patch("/change-password", verifyJWT, changePassword);

export default router;