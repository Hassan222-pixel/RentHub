"use client";

import { useState } from "react";

export default function HeroManagerPage() {
  // Editable fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");

  const handleSave = () => {
    alert("Hero Page Saved (Database connection will be added later)");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Hero Page Manager</h1>

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
        <label className="font-semibold">Hero Subtitle</label>
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

      <button onClick={handleSave} className="btn btn-primary mt-2">
        Save Changes
      </button>
    </div>
  );
}
