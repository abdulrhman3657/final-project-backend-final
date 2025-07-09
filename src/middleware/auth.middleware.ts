import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"; // Imports JWT library for decoding and verifying tokens
import { UsersCollection } from "../models/user.model"; // Mongoose model for interacting with the users collection
import { jwtConfig } from "../config/jwt"; // Loads JWT configuration (e.g., secret key) from the custom config file
import { AppError } from "../utils/error";
import { FORBIDDEN, UNAUTHORIZED } from "../utils/http-status";

// Extends the default Express Request to include the user property, which will store the authenticated user's info
export interface AuthRequest extends Request {
  user?: any;
}

// checks if the user has a valid access token
export const authorized = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {

    // 1) Get token from header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    // Tries to retrieve the token from either the Authorization header (standard "Bearer <token>") or cookies (accessToken cookie)
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // Throws a 401 error if no token is found
    if (!token) {
      return next(new AppError("You are not logged in", UNAUTHORIZED));
    }

    // 2) Verify token
    // Verifies and decodes the token using the secret. Expected structure: contains type and a user object
    const decoded = jwt.verify(token, jwtConfig.secret) as {
      type: string;
      user: {
        id: string;
        email: string;
        role: string;
      };
    };

    // Ensures that the token is of type "access" not "refresh"
    if (decoded.type !== "access") {
      return next(new AppError("Invalid token type", UNAUTHORIZED));
    }

    // 3) Check if user still exists
    // Checks if the user still exists in the database. Prevents access for deleted users
    const user = await UsersCollection.findById(decoded.user.id);
    if (!user) {
      return next(new AppError("User no longer exists", UNAUTHORIZED));
    }

    // prevent access to authorized routes if the user is blocked
    if (user.blocked) {
      return next(new AppError("User account is blocked", FORBIDDEN));
    }

    // 4) Grant access to authorized route
    // Attaches the user object to the request and proceeds to the next route handler
    req.user = user;
    
    next();
  } catch (error) {
    // Catches errors from JWT verification. Handles expired and invalid tokens differently
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError("Token has expired", UNAUTHORIZED));
    } else {
      next(new AppError("Invalid token", UNAUTHORIZED));
    }
  }
};

// Defines a higher-order middleware function that takes allowed roles as arguments (e.g., ["admin", "teacher"])
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action",
          FORBIDDEN
        )
      );
    }
    next();
  };
};
