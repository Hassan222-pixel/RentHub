"use client";

import { useEffect, useState } from "react";

export default function BlogManagerPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateBlog = (index: number, field: string, value: string) => {
    const updated = [...blogs];
    updated[index][field] = value;
    setBlogs(updated);
  };

  const handleSave = async () => {
    await fetch("/api/blog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blogs),
    });

    alert("Blog saved successfully!");
  };

  if (loading) return <p className="p-4">Loading...</p>;

  if (!blogs.length)
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Blog Manager</h1>
        <p>No blogs found. Check your Blog.ts file.</p>
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Blog Manager</h1>

      {blogs.map((item: any, index: number) => (
        <div key={item.id} className="card p-4 mb-4 shadow-sm">
          <h3 className="font-bold mb-3">Blog #{item.id}</h3>

          <label>Image URL</label>
          <input
            className="form-control mb-2"
            value={item.image}
            onChange={(e) => updateBlog(index, "image", e.target.value)}
          />

          <label>Title</label>
          <input
            className="form-control mb-2"
            value={item.title}
            onChange={(e) => updateBlog(index, "title", e.target.value)}
          />

          <label>Subtitle</label>
          <input
            className="form-control mb-2"
            value={item.subtitle}
            onChange={(e) => updateBlog(index, "subtitle", e.target.value)}
          />

          <label>Description</label>
          <textarea
            className="form-control mb-2"
            rows={3}
            value={item.description}
            onChange={(e) =>
              updateBlog(index, "description", e.target.value)
            }
          />
        </div>
      ))}

      <button onClick={handleSave} className="btn btn-primary mt-3">
        Save All Changes
      </button>
    </div>
  );
}
