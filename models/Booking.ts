import mongoose, { Schema, Document, models } from "mongoose";
import { IDorm } from "./Dorm";
import { IUser } from "./User";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface IBooking extends Document {
  dorm: IDorm["_id"];
  renter: IUser["_id"]; // owner / landlord
  client: IUser["_id"]; // student
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: BookingStatus;
  cancelReason?: string; // e.g. "conflict", "renter_cancelled"
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    dorm: { type: Schema.Types.ObjectId, ref: "Dorm", required: true },
    renter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    // Reason for cancellation (used to show a specific message to the client)
    cancelReason: { type: String },
  },
  { timestamps: true }
);

export const Booking =
  models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
