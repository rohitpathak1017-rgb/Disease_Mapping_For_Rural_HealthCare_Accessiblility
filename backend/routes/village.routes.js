import { Router } from "express";
import {
  createVillage,
  getAllVillages,
  getVillageById,
  updateVillage,
  deleteVillage,
  getStates,
  getDistrictsByState,
  getSubdistrictsByDistrict,
} from "../controllers/village.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// ── Meta / Dropdown Routes (No token needed) ──────────────────────────────────
// GET /api/villages/meta/states
router.get("/meta/states",        getStates);

// GET /api/villages/meta/districts?state=Uttar Pradesh
router.get("/meta/districts",     getDistrictsByState);

// GET /api/villages/meta/subdistricts?state=UP&district=Allahabad
router.get("/meta/subdistricts",  getSubdistrictsByDistrict);

// ── Public Read Routes (No token needed) ─────────────────────────────────────
// GET /api/villages?state=UP&district=Prayagraj&assigned=true
router.get("/",     getAllVillages);

// GET /api/villages/:villageId
router.get("/:villageId", getVillageById);

// ── Admin Only Routes ─────────────────────────────────────────────────────────
// POST /api/villages
router.post("/",            verifyJWT, isAdmin, createVillage);

// PATCH /api/villages/:villageId
router.patch("/:villageId", verifyJWT, isAdmin, updateVillage);

// DELETE /api/villages/:villageId
router.delete("/:villageId", verifyJWT, isAdmin, deleteVillage);

export default router;