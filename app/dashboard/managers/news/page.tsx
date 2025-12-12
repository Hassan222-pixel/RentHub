"use client";

import { useEffect, useState } from "react";

interface NewsPost {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image: string;
}

interface Category {
  name: string;
  count: number;
}

interface LatestPost {
  title: string;
  author: string;
  image: string;
}

interface NewsData {
  bannerTitle: string;
  bannerBackgroundImage: string;
  posts: NewsPost[];
  categories: Category[];
  latestPosts: LatestPost[];
}

export default function NewsManagerPage() {
  const [news, setNews] = useState<NewsData>({
    bannerTitle: "",
    bannerBackgroundImage: "",
    posts: [],
    categories: [],
    latestPosts: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        setNews({
          bannerTitle: data.bannerTitle ?? "",
          bannerBackgroundImage: data.bannerBackgroundImage ?? "",
          posts: data.posts ?? [],
          categories: data.categories ?? [],
          latestPosts: data.latestPosts ?? [],
        });
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/news", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(news),
    });

    setMessage(res.ok ? "Saved successfully!" : "Save failed");
    setSaving(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">News Page Editor</h1>

      {message && <div className="text-green-600">{message}</div>}

      {/* Banner */}
      <section className="space-y-2">
        <h2 className="font-semibold">Banner</h2>
        <input
          className="w-full border p-2"
          value={news.bannerTitle}
          onChange={(e) =>
            setNews({ ...news, bannerTitle: e.target.value })
          }
          placeholder="Banner Title"
        />
        <input
          className="w-full border p-2"
          value={news.bannerBackgroundImage}
          onChange={(e) =>
            setNews({ ...news, bannerBackgroundImage: e.target.value })
          }
          placeholder="Banner Background Image URL"
        />
      </section>

      {/* POSTS, CATEGORIES, LATEST POSTS */}
      <p className="text-sm text-gray-500">
        Posts, Categories, and Latest Posts are fully manual like a CMS.
      </p>

      <button
        onClick={save}
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
