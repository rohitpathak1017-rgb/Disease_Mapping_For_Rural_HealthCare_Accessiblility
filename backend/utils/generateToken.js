import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

// ── Generate Access Token ─────────────────────────────────────────────────────
// Short-lived (15m default) — sent with every API request
// Payload: _id, role (minimum data, never store sensitive info in JWT)
// ─────────────────────────────────────────────────────────────────────────────
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id:  user._id,
      role: user.role,
    },
    ENV.ACCESS_TOKEN_SECRET,
    {
      expiresIn: ENV.ACCESS_TOKEN_EXPIRY || "15m",
    }
  );
};

// ── Generate Refresh Token ────────────────────────────────────────────────────
// Long-lived (7d default) — stored in DB + httpOnly cookie
// Used ONLY to generate a new access token when it expires
// ─────────────────────────────────────────────────────────────────────────────
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
    },
    ENV.REFRESH_TOKEN_SECRET,
    {
      expiresIn: ENV.REFRESH_TOKEN_EXPIRY || "7d",
    }
  );
};

// ── Generate Both Tokens + Save Refresh Token to DB ──────────────────────────
// Single function called on login/register to do everything in one shot
// Returns both tokens ready to be set as cookies
// ─────────────────────────────────────────────────────────────────────────────
export const generateAndSaveTokens = async (user) => {
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token in DB so we can invalidate it on logout
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// ── Cookie Options ─────────────────────────────────────────────────────────────
// Reusable cookie config — import these wherever you set cookies
// ─────────────────────────────────────────────────────────────────────────────
export const accessTokenCookieOptions = {
  httpOnly: true,                              // JS cannot access — XSS safe
  secure:   ENV.NODE_ENV === "production",     // HTTPS only in production
  sameSite: "strict",
  maxAge:   15 * 60 * 1000,                   // 15 minutes in ms
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure:   ENV.NODE_ENV === "production",
  sameSite: "strict",
  maxAge:   7 * 24 * 60 * 60 * 1000,         // 7 days in ms
};