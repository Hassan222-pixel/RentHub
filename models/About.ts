import mongoose, { Schema, model, models } from "mongoose";

const StatSchema = new Schema({
  label: { type: String, default: "" },
  value: { type: Number, default: 0 },
  icon: { type: String, default: "" },   // ⭐ ADD THIS
});

const RealtorSchema = new Schema({
  name: { type: String, default: "" },
  position: { type: String, default: "" },
  photo: { type: String, default: "" },  // already exists, good
});

const AboutSchema = new Schema(
  {
    bannerTitle: { type: String, default: "About" },
    bannerBackgroundImage: { type: String, default: "" },

    aboutTitle: { type: String, default: "" },
    aboutSubtitle: { type: String, default: "" },
    aboutParagraph1: { type: String, default: "" },
    aboutParagraph2: { type: String, default: "" },
    aboutImage: { type: String, default: "" },

    stats: { type: [StatSchema], default: [] },
    realtors: { type: [RealtorSchema], default: [] },
  },
  { timestamps: true }
);

export const About = models.About || model("About", AboutSchema);
