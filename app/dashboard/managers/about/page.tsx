"use client";

import { useEffect, useState } from "react";

interface Stat {
  label: string;
  value: number;
}

interface Realtor {
  name: string;
  position: string;
  photo: string;
}

interface AboutData {
  bannerTitle: string;
  bannerBackgroundImage: string;

  aboutTitle: string;
  aboutSubtitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  aboutImage: string;

  stats: Stat[];
  realtors: Realtor[];
}

export default function AboutManagerPage() {
  const [about, setAbout] = useState<AboutData>({
    bannerTitle: "",
    bannerBackgroundImage: "",
    aboutTitle: "",
    aboutSubtitle: "",
    aboutParagraph1: "",
    aboutParagraph2: "",
    aboutImage: "",
    stats: [],
    realtors: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ✅ FIXED — Safe loader that guarantees stats[] and realtors[]
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/about");
      const data = await res.json();

      setAbout({
        bannerTitle: data.bannerTitle ?? "",
        bannerBackgroundImage: data.bannerBackgroundImage ?? "",
        aboutTitle: data.aboutTitle ?? "",
        aboutSubtitle: data.aboutSubtitle ?? "",
        aboutParagraph1: data.aboutParagraph1 ?? "",
        aboutParagraph2: data.aboutParagraph2 ?? "",
        aboutImage: data.aboutImage ?? "",

        // FIX: Always ensure arrays exist
        stats: Array.isArray(data.stats) ? data.stats : [],
        realtors: Array.isArray(data.realtors) ? data.realtors : [],
      });

      setLoading(false);
    };

    load();
  }, []);

  const handleField = (field: keyof AboutData, value: any) => {
    setAbout((prev) => ({ ...prev, [field]: value }));
  };

  const handleStat = (index: number, field: keyof Stat, value: any) => {
    const updated = [...about.stats];
    updated[index] = { ...updated[index], [field]: value };
    setAbout((prev) => ({ ...prev, stats: updated }));
  };

  const handleRealtor = (index: number, field: keyof Realtor, value: any) => {
    const updated = [...about.realtors];
    updated[index] = { ...updated[index], [field]: value };
    setAbout((prev) => ({ ...prev, realtors: updated }));
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(about),
    });

    setMessage(res.ok ? "Saved successfully!" : "Failed to save.");
    setSaving(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold">About Page Editor</h1>

      {message && <div className="text-green-600">{message}</div>}

      {/* Banner */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Banner</h2>

        <input
          type="text"
          className="w-full border p-2"
          value={about.bannerTitle}
          onChange={(e) => handleField("bannerTitle", e.target.value)}
          placeholder="Banner Title"
        />

        <input
          type="text"
          className="w-full border p-2"
          value={about.bannerBackgroundImage}
          onChange={(e) =>
            handleField("bannerBackgroundImage", e.target.value)
          }
          placeholder="Banner Background Image URL"
        />
      </section>

      {/* About Text */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">About Section</h2>

        <input
          type="text"
          className="w-full border p-2"
          value={about.aboutTitle}
          onChange={(e) => handleField("aboutTitle", e.target.value)}
          placeholder="About Title"
        />

        <input
          type="text"
          className="w-full border p-2"
          value={about.aboutSubtitle}
          onChange={(e) => handleField("aboutSubtitle", e.target.value)}
          placeholder="About Subtitle"
        />

        <textarea
          className="w-full border p-2"
          rows={4}
          value={about.aboutParagraph1}
          onChange={(e) => handleField("aboutParagraph1", e.target.value)}
          placeholder="Paragraph 1"
        />

        <textarea
          className="w-full border p-2"
          rows={4}
          value={about.aboutParagraph2}
          onChange={(e) => handleField("aboutParagraph2", e.target.value)}
          placeholder="Paragraph 2"
        />

        <input
          type="text"
          className="w-full border p-2"
          value={about.aboutImage}
          onChange={(e) => handleField("aboutImage", e.target.value)}
          placeholder="Side Image URL"
        />
      </section>

      {/* Stats */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Stats</h2>

        {about.stats.map((stat, i) => (
          <div key={i} className="border p-3 rounded space-y-2">
            <input
              type="text"
              className="w-full border p-2"
              value={stat.label}
              onChange={(e) => handleStat(i, "label", e.target.value)}
              placeholder="Label"
            />

            <input
              type="number"
              className="w-full border p-2"
              value={stat.value}
              onChange={(e) => handleStat(i, "value", Number(e.target.value))}
              placeholder="Value"
            />

            <button
              className="text-red-600"
              onClick={() =>
                setAbout((prev) => ({
                  ...prev,
                  stats: prev.stats.filter((_, idx) => idx !== i),
                }))
              }
            >
              Remove Stat
            </button>
          </div>
        ))}

        <button
          className="bg-black text-white px-4 py-2"
          onClick={() =>
            setAbout((prev) => ({
              ...prev,
              stats: [...prev.stats, { label: "", value: 0 }],
            }))
          }
        >
          + Add Stat
        </button>
      </section>

      {/* Realtors */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Realtors</h2>

        {about.realtors.map((r, i) => (
          <div key={i} className="border p-3 rounded space-y-2">
            <input
              type="text"
              className="w-full border p-2"
              value={r.name}
              onChange={(e) => handleRealtor(i, "name", e.target.value)}
              placeholder="Name"
            />

            <input
              type="text"
              className="w-full border p-2"
              value={r.position}
              onChange={(e) => handleRealtor(i, "position", e.target.value)}
              placeholder="Position"
            />

            <input
              type="text"
              className="w-full border p-2"
              value={r.photo}
              onChange={(e) => handleRealtor(i, "photo", e.target.value)}
              placeholder="Photo URL"
            />

            <button
              className="text-red-600"
              onClick={() =>
                setAbout((prev) => ({
                  ...prev,
                  realtors: prev.realtors.filter((_, idx) => idx !== i),
                }))
              }
            >
              Remove Realtor
            </button>
          </div>
        ))}

        <button
          className="bg-black text-white px-4 py-2"
          onClick={() =>
            setAbout((prev) => ({
              ...prev,
              realtors: [
                ...prev.realtors,
                { name: "", position: "", photo: "" },
              ],
            }))
          }
        >
          + Add Realtor
        </button>
      </section>

      <button
        onClick={save}
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-3 text-lg rounded"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
