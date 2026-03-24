// ── Custom API Error Class ────────────────────────────────────────────────────
// Extends native Error so it works with express error handler seamlessly
// Usage: throw new ApiError(404, "User not found")
// ─────────────────────────────────────────────────────────────────────────────

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);

    this.statusCode = statusCode;
    this.message    = message;
    this.success    = false;
    this.errors     = errors;   // array of field-level errors (e.g. validation)
    this.data       = null;

    // Capture stack trace — if provided use it, else generate fresh
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };