import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils/generateToken.js";

// ── Helper: generate both tokens & save refresh token to DB ──────────────────
const generateAndSaveTokens = async (user) => {
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new PUBLIC user (self-registration)
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const registerPublicUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, villageLocation } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: "public",
    villageLocation,
  });

  const { accessToken, refreshToken } = await generateAndSaveTokens(user);

  return res
    .status(201)
    .cookie("accessToken",  accessToken,  accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(
      new ApiResponse(
        201,
        { user: user.toSafeObject(), accessToken },
        "Registration successful"
      )
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login (all 3 roles)
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // // console.log("📧 Email:", email);
  // // console.log("🔑 Password received:", password);

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  
  // // console.log("👤 User found:", user ? "YES" : "NO");
  // // console.log("🔐 Hash in DB:", user?.password);

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  // // console.log("✅ Password valid:", isPasswordValid);

  // ... baaki code same
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAndSaveTokens(user);

  return res
    .status(200)
    .cookie("accessToken",  accessToken,  accessTokenCookieOptions)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: user.toSafeObject(), accessToken, role: user.role },
        "Login successful"
      )
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private (any role)
// ─────────────────────────────────────────────────────────────────────────────
export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { refreshToken: null },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken",  accessTokenCookieOptions)
    .clearCookie("refreshToken", refreshTokenCookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id).select("+refreshToken");
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token mismatch or user not found");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAndSaveTokens(user);

  return res
    .status(200)
    .cookie("accessToken",  accessToken,     accessTokenCookieOptions)
    .cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions)
    .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private (any role)
// ─────────────────────────────────────────────────────────────────────────────
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "assignedVillage",
    "villageName district state subdistrict"
  );

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user.toSafeObject(), "Profile fetched"));
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Change password
// @route   PATCH /api/auth/change-password
// @access  Private (any role)
// ─────────────────────────────────────────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new password are required");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(400, "New password cannot be same as old password");
  }

  const user = await User.findById(req.user._id).select("+password");
  const isOldValid = await user.isPasswordCorrect(oldPassword);

  if (!isOldValid) {
    throw new ApiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});