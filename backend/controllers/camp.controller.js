import Camp from "../models/Camp.model.js";
import Village from "../models/Village.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler } from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new camp
// @route   POST /api/camp
// @access  HealthWorker
// ─────────────────────────────────────────────────────────────────────────────
export const createCamp = asyncHandler(async (req, res) => {
  const {
    campName,
    villageId,
    campDate,
    startTime,
    endTime,
    servicesOffered,
    targetedDiseases,
    activitiesDone,
    notes,
  } = req.body;

  if (!campName || !villageId || !campDate) {
    throw new ApiError(400, "Camp name, village and camp date are required");
  }

  // Health worker can only create camp in their assigned village
  const worker = req.user;
  if (
    worker.role === "healthworker" &&
    worker.assignedVillage?.toString() !== villageId
  ) {
    throw new ApiError(
      403,
      "You can only create camps for your assigned village"
    );
  }

  const village = await Village.findById(villageId);
  if (!village) throw new ApiError(404, "Village not found");

  const camp = await Camp.create({
    campName,
    village: villageId,
    healthWorker: worker._id,
    campDate,
    startTime,
    endTime,
    servicesOffered,
    targetedDiseases,
    activitiesDone,
    notes,
  });

  await camp.populate([
    { path: "village", select: "villageName district state" },
    { path: "targetedDiseases", select: "name category" },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, camp, "Camp created successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all camps (Admin sees all, Worker sees only their camps)
// @route   GET /api/camp
// @access  Admin, HealthWorker, Public (read)
// ─────────────────────────────────────────────────────────────────────────────
export const getAllCamps = asyncHandler(async (req, res) => {
  const { villageId, status, workerId } = req.query;

  const filter = {};

  // Health worker sees only their own camps
  if (req.user.role === "healthworker") {
    filter.healthWorker = req.user._id;
  }

  if (villageId) filter.village     = villageId;
  if (status)    filter.status      = status;
  if (workerId && req.user.role === "admin") filter.healthWorker = workerId;

  const camps = await Camp.find(filter)
    .populate("village", "villageName district state subdistrict")
    .populate("healthWorker", "name email phone")
    .populate("targetedDiseases", "name category severity")
    .sort({ campDate: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, camps, "Camps fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get camps for a specific village (public-facing)
// @route   GET /api/camp/village/:villageId
// @access  All
// ─────────────────────────────────────────────────────────────────────────────
export const getCampsByVillage = asyncHandler(async (req, res) => {
  const camps = await Camp.find({
    village: req.params.villageId,
    status: { $ne: "Cancelled" },
  })
    .populate("healthWorker", "name phone qualification")
    .populate("targetedDiseases", "name category")
    .sort({ campDate: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, camps, "Village camps fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single camp by ID
// @route   GET /api/camp/:campId
// @access  All
// ─────────────────────────────────────────────────────────────────────────────
export const getCampById = asyncHandler(async (req, res) => {
  const camp = await Camp.findById(req.params.campId)
    .populate("village", "villageName district state subdistrict")
    .populate("healthWorker", "name email phone qualification")
    .populate("targetedDiseases", "name category severity symptoms");

  if (!camp) throw new ApiError(404, "Camp not found");

  return res
    .status(200)
    .json(new ApiResponse(200, camp, "Camp details fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update camp details / add services / activities
// @route   PUT /api/camp/:campId
// @access  HealthWorker (own camp), Admin
// ─────────────────────────────────────────────────────────────────────────────
export const updateCamp = asyncHandler(async (req, res) => {
  const camp = await Camp.findById(req.params.campId);
  if (!camp) throw new ApiError(404, "Camp not found");

  // Health worker can only update their own camp
  if (
    req.user.role === "healthworker" &&
    camp.healthWorker.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You can only update your own camps");
  }

  const {
    campName,
    campDate,
    startTime,
    endTime,
    servicesOffered,
    targetedDiseases,
    activitiesDone,
    medicinesDistributed,
    patientsAttended,
    status,
    notes,
  } = req.body;

  const updatedCamp = await Camp.findByIdAndUpdate(
    req.params.campId,
    {
      campName,
      campDate,
      startTime,
      endTime,
      servicesOffered,
      targetedDiseases,
      activitiesDone,
      medicinesDistributed,
      patientsAttended,
      status,
      notes,
    },
    { new: true, runValidators: true }
  )
    .populate("village", "villageName district state")
    .populate("targetedDiseases", "name category");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCamp, "Camp updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete camp
// @route   DELETE /api/camp/:campId
// @access  Admin, HealthWorker (own)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteCamp = asyncHandler(async (req, res) => {
  const camp = await Camp.findById(req.params.campId);
  if (!camp) throw new ApiError(404, "Camp not found");

  if (
    req.user.role === "healthworker" &&
    camp.healthWorker.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You can only delete your own camps");
  }

  await Camp.findByIdAndDelete(req.params.campId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Camp deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get camp statistics for health worker dashboard
// @route   GET /api/camp/stats/worker
// @access  HealthWorker
// ─────────────────────────────────────────────────────────────────────────────
export const getWorkerCampStats = asyncHandler(async (req, res) => {
  const stats = await Camp.aggregate([
    { $match: { healthWorker: req.user._id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalPatients: { $sum: "$patientsAttended" },
      },
    },
  ]);

  const totalCamps = await Camp.countDocuments({ healthWorker: req.user._id });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { stats, totalCamps }, "Camp stats fetched")
    );
});