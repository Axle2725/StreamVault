// server/src/services/tokenService.ts
//
// Handles JWT generation, verification, and refresh token
// persistence in Supabase. Uses RS256 asymmetric signing:
// the private key signs tokens; the public key verifies them.
//
// Key setup (run once, then add keys/ to .gitignore):
//   openssl genrsa -out keys/private.pem 2048
//   openssl rsa -in keys/private.pem -pubout -out keys/public.pem
//
// Guest users receive access tokens only — no refresh tokens.

import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { supabase } from "../config/supabaseClient";

// ── Key Loading ──────────────────────────────────────────────
// Keys are loaded once at startup. If either file is missing,
// the server will throw immediately rather than failing at runtime.

const privateKey = fs.readFileSync(
  path.join(__dirname, "../../keys/private.pem"),
  "utf8",
);

const publicKey = fs.readFileSync(
  path.join(__dirname, "../../keys/public.pem"),
  "utf8",
);

// ── Types ────────────────────────────────────────────────────

export interface AccessTokenPayload {
  id: string;
  role: string;
  is_guest: boolean;
}

// ── Token Generation ─────────────────────────────────────────

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  // Guests get a longer-lived token since they have no refresh mechanism.
  const expiresIn = payload.is_guest ? "24h" : "15m";
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn,
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, privateKey, {
    algorithm: "RS256",
    expiresIn: "7d",
  });
};

// ── Token Verification ───────────────────────────────────────
// Both token types are verified with the public key.
// Explicitly pinning algorithms: ['RS256'] prevents algorithm
// confusion attacks (e.g. a token signed with 'none' being accepted).

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
  }) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
  }) as JwtPayload;
};

// ── Refresh Token Persistence (Supabase) ─────────────────────

/**
 * Stores a refresh token in the database.
 * Only call this for non-guest users.
 */
export const storeRefreshToken = async (
  userId: string,
  token: string,
): Promise<void> => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const { error } = await supabase.from("refresh_tokens").insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    throw new Error(`Failed to store refresh token: ${error.message}`);
  }
};

/**
 * Validates that a refresh token exists in the DB and hasn't expired.
 * Returns the stored record or null if invalid.
 */
export const validateStoredRefreshToken = async (
  token: string,
): Promise<{ user_id: string } | null> => {
  const { data, error } = await supabase
    .from("refresh_tokens")
    .select("user_id, expires_at")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) {
    // Expired — clean it up
    await supabase.from("refresh_tokens").delete().eq("token", token);
    return null;
  }

  return { user_id: data.user_id };
};

/**
 * Deletes a single refresh token (logout).
 */
export const deleteRefreshToken = async (token: string): Promise<void> => {
  await supabase.from("refresh_tokens").delete().eq("token", token);
};

/**
 * Deletes all refresh tokens for a user (force logout everywhere).
 */
export const deleteAllUserRefreshTokens = async (
  userId: string,
): Promise<void> => {
  await supabase.from("refresh_tokens").delete().eq("user_id", userId);
};
