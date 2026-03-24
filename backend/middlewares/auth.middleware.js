import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import User from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── Verify Access Token ───────────────────────────────────────────────────────
export const verifyJWT = asyncHandler(async (req, res, next) => {
  // Token can come from cookies OR Authorization header (Bearer token)
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Unauthorized: Access token expired");
    }
    throw new ApiError(401, "Unauthorized: Invalid access token");
  }

  // Fetch user from DB (exclude password & refreshToken)
  const user = await User.findById(decoded._id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(401, "Unauthorized: User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated. Contact admin.");
  }

  // Attach user to request object — available in all next middlewares/controllers
  req.user = user;
  next();
});