import jwt from "jsonwebtoken"; // Imports the JWT library to create and verify tokens (refreshToken)
// UserDocument: a TypeScript type/interface representing the user document
import { UsersCollection, UserDocument } from "../models/user.model";
import { jwtConfig } from "../config/jwt"; // Contains settings like the secret key and expiration times for tokens
import { AppError } from "../utils/error"; //
import { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED, FORBIDDEN } from "../utils/http-status";
// Registers a new user
const signUp = async (userData: {
  name: string;
  email: string;
  password: string;
  role: string;
  age: Number;
  gender: string;
  country: string;
  city: string;
}): Promise<{
  user: UserDocument;
  accessToken: string;
  refreshToken: string;
}> => {
  // trim input
  // Cleans up input to prevent issues like duplicate emails with different casing
  if (!userData.name || typeof userData.name !== "string") {
    throw new Error("Name is required and must be a string");
  }
  userData.name = userData.name.trim();

  if (!userData.email || typeof userData.email !== "string") {
    throw new Error("Email is required and must be a string");
  }
  userData.email = userData.email.toLowerCase().trim();

  // check password length
  if (userData.password.length < 8) {
    throw new AppError("Password must be at least 8 characters", BAD_REQUEST);
  }
  if (!userData.email || !userData.password || !userData.role) {
    throw new AppError("Missing required fields", 400);
  }

  const existingUser = await UsersCollection.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError("Email already exists", BAD_REQUEST);
  }

  const user = await UsersCollection.create(userData);
  const { accessToken, refreshToken } = await generateTokens(user);

  return { user, accessToken, refreshToken };
};

const signIn = async (
  email: string,
  password: string
): Promise<{
  user: UserDocument;
  accessToken: string;
  refreshToken: string;
}> => {
  const user = await UsersCollection.findOne({ email });
  // Validates the password using the comparePassword method defined in the user model
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials", UNAUTHORIZED);
  }

  // prevent login if the user is blocked
  if (user.blocked) {
    throw new AppError("Account is blocked", FORBIDDEN);
  }

  const { accessToken, refreshToken } = await generateTokens(user);
  return { user, accessToken, refreshToken };
};

// Accepts a refreshToken, from cookies or request body
const refreshToken = async (
  token: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  try {
    // Verifies the token and decodes the user info
    const decoded = jwt.verify(token, jwtConfig.secret) as {
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
      type: string;
    };

    if (decoded.type !== "refresh") {
      throw new AppError("Invalid token type", UNAUTHORIZED);
    }

    const user = await UsersCollection.findById(decoded.user.id);
    if (!user) {
      throw new AppError("User not found or inactive", UNAUTHORIZED);
    }

    return generateTokens(user);
  } catch (error) {
    throw new AppError("Invalid refresh token", UNAUTHORIZED);
  }
};

const deleteAccount = async (userId: string): Promise<void> => {
  const user = await UsersCollection.findById(userId);
  if (!user) {
    throw new AppError("User not found", NOT_FOUND);
  }

  await UsersCollection.findByIdAndDelete(userId);
};

// Private utility function to create both tokens
const generateTokens = async (
  user: UserDocument
): Promise<{ accessToken: string; refreshToken: string }> => {
  const accessToken = jwt.sign(
    {
      type: "access",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
    jwtConfig.secret,
    jwtConfig.accessToken.options
  );

  const refreshToken = jwt.sign(
    {
      type: "refresh",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
    jwtConfig.secret,
    jwtConfig.refreshToken.options
  );

  return { accessToken, refreshToken };
};

export { signUp, signIn, refreshToken, deleteAccount, generateTokens };
