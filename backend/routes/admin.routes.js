import { Router } from "express";
import {
  createHealthWorker,
  getAllWorkers,
  getWorkerById,
  assignWorkerToVillage,
  unassignWorker,
  updateWorker,
  deleteWorker,
  getAllPublicUsers,
  getDashboardStats,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// All admin routes need: valid token + admin role
router.use(verifyJWT, isAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Health Worker Management
router.post("/workers",            createHealthWorker);
router.get("/workers",             getAllWorkers);
router.get("/workers/:id",         getWorkerById);
router.patch("/workers/:id",       updateWorker);
router.delete("/workers/:id",      deleteWorker);

// Worker ↔ Village Assignment
router.patch("/workers/:id/assign",   assignWorkerToVillage);
router.patch("/workers/:id/unassign", unassignWorker);

// Public User Management
router.get("/users", getAllPublicUsers);

export default router;