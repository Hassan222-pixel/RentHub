"use client";

import { useState } from "react";

export default function ContactManagerPage() {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSave = () => {
    alert("Contact info saved (DB later)");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contact Page Manager</h1>

      <div className="mb-3">
        <label className="fw-semibold">Address</label>
        <input className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="fw-semibold">Phone</label>
        <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="fw-semibold">Email</label>
        <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <button className="btn btn-primary mt-3" onClick={handleSave}>
        Save Contact Info
      </button>
    </div>
  );
}
