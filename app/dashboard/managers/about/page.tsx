"use client";

import { useEffect, useState } from "react";

export default function AboutManagerPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [message, setMessage] = useState("");

  // Load existing about data
  useEffect(() => {
    const loadAbout = async () => {
      try {
        const res = await fetch("/api/about");
        if (!res.ok) return;
        const data = await res.json();
        if (!data) return;
        setTitle(data.title || "");
        setContent(data.content || "");
        setImageUrl(data.imageUrl || "");
        setButtonText(data.buttonText || "");
      } catch (err) {
        console.error("Failed to load about:", err);
      }
    };

    loadAbout();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, imageUrl, buttonText }),
      });

      if (res.ok) {
        setMessage("About section updated!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Failed to save about:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Edit About Section</h2>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="mb-4">
        <label className="font-semibold">Title</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ABOUT US"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold">Text</label>
        <textarea
          className="form-control"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter about text"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold">Image URL</label>
        <input
          className="form-control"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="/template/images/about.png"
        />
        <small className="text-muted">
          e.g. /template/images/about.png
        </small>
      </div>

      <div className="mb-4">
        <label className="font-semibold">Button Text</label>
        <input
          className="form-control"
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
          placeholder="Read More"
        />
      </div>

      <button onClick={handleSave} className="btn btn-primary">
        Save Changes
      </button>
    </div>
  );
}
