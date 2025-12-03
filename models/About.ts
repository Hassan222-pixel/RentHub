import { Schema, model, models } from "mongoose";

const AboutSchema = new Schema(
  {
    title: {
      type: String,
      default: "ABOUT US",
    },
    content: {
      type: String,
      default:
        "The passage experienced a surge in popularity during the 1960s when Letraset used it on their dry-transfer sheets, and again during the 90s as desktop publishers bundled the text with their software.",
    },
    imageUrl: {
      type: String,
      default: "/template/images/about.png",
    },
    buttonText: {
      type: String,
      default: "Read More",
    },
  },
  { timestamps: true }
);

export const About = models.About || model("About", AboutSchema);
