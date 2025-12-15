import mongoose, { Schema, model, models } from "mongoose";

const HeroSchema = new Schema(
  {
    backgroundImage: {
      type: String,
      default: "/template/images/banner1.jpg",
      required: true,
    },
    highlightedH2: {
      type: String,
      default: "Modern & Affordable",
      required: true,
    },
    titleH1: {
      type: String,
      default: "Dormitory Rooms For Rent",
      required: true,
    },
    subtitleH2: {
      type: String,
      default: "Safe, clean, and convenient accommodation designed for students & workers.",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite on hot reload
export const Hero = models.Hero || model("Hero", HeroSchema);
