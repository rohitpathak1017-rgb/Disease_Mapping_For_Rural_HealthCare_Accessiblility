import { ApiError } from "../utils/ApiError.js";

// ── Generic role guard factory ────────────────────────────────────────────────
// Usage: authorizeRoles("admin", "healthworker")
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized: Please login first");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Forbidden: '${req.user.role}' role does not have access to this resource`
      );
    }

    next();
  };
};

// ── Shorthand role guards ─────────────────────────────────────────────────────

// Only Admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized: Please login first");
  }
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Forbidden: Admin access required");
  }
  next();
};

// Only Health Worker
export const isHealthWorker = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized: Please login first");
  }
  if (req.user.role !== "healthworker") {
    throw new ApiError(403, "Forbidden: Health Worker access required");
  }
  next();
};

// Only Public user
export const isPublic = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized: Please login first");
  }
  if (req.user.role !== "public") {
    throw new ApiError(403, "Forbidden: Public user access required");
  }
  next();
};

// Admin OR Health Worker (e.g. viewing reports)
export const isAdminOrHealthWorker = (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized: Please login first");
  }
  if (!["admin", "healthworker"].includes(req.user.role)) {
    throw new ApiError(403, "Forbidden: Admin or Health Worker access required");
  }
  next();
};