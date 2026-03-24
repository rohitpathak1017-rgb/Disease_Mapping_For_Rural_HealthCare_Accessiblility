// ── Async Handler ─────────────────────────────────────────────────────────────
// Wraps every async controller function so we never need try/catch manually
// Any thrown error is automatically forwarded to express errorHandler middleware
//
// Usage:
//   export const getUsers = asyncHandler(async (req, res) => {
//     const users = await User.find();
//     res.json(new ApiResponse(200, users, "Users fetched"));
//   });
// ─────────────────────────────────────────────────────────────────────────────

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };