import mongoose, { Schema, model, models } from "mongoose";

const ContactSchema = new Schema(
  {
    bannerTitle: { type: String, default: "Contact" },
    bannerBackgroundImage: { type: String, default: "/template/images/banner1.jpg" },

    heading: { type: String, default: "Get in touch with us" },
    subtitle: { type: String, default: "Say hello" },
    description: { type: String, default: "" },

    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },

    mapEmbedUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Contact =
  models.Contact || model("Contact", ContactSchema);
