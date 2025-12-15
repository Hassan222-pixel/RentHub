import mongoose from "mongoose";

const FooterPropertySchema = new mongoose.Schema({
  city: String,
  title: String,
  price: String,
  image: String,
});

const FooterSchema = new mongoose.Schema(
  {
    description: String,
    properties: [FooterPropertySchema],
  },
  { timestamps: true }
);

export const Footer =
  mongoose.models.Footer || mongoose.model("Footer", FooterSchema);
