"use client";

import { useState } from "react";

export default function NavbarManagerPage() {
  const [home, setHome] = useState("");
  const [about, setAbout] = useState("");
  const [room, setRoom] = useState("");
  const [gallery, setGallery] = useState("");
  const [blog, setBlog] = useState("");
  const [contact, setContact] = useState("");

  const handleSave = () => {
    alert("Navbar Saved (DB coming later)");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Navbar Manager</h1>

      {/* Each field */}
      <div className="mb-3">
        <label className="fw-semibold">Home Label</label>
        <input className="form-control" value={home} onChange={(e) => setHome(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="fw-semibold">About Label</label>
        <input className="form-control" value={about} onChange={(e) => setAbout(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="fw-semibold">Room Label</label>
        <input className="form-control" value={room} onChange={(e) => setRoom(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="fw-semibold">Gallery Label</label>
        <input className="form-control" value={gallery} onChange={(e) => setGallery(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="fw-semibold">Blog Label</label>
        <input className="form-control" value={blog} onChange={(e) => setBlog(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="fw-semibold">Contact Label</label>
        <input className="form-control" value={contact} onChange={(e) => setContact(e.target.value)} />
      </div>

      <button onClick={handleSave} className="btn btn-primary mt-3">
        Save Navbar
      </button>
    </div>
  );
}
