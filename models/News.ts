// models/News.ts
import mongoose, { Schema, model, models } from "mongoose";

const NewsPostSchema = new Schema(
  {
    title: { type: String, default: "" },
    slug: { type: String, default: "" }, // optional, for future details page
    day: { type: String, default: "" },  // e.g. "15"
    monthYear: { type: String, default: "" }, // e.g. "Apr '18"
    author: { type: String, default: "" },
    category: { type: String, default: "" },
    commentsCount: { type: Number, default: 0 },
    image: { type: String, default: "" },
    excerpt: { type: String, default: "" }, // short text under image
    content: { type: String, default: "" }, // full content (for future)
  },
  { _id: true }
);

const CategorySchema = new Schema(
  {
    name: { type: String, default: "" },
    count: { type: Number, default: 0 },
  },
  { _id: true }
);

const LatestPostSchema = new Schema(
  {
    title: { type: String, default: "" },
    image: { type: String, default: "" },
    author: { type: String, default: "" },
  },
  { _id: true }
);

const NewsSchema = new Schema(
  {
    // Banner
    bannerTitle: { type: String, default: "News" },
    bannerBackgroundImage: { type: String, default: "" },

    // Main posts list
    posts: {
      type: [NewsPostSchema],
      default: [],
    },

    // Sidebar
    categories: {
      type: [CategorySchema],
      default: [],
    },
    latestPosts: {
      type: [LatestPostSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const News = models.News || model("News", NewsSchema);
