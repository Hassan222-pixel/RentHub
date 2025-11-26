"use client";

import { useState } from "react";

export default function FooterManagerPage() {
  const [text, setText] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const handleSave = () => {
    alert("Footer Saved (DB coming later)");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Footer Manager</h1>

      <div className="mb-3">
        <label className="fw-semibold">Footer Text</label>
        <textarea
          className="form-control"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
      </div>

      <h4 className="fw-bold mt-4">Social Links</h4>

      <div className="mb-2">
        <label className="fw-semibold">Facebook</label>
        <input className="form-control" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
      </div>

      <div className="mb-2">
        <label className="fw-semibold">Twitter</label>
        <input className="form-control" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
      </div>

      <div className="mb-2">
        <label className="fw-semibold">LinkedIn</label>
        <input className="form-control" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
      </div>

      <button className="btn btn-primary mt-3" onClick={handleSave}>
        Save Footer
      </button>
    </div>
  );
}
