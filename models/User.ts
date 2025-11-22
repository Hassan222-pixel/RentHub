// models/User.ts
import mongoose, { Schema, Document, models } from "mongoose";

export type UserRole =
  | "super-admin"
  | "accounts-admin"
  | "managers-admin"
  | "renter";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["super-admin", "accounts-admin", "managers-admin", "renter"], // 👈 MUST include renter
      default: "super-admin",
    },

    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const User = models.User || mongoose.model<IUser>("User", UserSchema);
