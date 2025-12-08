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

  // Pricing
  pricePerNight?: number;
  pricePerMonth?: number;

  // Availability basics
  minStayNights?: number;

  // Room details / rules
  roomType?: DormRoomType; // private / double / shared
  maxOccupants?: number; // derived for private/double, user-set for shared
  genderPreference?: DormGenderPreference;

  // Rules
  allowsSmoking: boolean;
  allowsPets: boolean;
  houseRules?: string[]; // list of rules

  // Deposit (always USD conceptually)
  depositAmount?: number;

  // Location (for map & filtering)
  latitude?: number;
  longitude?: number;

  // Boolean amenities
  hasWifi: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasParking: boolean;
  hasLaundry: boolean;
  isFurnished: boolean;

  // Extra amenities tags
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
    pricePerMonth: { type: Number },

    // Availability
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

    // Rules
    allowsSmoking: { type: Boolean, default: false },
    allowsPets: { type: Boolean, default: false },
    houseRules: [{ type: String }],

    // Deposit
    depositAmount: { type: Number },

    // Location
    latitude: { type: Number },
    longitude: { type: Number },

    // Boolean amenities
    hasWifi: { type: Boolean, default: false },
    hasAirConditioning: { type: Boolean, default: false },
    hasHeating: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    hasLaundry: { type: Boolean, default: false },
    isFurnished: { type: Boolean, default: false },

    // Extra amenities tags
    amenities: [{ type: String }],

    images: [{ type: String }],
    profileImg: { type: String },
    tour3DUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Dorm = models.Dorm || mongoose.model<IDorm>("Dorm", DormSchema);
