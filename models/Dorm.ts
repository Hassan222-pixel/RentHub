// models/Dorm.ts
import mongoose, { Schema, Document, models } from "mongoose";
import { IUser } from "./User";

export interface IDorm extends Document {
  owner: IUser["_id"]; // renter user
  title: string;
  description: string;
  city: string;
  address?: string;
  university?: string;

  // Pricing
  pricePerNight?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;

  // Availability basics
  availableFrom?: Date;
  availableTo?: Date;
  minStayNights?: number;
  maxStayNights?: number;

  // Rental terms
  rentalType?: "daily" | "weekly" | "monthly" | "flexible";
  isRefundable: boolean;
  cancellationPolicy?: string;
  depositAmount?: number;
  depositCurrency?: string;

  // Room details / rules
  roomType?: "room" | "bed" | "studio" | "apartment";
  maxOccupants?: number;
  genderPreference?: "any" | "male" | "female";
  allowsSmoking: boolean;
  allowsPets: boolean;

  // Location (for map & filtering)
  latitude?: number;
  longitude?: number;

  amenities: string[];
  images: string[];
  tour3DUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DormSchema = new Schema<IDorm>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    university: { type: String },

    // Pricing
    pricePerNight: { type: Number },
    pricePerWeek: { type: Number },
    pricePerMonth: { type: Number },

    // Availability
    availableFrom: { type: Date },
    availableTo: { type: Date },
    minStayNights: { type: Number },
    maxStayNights: { type: Number },

    // Rental terms
    rentalType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "flexible"],
      default: "flexible",
    },
    isRefundable: { type: Boolean, default: true },
    cancellationPolicy: { type: String },
    depositAmount: { type: Number },
    depositCurrency: { type: String, default: "USD" },

    // Room details / rules
    roomType: {
      type: String,
      enum: ["room", "bed", "studio", "apartment"],
    },
    maxOccupants: { type: Number },
    genderPreference: {
      type: String,
      enum: ["any", "male", "female"],
      default: "any",
    },
    allowsSmoking: { type: Boolean, default: false },
    allowsPets: { type: Boolean, default: false },

    // Location
    latitude: { type: Number },
    longitude: { type: Number },

    amenities: [{ type: String }],
    images: [{ type: String }],
    tour3DUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Dorm = models.Dorm || mongoose.model<IDorm>("Dorm", DormSchema);
