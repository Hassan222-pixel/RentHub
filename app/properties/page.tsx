"use client";

import { useEffect, useMemo, useState } from "react";
import "../properties/properties.css";
import HeroSearch from "../components/Herosearch";
import Newsletter from "../components/Newsletter";
import RecentProperties, { type PropertyCard } from "../components/RecentProperties";
import type { DormListItem as BaseDorm } from "../types/dorms";

// ✅ extend the dorm type locally (does NOT require changing ../types/dorms)
type Dorm = BaseDorm & {
  profileImg?: string | null;
  roomType?: "private" | "double" | "shared" | null;
  city?: string;
  university?: string;

  pricePerNight?: number | null;
  pricePerWeek?: number | null;
  pricePerMonth?: number | null;

  maxOccupants?: number | null;
  genderPreference?: "any" | "male" | "female" | null;

  isOccupiedNow?: boolean;
  availableBeds?: number | null;
  availableFrom?: string | null;

  isAdminBlocked?: boolean;
};

function formatPrice(d: Dorm): string {
  if (d.pricePerMonth != null) return `$${Number(d.pricePerMonth).toLocaleString()} / month`;
  if (d.pricePerWeek != null) return `$${Number(d.pricePerWeek).toLocaleString()} / week`;
  if (d.pricePerNight != null) return `$${Number(d.pricePerNight).toLocaleString()} / night`;
  // fallback if your base type uses another field name
  // @ts-ignore
  if (d.price != null) return `$${Number((d as any).price).toLocaleString()} / month`;
  return "Contact for price";
}

function formatBeds(d: Dorm): string {
  if (typeof d.availableBeds === "number") {
    if (d.availableBeds <= 0) return "🛏️ No beds available";
    const label = d.availableBeds === 1 ? "bed available" : "beds available";
    return `🛏️ ${d.availableBeds} ${label}`;
  }

  if (d.roomType === "private") return "🛏️ 1 bed";
  if (d.roomType === "double") return "🛏️ 2 beds";
  if (d.roomType === "shared") {
    const count = d.maxOccupants ?? 1;
    const label = count === 1 ? "bed" : "beds";
    return `🛏️ ${count} ${label}`;
  }

  return "🛏️ N/A";
}

function formatGender(d: Dorm): string {
  const pref = d.genderPreference || "any";
  if (pref === "male") return "👨 Only male";
  if (pref === "female") return "👩 Only female";
  return "👨👩 Any";
}

function formatFrom(d: Dorm): string {
  if (d.isAdminBlocked) return "";
  if (!d.availableFrom) return "";
  const dt = new Date(d.availableFrom);
  if (Number.isNaN(dt.getTime())) return "";
  const label = dt.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return `From ${label}`;
}

export default function PropertiesPage() {
  const [dorms, setDorms] = useState<Dorm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDorms = async () => {
      try {
        const res = await fetch("/api/dorms", { cache: "no-store" });
        const data = await res.json();
        setDorms((data.dorms || []) as Dorm[]);
      } catch (err) {
        console.error("Failed to load properties", err);
      } finally {
        setLoading(false);
      }
    };

    loadDorms();
  }, []);

  const cards: PropertyCard[] = useMemo(() => {
    return dorms.map((d) => {
      const isFullyOccupied =
        d.isAdminBlocked === true ||
        (typeof d.availableBeds === "number"
          ? d.availableBeds <= 0
          : d.isOccupiedNow === true);

      return {
        id: (d as any)._id ?? (d as any).id, // support both
        title: (d as any).title ?? "Room",
        city: (d as any).city ?? "Unknown",
        price: formatPrice(d),
        badge: isFullyOccupied ? "Not available" : "Available",
        image:
          d.profileImg ||
          (d as any).image ||
          "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
        href: `/room-details/${(d as any)._id ?? (d as any).id}`,
        bedsLabel: formatBeds(d),
        availableFromLabel: formatFrom(d),
        genderLabel: formatGender(d),
      };
    });
  }, [dorms]);

  return (
    <main className="properties-wrapper">
      {/* HERO (old style) */}
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
        <h2>{loading ? "Loading properties..." : `${dorms.length} Properties found`}</h2>
        <p>Search your dream room</p>
      </div>

      {/* NEW cards */}
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
