"use client";

import { useState } from "react";

export default function RoomManagerPage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");

  const handleSave = () => {
    alert("Room settings saved (DB later)");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Our Room Manager</h1>

      <div className="mb-3">
        <label className="fw-semibold">Room Title</label>
        <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="fw-semibold">Room Description</label>
        <textarea
          className="form-control"
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        ></textarea>
      </div>

      <div className="mb-3">
        <label className="fw-semibold">Room Image URL</label>
        <input className="form-control" value={image} onChange={(e) => setImage(e.target.value)} />
      </div>

      <button className="btn btn-primary mt-3" onClick={handleSave}>
        Save Room Content
      </button>
    </div>
  );
}
