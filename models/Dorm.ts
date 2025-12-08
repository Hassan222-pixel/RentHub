// models/Dorm.ts
import mongoose, { Schema, Document, models } from "mongoose";
import { IUser } from "./User";

export type DormRoomType = "private" | "double" | "shared";
export type DormGenderPreference = "any" | "male" | "female";

export interface IDorm extends Document {
  owner: IUser["_id"]; // renter user
  title: string;
  description: string;
  city: string;
  address?: string;
  university?: string;

  // Pricing (you can later decide to only use one of them)
  pricePerNight?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;

  // Availability basics
  availableFrom?: Date;
  minStayNights?: number;

  // Room details / rules
  roomType?: DormRoomType; // private / double / shared
  maxOccupants?: number; // derived on creation, not from form
  genderPreference?: DormGenderPreference;
  allowsSmoking: boolean;
  allowsPets: boolean;
  houseRules?: string;

  // Deposit
  depositAmount?: number;
  depositCurrency?: string; // "USD" | "LBP" etc.

  // Location (for map & filtering)
  latitude?: number;
  longitude?: number;

  amenities: string[];
  images: string[];
  profileImg?: string; // cover image
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
    minStayNights: { type: Number },

    // Room details / rules
    roomType: {
      type: String,
      enum: ["private", "double", "shared"],
    },
    maxOccupants: { type: Number },
    genderPreference: {
      type: String,
      enum: ["any", "male", "female"],
      default: "any",
    },
    allowsSmoking: { type: Boolean, default: false },
    allowsPets: { type: Boolean, default: false },
    houseRules: { type: String },

    // Deposit
    depositAmount: { type: Number },
    depositCurrency: { type: String, default: "USD" },

    // Location
    latitude: { type: Number },
    longitude: { type: Number },

    amenities: [{ type: String }],
    images: [{ type: String }],
    profileImg: { type: String },
    tour3DUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Dorm = models.Dorm || mongoose.model<IDorm>("Dorm", DormSchema);
