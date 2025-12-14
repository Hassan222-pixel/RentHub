// models/Dorm.ts
import mongoose, { Schema, Document, models } from "mongoose";
import { IUser } from "./User";

export type DormRoomType = "private" | "double" | "shared";
export type DormGenderPreference = "any" | "male" | "female";
export type AdminAvailability = "available" | "not_available";

export interface IDorm extends Document {
  owner: IUser["_id"];
  title: string;
  description: string;
  city: string;
  address?: string;
  university?: string;

  pricePerNight?: number;
  pricePerMonth?: number;

  roomType?: DormRoomType;
  maxOccupants?: number;
  genderPreference?: DormGenderPreference;

  allowsSmoking: boolean;
  allowsPets: boolean;
  houseRules?: string[];

  depositAmount?: number;
  depositCurrency?: string;

  latitude?: number;
  longitude?: number;

  hasWifi: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasParking: boolean;
  hasLaundry: boolean;
  isFurnished: boolean;

  amenities: string[];

  images: string[];
  profileImg?: string;
  tour3DUrl?: string;

  isActive: boolean;

  // ✅ Admin control (manual availability)
  adminAvailability: AdminAvailability;
  adminAvailabilityUpdatedAt?: Date;

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

    pricePerNight: { type: Number },
    pricePerMonth: { type: Number },

    roomType: { type: String, enum: ["private", "double", "shared"] },
    maxOccupants: { type: Number },
    genderPreference: {
      type: String,
      enum: ["any", "male", "female"],
      default: "any",
    },

    allowsSmoking: { type: Boolean, default: false },
    allowsPets: { type: Boolean, default: false },
    houseRules: [{ type: String }],

    depositAmount: { type: Number },
    depositCurrency: { type: String, default: "USD" },

    latitude: { type: Number },
    longitude: { type: Number },

    hasWifi: { type: Boolean, default: false },
    hasAirConditioning: { type: Boolean, default: false },
    hasHeating: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    hasLaundry: { type: Boolean, default: false },
    isFurnished: { type: Boolean, default: false },

    amenities: [{ type: String }],

    images: [{ type: String }],
    profileImg: { type: String },
    tour3DUrl: { type: String },

    isActive: { type: Boolean, default: true },

    // ✅ NEW FIELDS
    adminAvailability: {
      type: String,
      enum: ["available", "not_available"],
      default: "available",
      index: true,
    },
    adminAvailabilityUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

export const Dorm = models.Dorm || mongoose.model<IDorm>("Dorm", DormSchema);
