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
  pricePerNight?: number;
  pricePerMonth?: number;
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
    pricePerNight: { type: Number },
    pricePerMonth: { type: Number },
    amenities: [{ type: String }],
    images: [{ type: String }],
    tour3DUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Dorm = models.Dorm || mongoose.model<IDorm>("Dorm", DormSchema);
