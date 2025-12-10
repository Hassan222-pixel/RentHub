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
  university?: string;
  pricePerNight?: number | null;
  pricePerWeek?: number | null;
  pricePerMonth?: number | null;
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
        // 1) Load dorms
        const dormRes = await fetch("/api/dorms", { cache: "no-store" });
        const dormData = await dormRes.json();
        const dormList: DormListItem[] = dormData.dorms || [];

        setDorms(dormList);
        setFilteredDorms(dormList);

        // derive cities from dorms
        const uniqueCities = [
          ...new Set(dormList.map((d) => d.city).filter(Boolean) as string[]),
        ];
        setCities(uniqueCities);

        // 2) Load universities (from API)
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
  const cards: PropertyCard[] = filteredDorms.map((d) => ({
    id: d._id,
    title: d.title,
    city: [d.city, d.university].filter(Boolean).join(" · ") || "Unknown",
    price: formatPrice(d),
    badge: d.roomType ? d.roomType.toUpperCase() : undefined,
    image:
      d.profileImg ||
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
    href: `/room-details/${d._id}`,
  }));

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

      {/* ROOMS LIST USING RecentProperties DESIGN */}
      <RecentProperties
        properties={cards}
        title="Available rooms"
        subtitle="Browse all currently active rooms from our renters."
        showButton={false}
      />

      {/* OUR CITIES SECTION */}
      <div className="our_room" style={{ marginTop: "70px" }}>
        <div className="container">
          <div className="titlepage text-center mb-4">
            <h2>Our Cities</h2>
            <p>Select a city to explore available dorms</p>
          </div>

          <div className="row">
            {cities.map((city) => (
              <div key={city} className="col-md-4 col-sm-6 mb-4">
                <div className="room city_card">
                  <div className="bed_room text-center p-4">
                    <h3>{city}</h3>
                    <p>View all dormitories located in {city}</p>
                    <a href={`/city/${city}`} className="read_more">
                      View City
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {cities.length === 0 && !loading && (
              <p className="text-center w-100">No cities available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* OUR UNIVERSITIES SECTION */}
      <div className="our_room" style={{ marginTop: "70px" }}>
        <div className="container">
          <div className="titlepage text-center mb-4">
            <h2>Our Universities</h2>
            <p>Select a university to view nearby dormitories</p>
          </div>

          <div className="row">
            {universities.map((univ) => (
              <div key={univ} className="col-md-4 col-sm-6 mb-4">
                <div className="room city_card">
                  <div className="bed_room text-center p-4">
                    <h3>{univ}</h3>
                    <p>Dormitories near {univ}</p>
                    <a href={`/university/${univ}`} className="read_more">
                      View University
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {universities.length === 0 && !loading && (
              <p className="text-center w-100">
                No universities available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
