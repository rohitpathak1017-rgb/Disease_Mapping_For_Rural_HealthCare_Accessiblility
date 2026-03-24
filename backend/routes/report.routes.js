import { Router } from "express";
import {
  submitReport,
  getAllReports,
  getReportById,
  updateReport,
  reviewReport,
  getVillageChartData,
  getOverallStats,
} from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin, isHealthWorker, isAdminOrHealthWorker } from "../middlewares/role.middleware.js";

const router = Router();

router.use(verifyJWT);

// Stats
router.get("/stats/village/:villageId", getVillageChartData);
router.get("/stats/overview", isAdmin, getOverallStats);

// Health Worker
router.post("/", isHealthWorker, submitReport);
router.patch("/:reportId", isHealthWorker, updateReport);

// Admin + Worker
router.get("/", isAdminOrHealthWorker, getAllReports);
router.get("/:reportId", isAdminOrHealthWorker, getReportById);

// Admin Only
router.patch("/:reportId/review", isAdmin, reviewReport);

export default router;