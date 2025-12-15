"use client";

import { useEffect, useState } from "react";

/* ================= TYPES ================= */

interface NewsPost {
  title: string;
  slug?: string;
  day: string;
  monthYear: string;
  author: string;
  category: string;
  commentsCount: number;
  image: string;
  excerpt: string;
  content?: string;
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

/* ================= PAGE ================= */

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

  /* ================= LOAD ================= */

  useEffect(() => {
  fetch("/api/news", { cache: "no-store" })
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
    })
    .catch(() => setLoading(false));
}, []);


  /* ================= SAVE ================= */

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

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold">News Page Editor</h1>

      {message && <div className="text-green-600">{message}</div>}

      {/* ================= BANNER ================= */}
      <section className="space-y-3">
        <h2 className="font-semibold">Banner</h2>
        <input
          className="w-full border p-2"
          placeholder="Banner title"
          value={news.bannerTitle}
          onChange={(e) =>
            setNews({ ...news, bannerTitle: e.target.value })
          }
        />
        <input
          className="w-full border p-2"
          placeholder="Banner background image URL"
          value={news.bannerBackgroundImage}
          onChange={(e) =>
            setNews({ ...news, bannerBackgroundImage: e.target.value })
          }
        />
      </section>

      {/* ================= POSTS ================= */}
      <section className="space-y-4">
        <h2 className="font-semibold">Posts</h2>

        {news.posts.map((post, i) => (
          <div key={i} className="border p-4 rounded space-y-2">
            <input
              className="w-full border p-2"
              placeholder="Title"
              value={post.title}
              onChange={(e) => {
                const posts = [...news.posts];
                posts[i].title = e.target.value;
                setNews({ ...news, posts });
              }}
            />

            <input
              className="w-full border p-2"
              placeholder="Author"
              value={post.author}
              onChange={(e) => {
                const posts = [...news.posts];
                posts[i].author = e.target.value;
                setNews({ ...news, posts });
              }}
            />

            <input
              className="w-full border p-2"
              placeholder="Day (e.g. 12)"
              value={post.day}
              onChange={(e) => {
                const posts = [...news.posts];
                posts[i].day = e.target.value;
                setNews({ ...news, posts });
              }}
            />

            <input
              className="w-full border p-2"
              placeholder="Month / Year (e.g. Dec 2025)"
              value={post.monthYear}
              onChange={(e) => {
                const posts = [...news.posts];
                posts[i].monthYear = e.target.value;
                setNews({ ...news, posts });
              }}
            />

            <input
              className="w-full border p-2"
              placeholder="Category"
              value={post.category}
              onChange={(e) => {
                const posts = [...news.posts];
                posts[i].category = e.target.value;
                setNews({ ...news, posts });
              }}
            />

            <input
              className="w-full border p-2"
              placeholder="Image URL"
              value={post.image}
              onChange={(e) => {
                const posts = [...news.posts];
                posts[i].image = e.target.value;
                setNews({ ...news, posts });
              }}
            />

            <textarea
              className="w-full border p-2"
              placeholder="Excerpt"
              value={post.excerpt}
              onChange={(e) => {
                const posts = [...news.posts];
                posts[i].excerpt = e.target.value;
                setNews({ ...news, posts });
              }}
            />

            <button
              className="text-red-600 text-sm"
              onClick={() =>
                setNews({
                  ...news,
                  posts: news.posts.filter((_, idx) => idx !== i),
                })
              }
            >
              Delete Post
            </button>
          </div>
        ))}

        <button
          className="bg-gray-200 px-4 py-2 rounded"
          onClick={() =>
            setNews({
              ...news,
              posts: [
                ...news.posts,
                {
                  title: "",
                  day: "",
                  monthYear: "",
                  author: "",
                  category: "",
                  commentsCount: 0,
                  image: "",
                  excerpt: "",
                  content: "",
                },
              ],
            })
          }
        >
          + Add Post
        </button>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="space-y-4">
        <h2 className="font-semibold">Categories</h2>

        {news.categories.map((c, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="border p-2 flex-1"
              value={c.name}
              onChange={(e) => {
                const categories = [...news.categories];
                categories[i].name = e.target.value;
                setNews({ ...news, categories });
              }}
            />
            <input
              className="border p-2 w-24"
              type="number"
              value={c.count}
              onChange={(e) => {
                const categories = [...news.categories];
                categories[i].count = Number(e.target.value);
                setNews({ ...news, categories });
              }}
            />
          </div>
        ))}

        <button
          className="bg-gray-200 px-4 py-2 rounded"
          onClick={() =>
            setNews({
              ...news,
              categories: [...news.categories, { name: "", count: 0 }],
            })
          }
        >
          + Add Category
        </button>
      </section>

      {/* ================= LATEST POSTS ================= */}
      <section className="space-y-4">
        <h2 className="font-semibold">Latest Posts</h2>

        {news.latestPosts.map((p, i) => (
          <div key={i} className="border p-3 rounded space-y-2">
            <input
              className="w-full border p-2"
              placeholder="Title"
              value={p.title}
              onChange={(e) => {
                const latestPosts = [...news.latestPosts];
                latestPosts[i].title = e.target.value;
                setNews({ ...news, latestPosts });
              }}
            />
            <input
              className="w-full border p-2"
              placeholder="Author"
              value={p.author}
              onChange={(e) => {
                const latestPosts = [...news.latestPosts];
                latestPosts[i].author = e.target.value;
                setNews({ ...news, latestPosts });
              }}
            />
            <input
              className="w-full border p-2"
              placeholder="Image URL"
              value={p.image}
              onChange={(e) => {
                const latestPosts = [...news.latestPosts];
                latestPosts[i].image = e.target.value;
                setNews({ ...news, latestPosts });
              }}
            />
          </div>
        ))}

        <button
          className="bg-gray-200 px-4 py-2 rounded"
          onClick={() =>
            setNews({
              ...news,
              latestPosts: [
                ...news.latestPosts,
                { title: "", author: "", image: "" },
              ],
            })
          }
        >
          + Add Latest Post
        </button>
      </section>

      {/* ================= SAVE ================= */}
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
