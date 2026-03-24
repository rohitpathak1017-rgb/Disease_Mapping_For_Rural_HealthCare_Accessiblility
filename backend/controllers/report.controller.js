import DiseaseReport from "../models/DiseaseReport.model.js";
import Village from "../models/Village.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler } from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit a disease report for the assigned village
// @route   POST /api/report
// @access  HealthWorker
// ─────────────────────────────────────────────────────────────────────────────
export const submitReport = asyncHandler(async (req, res) => {
  const {
    villageId,
    reportMonth,
    reportYear,
    diseases,
    generalObservations,
    linkedCamp,
  } = req.body;

  if (!villageId || !reportMonth || !reportYear || !diseases?.length) {
    throw new ApiError(
      400,
      "Village, report period and at least one disease entry are required"
    );
  }

  // Health worker can only report for their assigned village
  if (
    req.user.role === "healthworker" &&
    req.user.assignedVillage?.toString() !== villageId
  ) {
    throw new ApiError(403, "You can only report for your assigned village");
  }

  // Check: duplicate report for same village/month/year
  const existing = await DiseaseReport.findOne({
    submittedBy: req.user._id,
    village: villageId,
    reportMonth,
    reportYear,
  });

  if (existing) {
    throw new ApiError(
      409,
      `Report for ${reportMonth}/${reportYear} already submitted for this village`
    );
  }

  const report = await DiseaseReport.create({
    submittedBy: req.user._id,
    village: villageId,
    reportMonth,
    reportYear,
    diseases,
    generalObservations,
    linkedCamp: linkedCamp || null,
  });

  // Update village's activeDiseases list
  const diseaseIds = diseases.map((d) => d.disease);
  await Village.findByIdAndUpdate(villageId, {
    $addToSet: { activeDiseases: { $each: diseaseIds } },
  });

  await report.populate([
    { path: "village", select: "villageName district state" },
    { path: "diseases.disease", select: "name category severity" },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, report, "Disease report submitted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all reports (Admin: all | Worker: their own)
// @route   GET /api/report
// @access  Admin, HealthWorker
// ─────────────────────────────────────────────────────────────────────────────
export const getAllReports = asyncHandler(async (req, res) => {
  const { villageId, month, year, isReviewed } = req.query;
  const filter = {};

  if (req.user.role === "healthworker") {
    filter.submittedBy = req.user._id;
  }

  if (villageId)  filter.village     = villageId;
  if (month)      filter.reportMonth = Number(month);
  if (year)       filter.reportYear  = Number(year);
  if (isReviewed !== undefined) filter.isReviewed = isReviewed === "true";

  const reports = await DiseaseReport.find(filter)
    .populate("submittedBy", "name email")
    .populate("village", "villageName district state subdistrict")
    .populate("diseases.disease", "name category severity")
    .populate("linkedCamp", "campName campDate status")
    .sort({ reportYear: -1, reportMonth: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, reports, "Reports fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single report by ID
// @route   GET /api/report/:reportId
// @access  Admin, HealthWorker (own)
// ─────────────────────────────────────────────────────────────────────────────
export const getReportById = asyncHandler(async (req, res) => {
  const report = await DiseaseReport.findById(req.params.reportId)
    .populate("submittedBy", "name email phone qualification")
    .populate("village", "villageName district state subdistrict population")
    .populate("diseases.disease", "name category severity symptoms")
    .populate("linkedCamp", "campName campDate servicesOffered status");

  if (!report) throw new ApiError(404, "Report not found");

  // HealthWorker can only view their own reports
  if (
    req.user.role === "healthworker" &&
    report.submittedBy._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, report, "Report details fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update/edit a submitted report (only before it's reviewed)
// @route   PUT /api/report/:reportId
// @access  HealthWorker (own report only)
// ─────────────────────────────────────────────────────────────────────────────
export const updateReport = asyncHandler(async (req, res) => {
  const report = await DiseaseReport.findById(req.params.reportId);
  if (!report) throw new ApiError(404, "Report not found");

  if (report.submittedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own reports");
  }

  if (report.isReviewed) {
    throw new ApiError(
      400,
      "Cannot edit a report that has already been reviewed by admin"
    );
  }

  const { diseases, generalObservations, linkedCamp } = req.body;

  report.diseases = diseases ?? report.diseases;
  report.generalObservations = generalObservations ?? report.generalObservations;
  report.linkedCamp = linkedCamp ?? report.linkedCamp;

  await report.save();

  return res
    .status(200)
    .json(new ApiResponse(200, report, "Report updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Admin marks a report as reviewed
// @route   PUT /api/report/:reportId/review
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const reviewReport = asyncHandler(async (req, res) => {
  const report = await DiseaseReport.findByIdAndUpdate(
    req.params.reportId,
    { isReviewed: true, reviewedBy: req.user._id },
    { new: true }
  );

  if (!report) throw new ApiError(404, "Report not found");

  return res
    .status(200)
    .json(new ApiResponse(200, report, "Report marked as reviewed"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get disease-wise aggregated data for charts (village level)
// @route   GET /api/report/stats/village/:villageId
// @access  Admin, HealthWorker, Public
// ─────────────────────────────────────────────────────────────────────────────
export const getVillageChartData = asyncHandler(async (req, res) => {
  const { year } = req.query;
  const matchStage = { village: req.params.villageId };
  if (year) matchStage.reportYear = Number(year);

  const data = await DiseaseReport.aggregate([
    {
      $match: {
        village: new (await import("mongoose")).default.Types.ObjectId(
          req.params.villageId
        ),
        ...(year ? { reportYear: Number(year) } : {}),
      },
    },
    { $unwind: "$diseases" },
    {
      $group: {
        _id: {
          diseaseId: "$diseases.disease",
          month:     "$reportMonth",
          year:      "$reportYear",
        },
        totalAffected:  { $sum: "$diseases.affectedCount" },
        totalRecovered: { $sum: "$diseases.recoveredCount" },
        totalDeaths:    { $sum: "$diseases.deathCount" },
      },
    },
    {
      $lookup: {
        from:         "diseases",
        localField:   "_id.diseaseId",
        foreignField: "_id",
        as:           "diseaseInfo",
      },
    },
    { $unwind: "$diseaseInfo" },
    {
      $project: {
        month:          "$_id.month",
        year:           "$_id.year",
        diseaseName:    "$diseaseInfo.name",
        category:       "$diseaseInfo.category",
        totalAffected:  1,
        totalRecovered: 1,
        totalDeaths:    1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Village chart data fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get overall disease stats across all villages (Admin dashboard)
// @route   GET /api/report/stats/overview
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getOverallStats = asyncHandler(async (req, res) => {
  const { year } = req.query;

  const matchStage = {};
  if (year) matchStage.reportYear = Number(year);

  const stats = await DiseaseReport.aggregate([
    { $match: matchStage },
    { $unwind: "$diseases" },
    {
      $group: {
        _id:            "$diseases.disease",
        totalAffected:  { $sum: "$diseases.affectedCount" },
        totalRecovered: { $sum: "$diseases.recoveredCount" },
        totalDeaths:    { $sum: "$diseases.deathCount" },
        reportCount:    { $sum: 1 },
      },
    },
    {
      $lookup: {
        from:         "diseases",
        localField:   "_id",
        foreignField: "_id",
        as:           "diseaseInfo",
      },
    },
    { $unwind: "$diseaseInfo" },
    {
      $project: {
        diseaseName:    "$diseaseInfo.name",
        category:       "$diseaseInfo.category",
        severity:       "$diseaseInfo.severity",
        totalAffected:  1,
        totalRecovered: 1,
        totalDeaths:    1,
        reportCount:    1,
      },
    },
    { $sort: { totalAffected: -1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Overall disease stats fetched"));
});