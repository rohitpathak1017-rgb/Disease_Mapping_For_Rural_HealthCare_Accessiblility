import { Router } from "express";
import {
  submitFeedback,
  getFeedbackForWorker,
  getAllFeedbacks,
  getFeedbackById,
  toggleFeedbackApproval,
  deleteFeedback,
  getWorkerRatingStats,
} from "../controllers/feedback.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin, isHealthWorker, isPublic } from "../middlewares/role.middleware.js";

const router = Router();

// ── All feedback routes require login ─────────────────────────────────────────
router.use(verifyJWT);

// ── Stats Route (Admin + Worker + Public) ─────────────────────────────────────
// GET /api/feedback/stats/:workerId → Avg rating, breakdown for a worker
router.get("/stats/:workerId", getWorkerRatingStats);

// ── Public User Routes ────────────────────────────────────────────────────────
// POST /api/feedback → Public submits feedback to a health worker
router.post("/", isPublic, submitFeedback);

// ── Health Worker Routes ──────────────────────────────────────────────────────
// GET /api/feedback/worker/:workerId → Worker sees their own received feedback
router.get("/worker/:workerId", isHealthWorker, getFeedbackForWorker);

// ── Admin Routes ──────────────────────────────────────────────────────────────
// GET /api/feedback → Admin sees ALL feedbacks
router.get("/", isAdmin, getAllFeedbacks);

// GET /api/feedback/:feedbackId → Single feedback detail
router.get("/:feedbackId", getFeedbackById);

// PATCH /api/feedback/:feedbackId/toggle-approval → Admin approve/hide feedback
router.patch("/:feedbackId/toggle-approval", isAdmin, toggleFeedbackApproval);

// DELETE /api/feedback/:feedbackId → Admin or feedback owner deletes
router.delete("/:feedbackId", deleteFeedback);

export default router;