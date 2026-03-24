import { Router } from "express";
import {
  createCamp,
  getAllCamps,
  getCampById,
  updateCamp,
  deleteCamp,
  getCampsByVillage,
  getWorkerCampStats,
} from "../controllers/camp.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin, isHealthWorker, isAdminOrHealthWorker } from "../middlewares/role.middleware.js";

const router = Router();

// ── Public Read Routes (No token needed) ─────────────────────────────────────

// GET /api/camps/village/:villageId → All camps for a village
router.get("/village/:villageId", getCampsByVillage);

// ── Protected Routes (Token required) ────────────────────────────────────────

// GET /api/camps/stats/worker → Worker ka camp stats (dashboard ke liye)
router.get("/stats/worker", verifyJWT, isHealthWorker, getWorkerCampStats);

// GET /api/camps → Admin sees all, Worker sees own camps (filter inside controller)
router.get("/", verifyJWT, isAdminOrHealthWorker, getAllCamps);

// GET /api/camps/:campId → Single camp detail
router.get("/:campId", getCampById);

// POST /api/camps → Health worker creates a camp
router.post("/", verifyJWT, isHealthWorker, createCamp);

// PATCH /api/camps/:campId → Update camp (worker = own, admin = any)
router.patch("/:campId", verifyJWT, isAdminOrHealthWorker, updateCamp);

// DELETE /api/camps/:campId → Delete camp
router.delete("/:campId", verifyJWT, isAdminOrHealthWorker, deleteCamp);

export default router;