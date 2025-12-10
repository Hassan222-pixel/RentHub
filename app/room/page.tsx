/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import HeroSearch from "../components/Herosearch";
import RecentProperties, {
  type PropertyCard,
} from "../components/RecentProperties";

export type DormListItem = {
  _id: string;
  title: string;
  description: string;
  profileImg?: string | null;
  roomType?: "private" | "double" | "shared" | null;
  city?: string;
  pricePerNight?: number | null;
  pricePerWeek?: number | null;
  pricePerMonth?: number | null;
  maxOccupants?: number | null;
  genderPreference?: "any" | "male" | "female" | null;

  // availability info coming from /api/dorms
  isOccupiedNow?: boolean;
  occupiedUntil?: string | null;

  // ✅ NEW: capacity & availableBeds for multi-tenant logic
  capacity?: number | null;
  availableBeds?: number | null;
};

function formatPrice(d: DormListItem): string {
  if (d.pricePerMonth != null) {
    return `$${d.pricePerMonth.toLocaleString()} / month`;
  }
  if (d.pricePerWeek != null) {
    return `$${d.pricePerWeek.toLocaleString()} / week`;
  }
  if (d.pricePerNight != null) {
    return `$${d.pricePerNight.toLocaleString()} / night`;
  }
  return "Contact for price";
}

// ✅ beds label now uses availableBeds if it exists (for double/shared logic)
function formatBeds(d: DormListItem): string {
  // If API sends availableBeds, we show how many beds are still free
  if (typeof d.availableBeds === "number") {
    if (d.availableBeds <= 0) {
      return "🛏️ No beds available";
    }
    const label = d.availableBeds === 1 ? "bed available" : "beds available";
    return `🛏️ ${d.availableBeds} ${label}`;
  }

  // Fallback to old static logic (in case API does not send availableBeds)
  if (d.roomType === "private") {
    return "🛏️ 1 bed";
  }
  if (d.roomType === "double") {
    return "🛏️ 2 beds";
  }
  if (d.roomType === "shared") {
    const count = d.maxOccupants ?? 1;
    const label = count === 1 ? "bed" : "beds";
    return `🛏️ ${count} ${label}`;
  }
  return "🛏️ N/A";
}

function formatGender(d: DormListItem): string {
  const pref = d.genderPreference || "any";
  if (pref === "male") {
    return "👨 Only male";
  }
  if (pref === "female") {
    return "👩 Only female";
  }
  return "👨👩 Any";
}

export default function RoomPage() {
  const [dorms, setDorms] = useState<DormListItem[]>([]);
  const [filteredDorms, setFilteredDorms] = useState<DormListItem[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dorms & universities on first render
  useEffect(() => {
    const loadData = async () => {
      try {
        const dormRes = await fetch("/api/dorms", { cache: "no-store" });
        const dormData = await dormRes.json();
        const dormList: DormListItem[] = dormData.dorms || [];

        setDorms(dormList);
        setFilteredDorms(dormList);

        const uniqueCities = [
          ...new Set(dormList.map((d) => d.city).filter(Boolean) as string[]),
        ];
        setCities(uniqueCities);

        const uniRes = await fetch("/api/universities", {
          cache: "no-store",
        });
        if (uniRes.ok) {
          const uniData = await uniRes.json();
          const uniNames: string[] = (uniData.universities || []).map(
            (u: any) => u.name as string
          );
          setUniversities(uniNames);
        } else {
          setUniversities([]);
        }
      } catch (err) {
        console.error("Failed to load room data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Build cards for RecentProperties based on filtered dorms
  const cards: PropertyCard[] = filteredDorms.map((d) => {
    // ✅ If availableBeds is provided, we consider Not available only when <= 0
    const isFullyOccupied =
      typeof d.availableBeds === "number"
        ? d.availableBeds <= 0
        : d.isOccupiedNow === true;

    const statusBadge = isFullyOccupied ? "Not available" : "Available";

    const cityLine = d.city || "Unknown";

    return {
      id: d._id,
      title: d.title,
      city: cityLine,
      price: formatPrice(d),
      badge: statusBadge,
      image:
        d.profileImg ||
        "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
      href: `/room-details/${d._id}`,
      bedsLabel: formatBeds(d),
      genderLabel: formatGender(d),
    };
  });

  return (
    <div className="main-layout">
      {/* HERO + SEARCH */}
      <section className="our_room">
        <div className="container">
          <div className="titlepage text-center mb-4">
            <h2>Find a Room</h2>
            <p>Search and browse available rooms near your university.</p>
          </div>

          <div className="d-flex justify-content-center mb-4">
            {!loading && (
              <HeroSearch
                cities={cities}
                universities={universities}
                initialDorms={dorms}
                onResults={(filtered) => setFilteredDorms(filtered)}
              />
            )}
          </div>

          {loading && (
            <p className="text-center" style={{ marginTop: "10px" }}>
              Loading rooms...
            </p>
          )}
        </div>
      </section>

      {/* ✅ ROOMS LIST ONLY */}
      <RecentProperties
        properties={cards}
        title="Available rooms"
        subtitle="Browse all currently active rooms from our renters."
        showButton={false}
      />
    </div>
  );
}
