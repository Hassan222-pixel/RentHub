// app/dashboard/managers/news/page.tsx
"use client";

import { useEffect, useState } from "react";

interface NewsPost {
  title: string;
  slug: string;
  day: string;
  monthYear: string;
  author: string;
  category: string;
  commentsCount: number;
  image: string;
  excerpt: string;
  content: string;
}

interface Category {
  name: string;
  count: number;
}

interface LatestPost {
  title: string;
  image: string;
  author: string;
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
    bannerTitle: "News",
    bannerBackgroundImage: "",
    posts: [],
    categories: [],
    latestPosts: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/news");
      const data = await res.json();

      setNews({
        bannerTitle: data.bannerTitle ?? "News",
        bannerBackgroundImage: data.bannerBackgroundImage ?? "",
        posts: Array.isArray(data.posts) ? data.posts : [],
        categories: Array.isArray(data.categories) ? data.categories : [],
        latestPosts: Array.isArray(data.latestPosts) ? data.latestPosts : [],
      });

      setLoading(false);
    };

    load();
  }, []);

  const handleField = (field: keyof NewsData, value: any) => {
    setNews((prev) => ({ ...prev, [field]: value }));
  };

  const handlePostChange = (
    index: number,
    field: keyof NewsPost,
    value: any
  ) => {
    const updated = [...news.posts];
    updated[index] = { ...updated[index], [field]: value };
    setNews((prev) => ({ ...prev, posts: updated }));
  };

  const handleCategoryChange = (
    index: number,
    field: keyof Category,
    value: any
  ) => {
    const updated = [...news.categories];
    updated[index] = { ...updated[index], [field]: value };
    setNews((prev) => ({ ...prev, categories: updated }));
  };

  const handleLatestPostChange = (
    index: number,
    field: keyof LatestPost,
    value: any
  ) => {
    const updated = [...news.latestPosts];
    updated[index] = { ...updated[index], [field]: value };
    setNews((prev) => ({ ...prev, latestPosts: updated }));
  };

  const addPost = () => {
    setNews((prev) => ({
      ...prev,
      posts: [
        ...prev.posts,
        {
          title: "",
          slug: "",
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
    }));
  };

  const removePost = (index: number) => {
    setNews((prev) => ({
      ...prev,
      posts: prev.posts.filter((_, i) => i !== index),
    }));
  };

  const addCategory = () => {
    setNews((prev) => ({
      ...prev,
      categories: [...prev.categories, { name: "", count: 0 }],
    }));
  };

  const removeCategory = (index: number) => {
    setNews((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const addLatestPost = () => {
    setNews((prev) => ({
      ...prev,
      latestPosts: [
        ...prev.latestPosts,
        { title: "", image: "", author: "" },
      ],
    }));
  };

  const removeLatestPost = (index: number) => {
    setNews((prev) => ({
      ...prev,
      latestPosts: prev.latestPosts.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/news", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(news),
    });

    setMessage(res.ok ? "Saved successfully!" : "Failed to save.");
    setSaving(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold">News Page Editor</h1>

      {message && <div className="text-green-600">{message}</div>}

      {/* Banner */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Banner</h2>

        <input
          type="text"
          className="w-full border p-2"
          value={news.bannerTitle}
          onChange={(e) => handleField("bannerTitle", e.target.value)}
          placeholder="Banner Title"
        />

        <input
          type="text"
          className="w-full border p-2"
          value={news.bannerBackgroundImage}
          onChange={(e) =>
            handleField("bannerBackgroundImage", e.target.value)
          }
          placeholder="Banner Background Image URL"
        />
      </section>

      {/* Posts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">News Posts</h2>
          <button
            onClick={addPost}
            className="bg-black text-white px-4 py-2 text-sm rounded"
          >
            + Add Post
          </button>
        </div>

        {news.posts.map((post, i) => (
          <div key={i} className="border p-4 rounded space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                className="w-1/2 border p-2"
                value={post.title}
                onChange={(e) => handlePostChange(i, "title", e.target.value)}
                placeholder="Post Title"
              />
              <input
                type="text"
                className="w-1/2 border p-2"
                value={post.slug}
                onChange={(e) => handlePostChange(i, "slug", e.target.value)}
                placeholder="Slug (for URLs, e.g. how-to-invest)"
              />
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                className="w-1/4 border p-2"
                value={post.day}
                onChange={(e) => handlePostChange(i, "day", e.target.value)}
                placeholder="Day (e.g. 15)"
              />
              <input
                type="text"
                className="w-1/4 border p-2"
                value={post.monthYear}
                onChange={(e) =>
                  handlePostChange(i, "monthYear", e.target.value)
                }
                placeholder="Month/Year (e.g. Apr '18)"
              />
              <input
                type="text"
                className="w-1/4 border p-2"
                value={post.author}
                onChange={(e) =>
                  handlePostChange(i, "author", e.target.value)
                }
                placeholder="Author"
              />
              <input
                type="text"
                className="w-1/4 border p-2"
                value={post.category}
                onChange={(e) =>
                  handlePostChange(i, "category", e.target.value)
                }
                placeholder="Category"
              />
            </div>

            <div className="flex gap-3">
              <input
                type="number"
                className="w-1/4 border p-2"
                value={post.commentsCount}
                onChange={(e) =>
                  handlePostChange(i, "commentsCount", Number(e.target.value))
                }
                placeholder="Comments Count"
              />
              <input
                type="text"
                className="flex-1 border p-2"
                value={post.image}
                onChange={(e) => handlePostChange(i, "image", e.target.value)}
                placeholder="Post Image URL"
              />
            </div>

            <textarea
              className="w-full border p-2"
              rows={3}
              value={post.excerpt}
              onChange={(e) => handlePostChange(i, "excerpt", e.target.value)}
              placeholder="Short excerpt shown under the image"
            />

            <textarea
              className="w-full border p-2"
              rows={5}
              value={post.content}
              onChange={(e) => handlePostChange(i, "content", e.target.value)}
              placeholder="Full content (HTML allowed if you want formatting)"
            />

            <button
              className="text-red-600 text-sm"
              onClick={() => removePost(i)}
            >
              Remove Post
            </button>
          </div>
        ))}

        {news.posts.length === 0 && (
          <p className="text-sm text-gray-500">
            No posts yet. Click &quot;Add Post&quot; to create one.
          </p>
        )}
      </section>

      {/* Categories */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Categories (Sidebar)</h2>
          <button
            onClick={addCategory}
            className="bg-black text-white px-4 py-2 text-sm rounded"
          >
            + Add Category
          </button>
        </div>

        {news.categories.map((cat, i) => (
          <div key={i} className="border p-3 rounded space-y-2">
            <input
              type="text"
              className="w-full border p-2"
              value={cat.name}
              onChange={(e) =>
                handleCategoryChange(i, "name", e.target.value)
              }
              placeholder="Category Name"
            />
            <input
              type="number"
              className="w-full border p-2"
              value={cat.count}
              onChange={(e) =>
                handleCategoryChange(i, "count", Number(e.target.value))
              }
              placeholder="Count"
            />

            <button
              className="text-red-600 text-sm"
              onClick={() => removeCategory(i)}
            >
              Remove Category
            </button>
          </div>
        ))}

        {news.categories.length === 0 && (
          <p className="text-sm text-gray-500">
            No categories yet. Click &quot;Add Category&quot; to create one.
          </p>
        )}
      </section>

      {/* Latest Posts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest Posts (Sidebar)</h2>
          <button
            onClick={addLatestPost}
            className="bg-black text-white px-4 py-2 text-sm rounded"
          >
            + Add Latest Post
          </button>
        </div>

        {news.latestPosts.map((lp, i) => (
          <div key={i} className="border p-3 rounded space-y-2">
            <input
              type="text"
              className="w-full border p-2"
              value={lp.title}
              onChange={(e) =>
                handleLatestPostChange(i, "title", e.target.value)
              }
              placeholder="Title"
            />
            <input
              type="text"
              className="w-full border p-2"
              value={lp.image}
              onChange={(e) =>
                handleLatestPostChange(i, "image", e.target.value)
              }
              placeholder="Image URL"
            />
            <input
              type="text"
              className="w-full border p-2"
              value={lp.author}
              onChange={(e) =>
                handleLatestPostChange(i, "author", e.target.value)
              }
              placeholder="Author"
            />

            <button
              className="text-red-600 text-sm"
              onClick={() => removeLatestPost(i)}
            >
              Remove Latest Post
            </button>
          </div>
        ))}

        {news.latestPosts.length === 0 && (
          <p className="text-sm text-gray-500">
            No latest posts yet. Click &quot;Add Latest Post&quot; to create one.
          </p>
        )}
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-3 text-lg rounded"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
