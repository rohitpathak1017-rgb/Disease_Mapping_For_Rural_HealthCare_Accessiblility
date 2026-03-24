import { Router } from "express";
import {
  createDisease,
  getAllDiseases,
  getDiseaseById,
  updateDisease,
  deleteDisease,
  getDiseasesByCategory,
} from "../controllers/disease.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// ── Public Read Routes (No token needed) ─────────────────────────────────────
// Anyone can browse the disease master list

// GET /api/diseases               → Get all diseases (optional ?category= filter)
router.get("/", getAllDiseases);

// GET /api/diseases/:id           → Get single disease detail
router.get("/:id", getDiseaseById);

// GET /api/diseases/category/:category → Get diseases by category
// e.g. /api/diseases/category/Vector-Borne
router.get("/category/:category", getDiseasesByCategory);

// ── Admin Only Routes ─────────────────────────────────────────────────────────

// POST /api/diseases              → Admin creates disease in master list
router.post("/", verifyJWT, isAdmin, createDisease);

// PATCH /api/diseases/:id         → Admin updates disease info
router.patch("/:id", verifyJWT, isAdmin, updateDisease);

// DELETE /api/diseases/:id        → Admin soft deletes a disease
router.delete("/:id", verifyJWT, isAdmin, deleteDisease);

export default router;