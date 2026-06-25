import { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
  AccessTokenPayload,
} from "../services/tokenService";

// Extend Express Request to carry the decoded user
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

/**
 * Verifies the Bearer token from the Authorization header.
 * Accepts both registered users and guests.
 * Attaches decoded payload to req.user.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization token required." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

/**
 * Blocks guest users from accessing a route.
 * Must be used AFTER authenticate.
 *
 * Usage:
 *   router.post('/watchlist', authenticate, restrictGuests, addToWatchlist);
 */
export const restrictGuests = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.is_guest) {
    res.status(403).json({
      error: "Guests cannot access this feature.",
      action: "PROMPT_SIGNUP", // Frontend can use this to show a sign-up prompt
    });
    return;
  }
  next();
};

/**
 * Restricts a route to specific roles.
 * Must be used AFTER authenticate.
 *
 * Usage:
 *   router.get('/admin/users', authenticate, requireRole('admin'), listUsers);
 *   router.get('/moderate',    authenticate, requireRole('admin', 'moderator'), getQueue);
 */
export const requireRole =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res
        .status(403)
        .json({ error: "You do not have permission to access this resource." });
      return;
    }
    next();
  };
