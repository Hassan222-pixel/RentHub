"use client";

import { useEffect, useMemo, useState } from "react";
import "../properties/properties.css";
import HeroSearch from "../components/Herosearch";
import Newsletter from "../components/Newsletter";
import RecentProperties, { type PropertyCard } from "../components/RecentProperties";
import type { DormListItem as BaseDorm } from "../types/dorms";

type University = {
  name: string;
  area: string;
};

type Dorm = BaseDorm & {
  profileImg?: string | null;
  availableBeds?: number | null;
  isAdminBlocked?: boolean;
  isOccupiedNow?: boolean;
  pricePerMonth?: number | null;
};

export default function PropertiesPage() {
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [filteredDorms, setFilteredDorms] = useState<Dorm[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [universitiesWithAreas, setUniversitiesWithAreas] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        // 🔹 Dorms
        const dormRes = await fetch("/api/dorms", { cache: "no-store" });
        const dormData = await dormRes.json();
        setDorms(dormData.dorms || []);
        setFilteredDorms(dormData.dorms || []);

        // 🔹 Universities (SOURCE OF TRUTH FOR AREAS)
        const uniRes = await fetch("/api/universities", { cache: "no-store" });
        const uniData = await uniRes.json();

        const uniList: University[] = uniData.universities || [];

        setUniversities(uniList.map(u => u.name));
        setUniversitiesWithAreas(uniList);
        setAreas(
          Array.from(new Set(uniList.map(u => u.area).filter(Boolean)))
        );
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const cards: PropertyCard[] = useMemo(() => {
    return filteredDorms.map(d => ({
      id: (d as any)._id,
      title: (d as any).title,
      city: (d as any).city || "Unknown",
      price: d.pricePerMonth ? `$${d.pricePerMonth} / month` : "Contact",
      badge:
        d.isAdminBlocked || d.availableBeds === 0 ? "Not available" : "Available",
      image:
        d.profileImg ||
        "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
      href: `/room-details/${(d as any)._id}`,
    }));
  }, [filteredDorms]);

  return (
    <main className="properties-wrapper">
      {/* HERO */}
      <div className="search-hero">
        <div className="search-hero-overlay">
          <h1>Our Rooms</h1>

          <div className="hero-search-container">
            {!loading && (
              <HeroSearch
                cities={areas}
                universities={universities}
                universitiesWithAreas={universitiesWithAreas}
                initialDorms={dorms}
                onResults={setFilteredDorms}
              />
            )}
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div className="results-title">
        <h2>{filteredDorms.length} Properties found</h2>
        <p>Search your dream room</p>
      </div>

      {!loading && (
        <RecentProperties
          properties={cards}
          title="Available rooms"
          subtitle="Browse all currently active rooms from our renters."
          showButton={false}
        />
      )}

      <Newsletter />
    </main>
  );
}
