// server/src/controllers/auth.controller.ts
//
// Handles all authentication endpoints:
//   POST /api/auth/register
//   POST /api/auth/login
//   POST /api/auth/refresh
//   POST /api/auth/logout
//   POST /api/auth/guest   ← new: creates a temporary guest session

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { supabase } from "../config/supabaseClient";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  storeRefreshToken,
  validateStoredRefreshToken,
  deleteRefreshToken,
} from "../services/tokenService";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// ── POST /api/auth/register ──────────────────────────────────

export const register = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, email, and password are required." });
  }

  if (username.trim().length < 3) {
    return res
      .status(400)
      .json({ error: "Username must be at least 3 characters." });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters." });
  }

  try {
    // Check for duplicate email
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists." });
    }

    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert({ email, password_hash, role: "viewer", is_guest: false })
      .select("id, email, role")
      .single();

    if (userError || !user) {
      throw new Error(userError?.message ?? "Failed to create user.");
    }

    // Create the user's first profile, named after the username
    // they chose at registration.
    const profileName = username.trim();
    await supabase.from("profiles").insert({
      user_id: user.id,
      name: profileName,
    });

    // Issue tokens
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      is_guest: false,
    });
    const refreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    return res.status(201).json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_guest: false,
      },
    });
  } catch (err) {
    // console.error("[auth.register]", err);
    console.error("[auth.register] Full error:", err);
    console.error("[auth.register] Cause:", (err as any)?.cause);
    return res
      .status(500)
      .json({ error: "Registration failed. Please try again." });
  }
};

// ── POST /api/auth/login ─────────────────────────────────────

export const login = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password_hash, role, is_active, is_guest")
      .eq("email", email)
      .maybeSingle();

    // Use a generic error message to avoid leaking which emails exist
    if (error || !user || user.is_guest) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "Your account has been disabled." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      is_guest: false,
    });
    const refreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_guest: false,
      },
    });
  } catch (err) {
    console.error("[auth.login]", err);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
};

// ── POST /api/auth/refresh ───────────────────────────────────

export const refresh = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No refresh token provided." });
  }

  try {
    // Verify JWT signature first (fast, no DB hit)
    verifyRefreshToken(token);

    // Then validate against DB (checks expiry, revocation)
    const stored = await validateStoredRefreshToken(token);
    if (!stored) {
      return res
        .status(401)
        .json({ error: "Refresh token is invalid or has expired." });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, role, is_active")
      .eq("id", stored.user_id)
      .single();

    if (error || !user || !user.is_active) {
      return res
        .status(401)
        .json({ error: "User not found or account disabled." });
    }

    const newAccessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      is_guest: false,
    });

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    // JWT verification failure lands here
    return res.status(401).json({ error: "Invalid refresh token." });
  }
};

// ── POST /api/auth/logout ────────────────────────────────────

export const logout = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const token = req.cookies?.refreshToken;

  if (token) {
    await deleteRefreshToken(token);
  }

  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out successfully." });
};

// ── POST /api/auth/guest ─────────────────────────────────────
//
// Creates a temporary guest user row and returns a 24-hour
// access token. No email, password, or refresh token needed.
// Guest sessions are ephemeral — the user row can be cleaned up
// by a scheduled job after the token expires.

export const loginAsGuest = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { data: guest, error } = await supabase
      .from("users")
      .insert({ role: "guest", is_guest: true })
      .select("id, role")
      .single();

    if (error || !guest) {
      throw new Error(error?.message ?? "Failed to create guest session.");
    }

    // Guests get a 24-hour access token and no refresh token.
    const accessToken = generateAccessToken({
      id: guest.id,
      role: guest.role,
      is_guest: true,
    });

    return res.status(201).json({
      accessToken,
      user: { id: guest.id, role: "guest", is_guest: true },
    });
  } catch (err) {
    console.error("[auth.guest]", err);
    return res
      .status(500)
      .json({ error: "Could not start guest session. Please try again." });
  }
};
