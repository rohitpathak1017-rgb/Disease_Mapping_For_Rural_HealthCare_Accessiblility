import User from "../models/User.model.js";
import Village from "../models/Village.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler } from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new Health Worker account (Admin only)
// @route   POST /api/admin/create-worker
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const createHealthWorker = asyncHandler(async (req, res) => {
  const { name, email, password, phone, qualification, employeeId } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }

  const worker = await User.create({
    name,
    email,
    password,
    phone,
    qualification,
    employeeId,
    role: "healthworker",
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, worker.toSafeObject(), "Health worker created successfully")
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all health workers
// @route   GET /api/admin/workers
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getAllWorkers = asyncHandler(async (req, res) => {
  const workers = await User.find({ role: "healthworker" })
    .populate("assignedVillage", "villageName district state subdistrict")
    .select("-refreshToken")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, workers, "Health workers fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single health worker by ID
// @route   GET /api/admin/workers/:workerId
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getWorkerById = asyncHandler(async (req, res) => {
  const worker = await User.findOne({
    _id: req.params.workerId,
    role: "healthworker",
  })
    .populate("assignedVillage", "villageName district state subdistrict")
    .select("-refreshToken");

  if (!worker) throw new ApiError(404, "Health worker not found");

  return res
    .status(200)
    .json(new ApiResponse(200, worker, "Worker details fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Assign health worker to a village
// @route   PUT /api/admin/assign-worker
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const assignWorkerToVillage = asyncHandler(async (req, res) => {
  const { workerId, villageId } = req.body;

  if (!workerId || !villageId) {
    throw new ApiError(400, "workerId and villageId are required");
  }

  // Validate worker
  const worker = await User.findOne({ _id: workerId, role: "healthworker" });
  if (!worker) throw new ApiError(404, "Health worker not found");

  // Validate village
  const village = await Village.findById(villageId);
  if (!village) throw new ApiError(404, "Village not found");

  // Check: village already has a different worker assigned
  if (
    village.assignedHealthWorker &&
    village.assignedHealthWorker.toString() !== workerId
  ) {
    throw new ApiError(
      409,
      "Village already has a health worker assigned. Unassign first."
    );
  }

  // Remove old village assignment from previous village (if any)
  if (worker.assignedVillage) {
    await Village.findByIdAndUpdate(worker.assignedVillage, {
      assignedHealthWorker: null,
    });
  }

  // Update worker
  worker.assignedVillage = villageId;
  await worker.save();

  // Update village
  village.assignedHealthWorker = workerId;
  await village.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { worker, village }, "Worker assigned to village successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Unassign health worker from their current village
// @route   PUT /api/admin/unassign-worker/:workerId
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const unassignWorker = asyncHandler(async (req, res) => {
  const worker = await User.findOne({
    _id: req.params.workerId,
    role: "healthworker",
  });

  if (!worker) throw new ApiError(404, "Health worker not found");
  if (!worker.assignedVillage) {
    throw new ApiError(400, "Worker is not assigned to any village");
  }

  // Remove from village
  await Village.findByIdAndUpdate(worker.assignedVillage, {
    assignedHealthWorker: null,
  });

  // Remove from worker
  worker.assignedVillage = null;
  await worker.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Worker unassigned successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update health worker details
// @route   PUT /api/admin/workers/:workerId
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const updateWorker = asyncHandler(async (req, res) => {
  const { name, phone, qualification, employeeId, isActive } = req.body;

  const worker = await User.findOneAndUpdate(
    { _id: req.params.workerId, role: "healthworker" },
    { name, phone, qualification, employeeId, isActive },
    { new: true, runValidators: true }
  ).select("-refreshToken");

  if (!worker) throw new ApiError(404, "Health worker not found");

  return res
    .status(200)
    .json(new ApiResponse(200, worker, "Worker updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete / deactivate a health worker
// @route   DELETE /api/admin/workers/:workerId
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const deleteWorker = asyncHandler(async (req, res) => {
  const worker = await User.findOne({
    _id: req.params.workerId,
    role: "healthworker",
  });

  if (!worker) throw new ApiError(404, "Health worker not found");

  // Soft delete — deactivate instead of removing
  worker.isActive = false;

  // Also clean up village assignment
  if (worker.assignedVillage) {
    await Village.findByIdAndUpdate(worker.assignedVillage, {
      assignedHealthWorker: null,
    });
    worker.assignedVillage = null;
  }

  await worker.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Health worker deactivated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all public users
// @route   GET /api/admin/public-users
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getAllPublicUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "public" })
    .select("-refreshToken")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Public users fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalWorkers, totalVillages, totalPublic, assignedVillages] =
    await Promise.all([
      User.countDocuments({ role: "healthworker", isActive: true }),
      Village.countDocuments({ isActive: true }),
      User.countDocuments({ role: "public" }),
      Village.countDocuments({
        isActive: true,
        assignedHealthWorker: { $ne: null },
      }),
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalWorkers,
        totalVillages,
        totalPublic,
        assignedVillages,
        unassignedVillages: totalVillages - assignedVillages,
      },
      "Dashboard stats fetched"
    )
  );
});