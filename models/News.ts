import mongoose, { Schema, model, models } from "mongoose";

const NewsPostSchema = new Schema({
  title: { type: String, default: "" },
  excerpt: { type: String, default: "" },
  author: { type: String, default: "" },
  date: { type: String, default: "" },
  category: { type: String, default: "" },
  image: { type: String, default: "" },
});

const CategorySchema = new Schema({
  name: { type: String, default: "" },
  count: { type: Number, default: 0 },
});

const LatestPostSchema = new Schema({
  title: { type: String, default: "" },
  author: { type: String, default: "" },
  image: { type: String, default: "" },
});

const NewsSchema = new Schema(
  {
    bannerTitle: { type: String, default: "News" },
    bannerBackgroundImage: { type: String, default: "" },

    posts: { type: [NewsPostSchema], default: [] },

    categories: { type: [CategorySchema], default: [] },
    latestPosts: { type: [LatestPostSchema], default: [] },
  },
  { timestamps: true }
);

export const News = models.News || model("News", NewsSchema);
