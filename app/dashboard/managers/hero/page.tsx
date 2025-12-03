"use client";

import { useState, useEffect } from "react";

export default function HeroManagerPage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [message, setMessage] = useState("");

  // Load hero data
  useEffect(() => {
    fetch("/api/hero")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setTitle(data.title || "");
          setSubtitle(data.subtitle || "");
          setBackgroundImage(data.backgroundImage || "");
        }
      });
  }, []);

  // Save updated hero
  const handleSave = async () => {
    const res = await fetch("/api/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subtitle, backgroundImage }),
    });

    if (res.ok) {
      setMessage("Hero section updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Edit Hero Section</h2>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="mb-4">
        <label className="font-semibold">Hero Title</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter homepage hero title"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold">Hero Buttom</label>
        <input
          className="form-control"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Enter homepage hero subtitle"
        />
      </div>

      <div className="mb-4">
        <label className="font-semibold">Background Image URL</label>
        <input
          className="form-control"
          value={backgroundImage}
          onChange={(e) => setBackgroundImage(e.target.value)}
          placeholder="Image URL"
        />
      </div>

      <button onClick={handleSave} className="btn btn-primary px-4">
        Save Changes
      </button>
    </div>
  );
}
