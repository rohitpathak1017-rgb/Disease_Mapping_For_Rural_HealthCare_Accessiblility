import Village from "../models/Village.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler } from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new village
// @route   POST /api/village
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const createVillage = asyncHandler(async (req, res) => {
  const { state, district, subdistrict, villageName, pincode, population } =
    req.body;

  if (!state || !district || !subdistrict || !villageName) {
    throw new ApiError(
      400,
      "State, district, subdistrict and village name are required"
    );
  }

  const existing = await Village.findOne({
    state: state.trim(),
    district: district.trim(),
    subdistrict: subdistrict.trim(),
    villageName: villageName.trim(),
  });

  if (existing) {
    throw new ApiError(409, "Village already exists with this location");
  }

  const village = await Village.create({
    state,
    district,
    subdistrict,
    villageName,
    pincode,
    population,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, village, "Village created successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all villages (with optional filters)
// @route   GET /api/village
// @access  Admin, HealthWorker, Public
// ─────────────────────────────────────────────────────────────────────────────
export const getAllVillages = asyncHandler(async (req, res) => {
  const { state, district, subdistrict, assigned } = req.query;

  const filter = { isActive: true };

  if (state)       filter.state       = new RegExp(state, "i");
  if (district)    filter.district    = new RegExp(district, "i");
  if (subdistrict) filter.subdistrict = new RegExp(subdistrict, "i");

  // assigned=true → only villages that have a health worker
  // assigned=false → only unassigned villages
  if (assigned === "true")  filter.assignedHealthWorker = { $ne: null };
  if (assigned === "false") filter.assignedHealthWorker = null;

  const villages = await Village.find(filter)
    .populate("assignedHealthWorker", "name email phone qualification")
    .populate("activeDiseases", "name category severity")
    .sort({ state: 1, district: 1, villageName: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, villages, "Villages fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single village by ID
// @route   GET /api/village/:villageId
// @access  Admin, HealthWorker, Public
// ─────────────────────────────────────────────────────────────────────────────
export const getVillageById = asyncHandler(async (req, res) => {
  const village = await Village.findById(req.params.villageId)
    .populate("assignedHealthWorker", "name email phone qualification employeeId")
    .populate("activeDiseases", "name category severity symptoms");

  if (!village) throw new ApiError(404, "Village not found");

  return res
    .status(200)
    .json(new ApiResponse(200, village, "Village details fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update village details
// @route   PUT /api/village/:villageId
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const updateVillage = asyncHandler(async (req, res) => {
  const { state, district, subdistrict, villageName, pincode, population, isActive } =
    req.body;

  const village = await Village.findByIdAndUpdate(
    req.params.villageId,
    { state, district, subdistrict, villageName, pincode, population, isActive },
    { new: true, runValidators: true }
  );

  if (!village) throw new ApiError(404, "Village not found");

  return res
    .status(200)
    .json(new ApiResponse(200, village, "Village updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete village (soft delete)
// @route   DELETE /api/village/:villageId
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const deleteVillage = asyncHandler(async (req, res) => {
  const village = await Village.findByIdAndUpdate(
    req.params.villageId,
    { isActive: false },
    { new: true }
  );

  if (!village) throw new ApiError(404, "Village not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Village deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get distinct states list (for dropdowns)
// @route   GET /api/village/meta/states
// @access  All
// ─────────────────────────────────────────────────────────────────────────────
export const getStates = asyncHandler(async (req, res) => {
  const states = await Village.distinct("state", { isActive: true });
  return res.status(200).json(new ApiResponse(200, states, "States fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get districts by state (for dropdowns)
// @route   GET /api/village/meta/districts?state=Uttar Pradesh
// @access  All
// ─────────────────────────────────────────────────────────────────────────────
export const getDistrictsByState = asyncHandler(async (req, res) => {
  const { state } = req.query;
  if (!state) throw new ApiError(400, "State query param is required");

  const districts = await Village.distinct("district", {
    state: new RegExp(state, "i"),
    isActive: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, districts, "Districts fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get subdistricts by district (for dropdowns)
// @route   GET /api/village/meta/subdistricts?state=UP&district=Allahabad
// @access  All
// ─────────────────────────────────────────────────────────────────────────────
export const getSubdistrictsByDistrict = asyncHandler(async (req, res) => {
  const { state, district } = req.query;
  if (!state || !district) {
    throw new ApiError(400, "State and district query params are required");
  }

  const subdistricts = await Village.distinct("subdistrict", {
    state:    new RegExp(state, "i"),
    district: new RegExp(district, "i"),
    isActive: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, subdistricts, "Subdistricts fetched"));
});