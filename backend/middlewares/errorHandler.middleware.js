import { ApiError } from "../utils/ApiError.js";
import { ENV } from "../config/env.js";

// ── Global Error Handler ──────────────────────────────────────────────────────
// Must be the LAST middleware registered in app.js:
//   app.use(errorHandler)
// ─────────────────────────────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  let error = err;

  // ── If error is not our custom ApiError, wrap it ──────────────────────────
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message    = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // ── Mongoose: Duplicate key error (e.g. duplicate email / village) ─────────
  if (err.code === 11000) {
    const field   = Object.keys(err.keyValue).join(", ");
    const message = `Duplicate value for field: ${field}`;
    error = new ApiError(409, message);
  }

  // ── Mongoose: CastError (invalid ObjectId) ─────────────────────────────────
  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // ── Mongoose: Validation error ─────────────────────────────────────────────
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(422, "Validation failed", messages);
  }

  // ── JWT errors (if not caught in middleware) ───────────────────────────────
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token");
  }
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Token has expired");
  }

  // ── Final response ─────────────────────────────────────────────────────────
  const response = {
    success:    false,
    statusCode: error.statusCode,
    message:    error.message,
    errors:     error.errors?.length ? error.errors : undefined,
    // Show stack trace ONLY in development mode
    ...(ENV.NODE_ENV === "development" && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export default errorHandler;