import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Strongly types the user documents
// Extends Mongoose's Document so the schema can be used with Mongoose methods
// Adds a custom method comparePassword that compares plain vs hashed passwords
// Includes role with valid values to control access
// id is used in the transform function (not _id directly)

export interface UserDocument extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  gender: string;
  age: Number;
  country: string;
  city: string;
  role: "critic" | "founder" | "investor";
  points: Number;
  createdAt: Date;
  updatedAt: Date;
  score: Number;
  reportCount: Number;
  blocked: boolean;
  profilePic: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    // Ensures names are trimmed and capped at 100 characters
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    // Email is case-insensitive (lowercase) and must be unique
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    gender: {
      type: String,
    },
    age: {
      type: Number,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    // Restricts role values to four predefined ones
    role: {
      type: String,
      enum: ["critic", "founder", "investor", "admin"],
      required: true,
      default: "critic",
    },
    score: {
      type: Number,
      default: 0,
    },
    reportCount: {
      // how many times the user has been reported, when count reaches ex: 3, the user will be blocked
      type: Number,
      default: 0,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
    // Cleans the output when sending user data in JSON responses
    // Removes __v, password, _id
    // Converts _id to id
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        return {
          id: ret.id,
          name: ret.name,
          email: ret.email,
          role: ret.role,
          age: ret.age,
          gender: ret.gender,
          country: ret.country,
          city: ret.city,
          score: ret.score,
          reportCount: ret.reportCount,
          blocked: ret.blocked,
          profilePic: ret.profilePic,
          createdAt: ret.createdAt,
          updatedAt: ret.updatedAt,
        };
      },
    },
    // Ensures similar behavior when using .toObject()
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        return {
          id: ret.id,
          name: ret.name,
          email: ret.email,
          role: ret.role,
          createdAt: ret.createdAt,
          updatedAt: ret.updatedAt,
        };
      },
    },
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // If the password hasn't changed (e.g. updating name/email), skip hashing
  if (!this.isModified("password")) return next();

  try {
    // Hashes the password using bcrypt with 10 salt rounds before saving
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error: any) {
    return next(error);
  }
});

// Compare password method
// Compares a plain-text password with the hashed one stored in the DB
// Used in signIn() logic
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Registers the schema under the "User" collection
export const UsersCollection = model<UserDocument>("User", userSchema);
