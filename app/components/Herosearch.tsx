"use client";

import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./hero-search.css";
import type { DormListItem } from "../room/page";

type Props = {
  // بدل cities (دورم city) رح نستعملها كـ Areas
  cities?: string[]; // AREAS list (Beirut/Tripoli/...)
  // backward compat: ممكن تكون string[]
  universities?: string[];

  // ✅ الأفضل: تبعت الجامعات مع area
  universitiesWithAreas?: { name: string; area: string }[];

  initialDorms?: DormListItem[];
  onResults?: (dorms: DormListItem[]) => void;
};

type BookingSummary = {
  startDate: string;
  endDate: string;
};

export default function HeroSearch({
  cities = [],
  universities = [],
  universitiesWithAreas = [],
  initialDorms,
  onResults,
}: Props) {
  const [roomType, setRoomType] = useState<
    "" | "private" | "double" | "shared"
  >("");

  // ✅ بدل city صارت Area
  const [area, setArea] = useState("");
  const [university, setUniversity] = useState("");

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;

  const [loading, setLoading] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  function hasOverlap(
    requestedStart: Date,
    requestedEnd: Date,
    bookings: BookingSummary[]
  ): boolean {
    return bookings.some((b) => {
      const existingStart = new Date(b.startDate);
      const existingEnd = new Date(b.endDate);
      if (
        Number.isNaN(existingStart.getTime()) ||
        Number.isNaN(existingEnd.getTime())
      )
        return false;

      return existingStart < requestedEnd && existingEnd > requestedStart;
    });
  }

  // ✅ university options based on area
  const filteredUniversities = useMemo(() => {
    // إذا عنا universitiesWithAreas (الأفضل)
    if (universitiesWithAreas.length > 0) {
      const list =
        area.trim().length > 0
          ? universitiesWithAreas.filter((u) => u.area === area)
          : universitiesWithAreas;

      // unique names
      return Array.from(new Set(list.map((u) => u.name))).sort();
    }

    // fallback: إذا الجامعات بس أسماء
    return [...universities].sort();
  }, [area, universities, universitiesWithAreas]);

  // ✅ helper: universities in selected area (لما area تختار بدون university)
  const universitiesInSelectedArea = useMemo(() => {
    if (!area || universitiesWithAreas.length === 0) return [];
    return universitiesWithAreas
      .filter((u) => u.area === area)
      .map((u) => u.name);
  }, [area, universitiesWithAreas]);

  const handleSearch = async () => {
    if (!onResults) return;

    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (roomType) params.set("roomType", roomType);

      // ✅ إذا الجامعة مختارة، خلّي البحث عليها مباشرة
      if (university) params.set("q", university);

      const url =
        params.toString().length > 0
          ? `/api/dorms?${params.toString()}`
          : "/api/dorms";

      const res = await fetch(url);
      const data = await res.json();

      let filtered: DormListItem[] = data.dorms || [];

      // ✅ إذا area مختار وما في university، فلتر حسب الجامعات تبع هالـ area
      if (area && !university && universitiesInSelectedArea.length > 0) {
        const allowed = new Set(universitiesInSelectedArea);
        filtered = filtered.filter((d) =>
          d.university ? allowed.has(d.university) : false
        );
      }

      // ✅ فلترة date range
      if (startDate && endDate) {
        const available: DormListItem[] = [];

        for (const dorm of filtered) {
          try {
            const bookingsRes = await fetch(
              `/api/bookings?dormId=${encodeURIComponent(dorm._id)}`
            );

            if (!bookingsRes.ok) {
              available.push(dorm);
              continue;
            }

            const bookingsData = await bookingsRes.json();
            const bookings: BookingSummary[] = bookingsData.bookings || [];

            const overlap = hasOverlap(startDate, endDate, bookings);
            if (!overlap) available.push(dorm);
          } catch {
            available.push(dorm);
          }
        }

        filtered = available;
      }

      onResults(filtered);
    } catch (err) {
      console.error("HeroSearch filter error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRoomType("");
    setArea("");
    setUniversity("");
    setDateRange([null, null]);

    if (onResults && initialDorms) onResults(initialDorms);
  };

  return (
    <div className="search-box-full">
      {/* Room Type */}
      <select
        value={roomType}
        onChange={(e) =>
          setRoomType(e.target.value as "" | "private" | "double" | "shared")
        }
      >
        <option value="">Room Type</option>
        <option value="private">Private</option>
        <option value="double">Double</option>
        <option value="shared">Shared</option>
      </select>

      {/* ✅ Area (was City) */}
      <select
        value={area}
        onChange={(e) => {
          setArea(e.target.value);
          setUniversity(""); // ✅ reset الجامعة لما area تتغير
        }}
      >
        <option value="">Area</option>
        {cities.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      {/* University */}
      <select
        value={university}
        onChange={(e) => setUniversity(e.target.value)}
      >
        <option value="">University</option>
        {filteredUniversities.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>

      {/* Date range */}
      <div className="date-wrapper">
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update) =>
            setDateRange(update as [Date | null, Date | null])
          }
          minDate={today}
          dateFormat="dd MMM yyyy"
          placeholderText="Start Date - End Date"
          className="datepicker-input"
        />
      </div>

      <button className="search-btn" onClick={handleSearch} disabled={loading}>
        {loading ? "SEARCHING..." : "SEARCH"}
      </button>

      <button
        className="search-btn clear-btn"
        type="button"
        onClick={handleClear}
      >
        CLEAR
      </button>
    </div>
  );
}
