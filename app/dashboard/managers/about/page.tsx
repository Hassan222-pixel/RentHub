"use client";

import { useEffect, useState } from "react";

interface Stat {
  label: string;
  value: number;
  icon: string;
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

  /**
   * ⭐ FIXED LOADER — Ensures no undefined values EVER reach inputs
   */
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

        stats: Array.isArray(data.stats)
          ? data.stats.map((s: any) => ({
              label: s.label ?? "",
              value: Number(s.value ?? 0),
              icon: s.icon ?? "", // ⭐ Always exists
            }))
          : [],

        realtors: Array.isArray(data.realtors)
          ? data.realtors.map((r: any) => ({
              name: r.name ?? "",
              position: r.position ?? "",
              photo: r.photo ?? "",
            }))
          : [],
      });

      setLoading(false);
    };

    load();
  }, []);

  /**
   * Update helpers
   */
  const updateField = (field: keyof AboutData, value: any) => {
    setAbout((prev) => ({ ...prev, [field]: value }));
  };

  const updateStat = (index: number, field: keyof Stat, value: any) => {
    const updatedStats = [...about.stats];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    setAbout((prev) => ({ ...prev, stats: updatedStats }));
  };

  const updateRealtor = (index: number, field: keyof Realtor, value: any) => {
    const updatedRealtors = [...about.realtors];
    updatedRealtors[index] = { ...updatedRealtors[index], [field]: value };
    setAbout((prev) => ({ ...prev, realtors: updatedRealtors }));
  };

  /**
   * Save handler
   */
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

      {message && (
        <div className={message.includes("Failed") ? "text-red-600" : "text-green-600"}>
          {message}
        </div>
      )}

      {/* Banner */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Banner</h2>

        <input
          type="text"
          className="w-full border p-2"
          value={about.bannerTitle}
          onChange={(e) => updateField("bannerTitle", e.target.value)}
          placeholder="Banner Title"
        />

        <input
          type="text"
          className="w-full border p-2"
          value={about.bannerBackgroundImage}
          onChange={(e) => updateField("bannerBackgroundImage", e.target.value)}
          placeholder="Banner Background Image URL"
        />
      </section>

      {/* About Text Section */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">About Section</h2>

        <input
          type="text"
          className="w-full border p-2"
          value={about.aboutTitle}
          onChange={(e) => updateField("aboutTitle", e.target.value)}
          placeholder="About Title"
        />

        <input
          type="text"
          className="w-full border p-2"
          value={about.aboutSubtitle}
          onChange={(e) => updateField("aboutSubtitle", e.target.value)}
          placeholder="About Subtitle"
        />

        <textarea
          className="w-full border p-2"
          rows={4}
          value={about.aboutParagraph1}
          onChange={(e) => updateField("aboutParagraph1", e.target.value)}
          placeholder="Paragraph 1"
        />

        <textarea
          className="w-full border p-2"
          rows={4}
          value={about.aboutParagraph2}
          onChange={(e) => updateField("aboutParagraph2", e.target.value)}
          placeholder="Paragraph 2"
        />

        <input
          type="text"
          className="w-full border p-2"
          value={about.aboutImage}
          onChange={(e) => updateField("aboutImage", e.target.value)}
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
              onChange={(e) => updateStat(i, "label", e.target.value)}
              placeholder="Stat Label"
            />

            <input
              type="number"
              className="w-full border p-2"
              value={stat.value}
              onChange={(e) => updateStat(i, "value", Number(e.target.value))}
              placeholder="Stat Value"
            />

            <input
              type="text"
              className="w-full border p-2"
              value={stat.icon}
              onChange={(e) => updateStat(i, "icon", e.target.value)}
              placeholder="Stat Icon URL"
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
              stats: [...prev.stats, { label: "", value: 0, icon: "" }],
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
              onChange={(e) => updateRealtor(i, "name", e.target.value)}
              placeholder="Name"
            />

            <input
              type="text"
              className="w-full border p-2"
              value={r.position}
              onChange={(e) => updateRealtor(i, "position", e.target.value)}
              placeholder="Position"
            />

            <input
              type="text"
              className="w-full border p-2"
              value={r.photo}
              onChange={(e) => updateRealtor(i, "photo", e.target.value)}
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
              realtors: [...prev.realtors, { name: "", position: "", photo: "" }],
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
