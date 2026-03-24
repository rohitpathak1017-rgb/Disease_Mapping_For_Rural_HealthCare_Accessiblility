// ── Standard API Response Class ───────────────────────────────────────────────
// Ensures every success response has same structure across the entire app
//
// Usage inside controller:
//   return res
//     .status(200)
//     .json(new ApiResponse(200, data, "Users fetched successfully"))
//
// Response shape:
// {
//   "statusCode": 200,
//   "success": true,
//   "message": "Users fetched successfully",
//   "data": { ... }
// }
// ─────────────────────────────────────────────────────────────────────────────

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.success    = statusCode < 400;   // true for 2xx, false for 4xx/5xx
    this.message    = message;
    this.data       = data;
  }
}

export { ApiResponse };