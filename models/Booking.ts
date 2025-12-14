// models/Booking.ts
import mongoose, { Schema, Document, models } from "mongoose";
import { IDorm } from "./Dorm";
import { IUser } from "./User";

export type BookingStatus =
  | "pending" // legacy
  | "pending_payment"
  | "reserved"
  | "confirmed"
  | "cancelled"
  | "expired";

export type PaymentType = "deposit" | "full";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export type BookingMode = "normal" | "ongoing";

export interface IBooking extends Document {
  dorm: IDorm["_id"];
  renter: IUser["_id"];
  client: IUser["_id"];

  clientFirstName?: string;
  clientLastName?: string;
  clientPhone?: string;

  startDate: Date;
  endDate: Date;

  totalPrice: number;

  paymentType: PaymentType;
  paymentStatus: PaymentStatus;
  currency: string;

  depositAmount?: number;
  remainingAmount?: number;
  deadlineToPayRest?: Date;

  stripeSessionId?: string;
  stripePaymentIntentId?: string;

  platformFee?: number;
  renterShare?: number;

  // ✅ NEW (the real source of truth)
  bookingMode: BookingMode;

  // Backward compat (optional) – do NOT use as source of truth
  isOngoing: boolean;

  cancelReason?: string;
  isTestPayment?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    dorm: { type: Schema.Types.ObjectId, ref: "Dorm", required: true },
    renter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },

    clientFirstName: { type: String },
    clientLastName: { type: String },
    clientPhone: { type: String },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    totalPrice: { type: Number, required: true },

    paymentType: {
      type: String,
      enum: ["deposit", "full"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "failed"],
      default: "unpaid",
    },

    currency: { type: String, default: "USD" },

    depositAmount: { type: Number },
    remainingAmount: { type: Number },
    deadlineToPayRest: { type: Date },

    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },

    platformFee: { type: Number, default: 0 },
    renterShare: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        "pending",
        "pending_payment",
        "reserved",
        "confirmed",
        "cancelled",
        "expired",
      ],
      default: "pending_payment",
    },

    // ✅ NEW
    bookingMode: {
      type: String,
      enum: ["normal", "ongoing"],
      default: "normal",
      index: true,
    },

    // Backward compat
    isOngoing: { type: Boolean, default: false },

    cancelReason: { type: String },
    isTestPayment: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Booking =
  models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);
