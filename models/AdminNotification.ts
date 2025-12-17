// models/AdminNotification.ts
import mongoose, { Schema, models } from "mongoose";

export type AdminNotifType = "add" | "edit" | "delete";

export interface IAdminNotification extends mongoose.Document {
  type: AdminNotifType;
  message: string;

  dormId?: mongoose.Types.ObjectId;
  dormTitle?: string;

  actorId?: mongoose.Types.ObjectId; // renter id
  actorName?: string;
  actorEmail?: string;

  // supports multiple super-admins safely
  readBy: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const AdminNotificationSchema = new Schema<IAdminNotification>(
  {
    type: { type: String, enum: ["add", "edit", "delete"], required: true },
    message: { type: String, required: true },

    dormId: { type: Schema.Types.ObjectId, ref: "Dorm" },
    dormTitle: { type: String },

    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    actorName: { type: String },
    actorEmail: { type: String },

    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const AdminNotification =
  models.AdminNotification ||
  mongoose.model<IAdminNotification>(
    "AdminNotification",
    AdminNotificationSchema
  );
