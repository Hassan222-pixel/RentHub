"use client";

import { useState } from "react";

export default function AboutManagerPage() {
  const [aboutText, setAboutText] = useState("");

  const handleSave = () => {
    alert("About Page Saved (DB connection later)");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">About Page Manager</h1>

      <label className="font-semibold">About Page Text</label>
      <textarea
        className="form-control"
        rows={6}
        value={aboutText}
        onChange={(e) => setAboutText(e.target.value)}
      ></textarea>

      <button onClick={handleSave} className="btn btn-primary mt-3">
        Save Changes
      </button>
    </div>
  );
}
