import Feedback from "../models/Feedback.model.js";
import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler } from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Submit feedback to a health worker
// @route   POST /api/feedback
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const submitFeedback = asyncHandler(async (req, res) => {
  const {
    healthWorkerId,
    villageId,
    relatedCamp,
    rating,
    category,
    message,
    isAnonymous,
  } = req.body;

  if (!healthWorkerId || !villageId || !rating || !message) {
    throw new ApiError(
      400,
      "Health worker, village, rating and message are required"
    );
  }

  // Validate health worker exists
  const worker = await User.findOne({
    _id: healthWorkerId,
    role: "healthworker",
    isActive: true,
  });
  if (!worker) throw new ApiError(404, "Health worker not found");

  // Prevent duplicate feedback in a short time (same user, same worker, same day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const alreadyGiven = await Feedback.findOne({
    givenBy:     req.user._id,
    healthWorker: healthWorkerId,
    createdAt:   { $gte: today },
  });

  if (alreadyGiven) {
    throw new ApiError(
      429,
      "You have already submitted feedback to this health worker today"
    );
  }

  const feedback = await Feedback.create({
    givenBy:     req.user._id,
    healthWorker: healthWorkerId,
    village:     villageId,
    relatedCamp: relatedCamp || null,
    rating,
    category,
    message,
    isAnonymous: isAnonymous ?? false,
  });

  await feedback.populate([
    { path: "healthWorker", select: "name email" },
    { path: "village",      select: "villageName district" },
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, feedback, "Feedback submitted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all feedbacks for a health worker (worker sees their own)
// @route   GET /api/feedback/worker/:workerId
// @access  HealthWorker (own), Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getFeedbackForWorker = asyncHandler(async (req, res) => {
  const targetWorkerId = req.params.workerId;

  // Health worker can only see their own feedback
  if (
    req.user.role === "healthworker" &&
    req.user._id.toString() !== targetWorkerId
  ) {
    throw new ApiError(403, "You can only view your own feedback");
  }

  const { category, rating } = req.query;
  const filter = { healthWorker: targetWorkerId, isApproved: true };

  if (category) filter.category = category;
  if (rating)   filter.rating   = Number(rating);

  const feedbacks = await Feedback.find(filter)
    .populate({
      path:  "givenBy",
      select: "name",
      // If anonymous, do not expose giver info
    })
    .populate("village", "villageName district")
    .populate("relatedCamp", "campName campDate")
    .sort({ createdAt: -1 });

  // Mask anonymous feedback giver names
  const sanitized = feedbacks.map((fb) => {
    const obj = fb.toObject();
    if (obj.isAnonymous) obj.givenBy = { name: "Anonymous" };
    return obj;
  });

  // Mark all as read for the health worker
  if (req.user.role === "healthworker") {
    await Feedback.updateMany(
      { healthWorker: req.user._id, isReadByWorker: false },
      { isReadByWorker: true }
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, sanitized, "Feedback fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all feedbacks for admin (all workers)
// @route   GET /api/feedback
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const getAllFeedbacks = asyncHandler(async (req, res) => {
  const { villageId, isApproved, rating } = req.query;
  const filter = {};

  if (villageId)            filter.village    = villageId;
  if (isApproved !== undefined) filter.isApproved = isApproved === "true";
  if (rating)               filter.rating     = Number(rating);

  const feedbacks = await Feedback.find(filter)
    .populate("givenBy",      "name email")
    .populate("healthWorker", "name email")
    .populate("village",      "villageName district state")
    .populate("relatedCamp",  "campName campDate")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, feedbacks, "All feedbacks fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single feedback by ID
// @route   GET /api/feedback/:feedbackId
// @access  Admin, HealthWorker (own), Public (own)
// ─────────────────────────────────────────────────────────────────────────────
export const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.feedbackId)
    .populate("givenBy",      "name email")
    .populate("healthWorker", "name email phone")
    .populate("village",      "villageName district state")
    .populate("relatedCamp",  "campName campDate servicesOffered");

  if (!feedback) throw new ApiError(404, "Feedback not found");

  // Access control
  const userId = req.user._id.toString();
  const isAdmin        = req.user.role === "admin";
  const isOwner        = feedback.givenBy._id.toString() === userId;
  const isTargetWorker = feedback.healthWorker._id.toString() === userId;

  if (!isAdmin && !isOwner && !isTargetWorker) {
    throw new ApiError(403, "Access denied");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, feedback, "Feedback details fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Admin toggles feedback approval (hide abusive content)
// @route   PUT /api/feedback/:feedbackId/approve
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
export const toggleFeedbackApproval = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.feedbackId);
  if (!feedback) throw new ApiError(404, "Feedback not found");

  feedback.isApproved = !feedback.isApproved;
  await feedback.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isApproved: feedback.isApproved },
        `Feedback ${feedback.isApproved ? "approved" : "hidden"} successfully`
      )
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete feedback (Admin or feedback owner)
// @route   DELETE /api/feedback/:feedbackId
// @access  Admin, Public (own)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.feedbackId);
  if (!feedback) throw new ApiError(404, "Feedback not found");

  const isAdmin = req.user.role === "admin";
  const isOwner = feedback.givenBy.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner) {
    throw new ApiError(403, "You cannot delete this feedback");
  }

  await Feedback.findByIdAndDelete(req.params.feedbackId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Feedback deleted successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get average rating stats for a health worker
// @route   GET /api/feedback/stats/:workerId
// @access  Admin, HealthWorker (own), Public
// ─────────────────────────────────────────────────────────────────────────────
export const getWorkerRatingStats = asyncHandler(async (req, res) => {
  const stats = await Feedback.aggregate([
    {
      $match: {
        healthWorker: new (await import("mongoose")).default.Types.ObjectId(
          req.params.workerId
        ),
        isApproved: true,
      },
    },
    {
      $group: {
        _id:          null,
        averageRating: { $avg: "$rating" },
        totalFeedback: { $sum: 1 },
        rating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        rating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
      },
    },
    {
      $project: {
        _id:           0,
        averageRating: { $round: ["$averageRating", 1] },
        totalFeedback: 1,
        ratingBreakdown: {
          five:  "$rating5",
          four:  "$rating4",
          three: "$rating3",
          two:   "$rating2",
          one:   "$rating1",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        stats[0] || { averageRating: 0, totalFeedback: 0 },
        "Worker rating stats fetched"
      )
    );
});