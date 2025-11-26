"use client";

import { useState } from "react";

export default function BlogManagerPage() {
  const [posts, setPosts] = useState([{ title: "", text: "", image: "" }]);

  const addPost = () => {
    setPosts([...posts, { title: "", text: "", image: "" }]);
  };

  const updatePost = (index: number, field: string, value: string) => {
    const newPosts = [...posts];
    (newPosts[index] as any)[field] = value;
    setPosts(newPosts);
  };

  const handleSave = () => {
    alert("Blog Saved (DB later)");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Blog Manager</h1>

      {posts.map((post, i) => (
        <div key={i} className="border p-3 mb-4 rounded">

          <label className="fw-semibold">Post #{i + 1} Title</label>
          <input
            className="form-control mb-2"
            value={post.title}
            onChange={(e) => updatePost(i, "title", e.target.value)}
          />

          <label className="fw-semibold">Post Text</label>
          <textarea
            className="form-control mb-2"
            rows={4}
            value={post.text}
            onChange={(e) => updatePost(i, "text", e.target.value)}
          ></textarea>

          <label className="fw-semibold">Image URL</label>
          <input
            className="form-control"
            value={post.image}
            onChange={(e) => updatePost(i, "image", e.target.value)}
          />
        </div>
      ))}

      <button className="btn btn-secondary me-3" onClick={addPost}>
        + Add New Blog Post
      </button>

      <button className="btn btn-primary" onClick={handleSave}>
        Save Blog
      </button>
    </div>
  );
}
