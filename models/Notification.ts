import mongoose, { Schema, Document, models } from "mongoose";
import type { IUser } from "./User";
import type { IBooking } from "./Booking";

export type NotificationType =
  | "deposit_reminder"
  | "booking_cancelled"
  | "booking_conflict";

export interface INotification extends Document {
  user: IUser["_id"];
  booking?: IBooking["_id"];
  dormTitle?: string;

  type: NotificationType;
  title: string;
  body: string;

  // used to prevent duplicates for the same day
  dayKey: string; // "YYYY-MM-DD"

  readAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
    dormTitle: { type: String },

    type: {
      type: String,
      enum: ["deposit_reminder", "booking_cancelled", "booking_conflict"],
      required: true,
      index: true,
    },

    title: { type: String, required: true },
    body: { type: String, required: true },

    dayKey: { type: String, required: true, index: true },

    readAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent duplicates for the same booking+type+day
NotificationSchema.index(
  { booking: 1, type: 1, dayKey: 1 },
  { unique: true, sparse: true }
);

export const Notification =
  models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
