"use client";

import { useEffect, useState } from "react";
import "../properties/properties.css";
import HeroSearch from "../components/Herosearch";
import Newsletter from "../components/Newsletter";
import RoomFilterList from "../room/RoomFilterList";
import type { DormListItem } from "../types/dorms";

export default function PropertiesPage() {
  const [initialDorms, setInitialDorms] = useState<DormListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDorms = async () => {
      try {
        const res = await fetch("/api/dorms", { cache: "no-store" });
        const data = await res.json();
        setInitialDorms(data.dorms || []);
      } catch (err) {
        console.error("Failed to load properties", err);
      } finally {
        setLoading(false);
      }
    };

    loadDorms();
  }, []);

  return (
    <main className="properties-wrapper">
      {/* HERO */}
      <div className="search-hero">
        <div className="search-hero-overlay">
          <h1>Our Rooms</h1>
          <p className="breadcrumb">Home / Rooms</p>

          <div className="hero-search-container">
            <HeroSearch />
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div className="results-title">
        <h2>
          {loading ? "Loading properties..." : `${initialDorms.length} Properties found`}
        </h2>
        <p>Search your dream room</p>
      </div>

      {/* PROPERTIES LIST (REUSED LOGIC) */}
      {!loading && <RoomFilterList initialDorms={initialDorms} />}

      <Newsletter />
    </main>
  );
}
