import { Request, Response, NextFunction } from "express";
import * as AuthService from "../services/auth.service";
import { AppError } from "../utils/error";
import { AuthRequest } from "../middleware/auth.middleware";
import { CREATED, OK } from "../utils/http-status";

// SIGN UP
const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, age, gender, country, city } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.signUp({
      name,
      email,
      password,
      role,
      age,
      gender,
      country,
      city,
    });

    // Send tokens in headers
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.setHeader("X-Refresh-Token", refreshToken);

    res.status(CREATED).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          age: user.age,
          gender: user.gender,
          country: user.country,
          city: user.city,
          score: user.score,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    next(error);
  }
};

// SIGN IN
const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await AuthService.signIn(
      email,
      password
    );

    // Send tokens in headers
    res.setHeader("Authorization", `Bearer ${accessToken}`);
    res.setHeader("X-Refresh-Token", refreshToken);

    res.status(OK).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          age: user.age,
          gender: user.gender,
          country: user.country,
          city: user.city,
          score: user.score,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// SIGN OUT
const signOut = async (req: Request, res: Response) => {
  res.status(OK).json({
    status: "success",
    message: "Signed out successfully",
  });
};

// REFRESH TOKENS
const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const headerToken =
      typeof req.headers["x-refresh-token"] === "string"
        ? (req.headers["x-refresh-token"] as string)
        : undefined;
    const token = headerToken || req.body.refreshToken;
    if (!token) throw new AppError("Refresh token not provided", 401);

    const tokens = await AuthService.refreshToken(token);

    // Send new tokens in headers
    res.setHeader("Authorization", `Bearer ${tokens.accessToken}`);
    res.setHeader("X-Refresh-Token", tokens.refreshToken);

    res.status(OK).json({
      status: "success",
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE ACCOUNT
const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await AuthService.deleteAccount(req.user.id);

    res.status(OK).json({
      status: "success",
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { signUp, signIn, signOut, refreshToken, deleteAccount };