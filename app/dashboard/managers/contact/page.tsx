"use client";

import { useEffect, useState } from "react";

interface ContactData {
  bannerTitle: string;
  bannerBackgroundImage: string;
  heading: string;
  subtitle: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  mapEmbedUrl: string;
}

export default function ContactManagerPage() {
  const [data, setData] = useState<ContactData>({
    bannerTitle: "",
    bannerBackgroundImage: "",
    heading: "",
    subtitle: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    mapEmbedUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/contact")
      .then(res => res.json())
      .then(d => {
        setData({
          bannerTitle: d.bannerTitle ?? "",
          bannerBackgroundImage: d.bannerBackgroundImage ?? "",
          heading: d.heading ?? "",
          subtitle: d.subtitle ?? "",
          description: d.description ?? "",
          address: d.address ?? "",
          phone: d.phone ?? "",
          email: d.email ?? "",
          mapEmbedUrl: d.mapEmbedUrl ?? "",
        });
        setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setMessage(res.ok ? "Saved successfully" : "Failed to save");
    setSaving(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Contact Page Editor</h1>

      {message && <div className="text-green-600">{message}</div>}

      {Object.entries(data).map(([key, value]) => (
        <input
          key={key}
          className="w-full border p-2"
          placeholder={key}
          value={value}
          onChange={(e) =>
            setData(prev => ({ ...prev, [key]: e.target.value }))
          }
        />
      ))}

      <button
        onClick={save}
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
