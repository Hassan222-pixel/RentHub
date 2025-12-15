// app/dashboard/managers/hero/page.tsx
"use client";

import { useEffect, useState } from "react";

interface HeroData {
  _id?: string;
  backgroundImage: string;
  highlightedH2: string;
  titleH1: string;
  subtitleH2: string;
}

export default function HeroManagerPage() {
  // ✅ FIX: hero state should NEVER be null
  const [hero, setHero] = useState<HeroData>({
    backgroundImage: "",
    highlightedH2: "",
    titleH1: "",
    subtitleH2: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch("/api/hero");
        if (!res.ok) throw new Error("Failed to fetch hero");
        const data = await res.json();

        // ✅ FIX: always fall back to "" instead of undefined
        setHero({
          backgroundImage: data?.backgroundImage ?? "",
          highlightedH2: data?.highlightedH2 ?? "",
          titleH1: data?.titleH1 ?? "",
          subtitleH2: data?.subtitleH2 ?? "",
        });
      } catch (err: any) {
        setError(err.message || "Error loading hero");
      } finally {
        setLoading(false);
      }
    };

    fetchHero();
  }, []);

  const handleChange = (field: keyof HeroData, value: string) => {
    setHero({ ...hero, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hero),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to save hero");
      }

      const updated = await res.json();
      setHero(updated);
      setSuccess("Hero section updated successfully.");
    } catch (err: any) {
      setError(err.message || "Error saving hero");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading hero data...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hero Section Settings</h1>

      <p className="text-sm text-gray-500 mb-6">
        Edit the hero background image and text shown on the main website for the dormitory.
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Background Image URL */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Background Image URL
          </label>
          <input
            type="text"
            value={hero.backgroundImage}
            onChange={(e) => handleChange("backgroundImage", e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="https://example.com/hero.jpg"
          />
          <p className="mt-1 text-xs text-gray-500">
            Paste the URL of the hero background image. (You can later replace this with an upload field.)
          </p>

          {hero.backgroundImage && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>

              <div
                className="w-full h-40 rounded-md border bg-cover bg-center"
                style={{ backgroundImage: `url(${hero.backgroundImage})` }}
              />
            </div>
          )}
        </div>

        {/* Highlighted H2 */}
        <div>
          <label className="block text-sm font-medium mb-1">Highlighted H2</label>
          <input
            type="text"
            value={hero.highlightedH2}
            onChange={(e) => handleChange("highlightedH2", e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Modern & Affordable"
          />
        </div>

        {/* Title H1 */}
        <div>
          <label className="block text-sm font-medium mb-1">Main Title (H1)</label>
          <input
            type="text"
            value={hero.titleH1}
            onChange={(e) => handleChange("titleH1", e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="Dormitory Rooms For Rent"
          />
        </div>

        {/* Subtitle H2 */}
        <div>
          <label className="block text-sm font-medium mb-1">Subtitle (H2)</label>
          <textarea
            value={hero.subtitleH2}
            onChange={(e) => handleChange("subtitleH2", e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm"
            rows={3}
            placeholder="Safe, clean, and convenient accommodation designed for students & workers."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm
                     bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
