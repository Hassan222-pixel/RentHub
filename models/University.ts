// models/University.ts
import mongoose, { Schema, Document, models } from "mongoose";

export interface IUniversity extends Document {
  name: string;
  area: string; // ✅ NEW
  latitude: number;
  longitude: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UniversitySchema = new Schema<IUniversity>(
  {
    name: { type: String, required: true, trim: true },

    // ✅ NEW
    area: { type: String, required: true, trim: true, index: true },

    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    image: { type: String },
  },
  { timestamps: true }
);

export const University =
  models.University ||
  mongoose.model<IUniversity>("University", UniversitySchema);
