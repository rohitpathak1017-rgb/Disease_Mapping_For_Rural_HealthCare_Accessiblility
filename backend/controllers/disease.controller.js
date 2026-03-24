import Disease from "../models/Disease.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler } from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new disease (master list)
// @route   POST /api/disease
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const createDisease = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    symptoms,
    description,
    severity,
    icdCode,
    preventionTips,
  } = req.body;

  if (!name || !category) {
    throw new ApiError(400, "Disease name and category are required");
  }

  const existing = await Disease.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(409, "Disease with this name already exists");
  }

  const disease = await Disease.create({
    name,
    category,
    symptoms,
    description,
    severity,
    icdCode,
    preventionTips,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, disease, "Disease created successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all diseases (with optional filters)
// @route   GET /api/disease
// @access  Admin, HealthWorker, Public
// ─────────────────────────────────────────────────────────────────────────────
export const getAllDiseases = asyncHandler(async (req, res) => {
  const { category, severity, search } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (severity) filter.severity = severity;
  if (search)   filter.name = new RegExp(search, "i");

  const diseases = await Disease.find(filter).sort({ name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, diseases, "Diseases fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single disease by ID
// @route   GET /api/disease/:diseaseId
// @access  All
// ─────────────────────────────────────────────────────────────────────────────
export const getDiseaseById = asyncHandler(async (req, res) => {
  const disease = await Disease.findById(req.params.diseaseId);
  if (!disease) throw new ApiError(404, "Disease not found");

  return res
    .status(200)
    .json(new ApiResponse(200, disease, "Disease details fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update disease details
// @route   PUT /api/disease/:diseaseId
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const updateDisease = asyncHandler(async (req, res) => {
  const {
    name,
    category,
    symptoms,
    description,
    severity,
    icdCode,
    preventionTips,
    isActive,
  } = req.body;

  const disease = await Disease.findByIdAndUpdate(
    req.params.diseaseId,
    {
      name,
      category,
      symptoms,
      description,
      severity,
      icdCode,
      preventionTips,
      isActive,
    },
    { new: true, runValidators: true }
  );

  if (!disease) throw new ApiError(404, "Disease not found");

  return res
    .status(200)
    .json(new ApiResponse(200, disease, "Disease updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete disease (soft delete)
// @route   DELETE /api/disease/:diseaseId
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const deleteDisease = asyncHandler(async (req, res) => {
  const disease = await Disease.findByIdAndUpdate(
    req.params.diseaseId,
    { isActive: false },
    { new: true }
  );

  if (!disease) throw new ApiError(404, "Disease not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Disease removed from master list"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get diseases grouped by category (for charts)
// @route   GET /api/disease/stats/by-category
// @access  Admin, HealthWorker
// ─────────────────────────────────────────────────────────────────────────────
export const getDiseasesByCategory = asyncHandler(async (req, res) => {
  const stats = await Disease.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        diseases: { $push: { name: "$name", severity: "$severity" } },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Disease category stats fetched"));
});