import mongoose, { Schema, model, models } from "mongoose";

const HeroSchema = new Schema(
  {
    title: { type: String, default: "Book a Room Online" },
    subtitle: { type: String, default: "Book your stay with us today" },
    backgroundImage: {
      type: String,
      default: "/template/images/banner1.jpg",
    },
  },
  { timestamps: true }
);

export const Hero = models.Hero || model("Hero", HeroSchema);
