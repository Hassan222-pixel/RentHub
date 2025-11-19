// models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "super-admin" | "accounts-admin" | "managers-admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // hashed
  role: UserRole;
  permissions: string[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["super-admin", "accounts-admin", "managers-admin"],
      default: "accounts-admin",
    },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

// Avoid recompiling model during dev hot reload
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
