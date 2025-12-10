"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./hero-search.css";
import type { DormListItem } from "../room/page";

type Props = {
  cities?: string[]; // optional so HeroSearch can be used on other pages
  universities?: string[];
  initialDorms?: DormListItem[];
  onResults?: (dorms: DormListItem[]) => void;
};

// Used when checking confirmed bookings
type BookingSummary = {
  startDate: string;
  endDate: string;
};

export default function HeroSearch({
  cities = [], // safe defaults so .map() never crashes
  universities = [],
  initialDorms,
  onResults,
}: Props) {
  const [roomType, setRoomType] = useState<
    "" | "private" | "double" | "shared"
  >("");
  const [city, setCity] = useState("");
  const [university, setUniversity] = useState("");

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;

  const [loading, setLoading] = useState(false);

  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  // ---- availability helper (same idea as RoomFilterList) ----
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
      ) {
        return false;
      }

      return existingStart < requestedEnd && existingEnd > requestedStart;
    });
  }

  // ---- MAIN SEARCH ----
  const handleSearch = async () => {
    // If HeroSearch is used on a page without filtering (e.g. /news),
    // just do nothing on click – avoid unnecessary fetching.
    if (!onResults) return;

    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (roomType) params.set("roomType", roomType);
      // very simple usage of q – you can improve later if you want
      if (city) params.set("q", city);
      if (university) params.set("q", university);

      const url =
        params.toString().length > 0
          ? `/api/dorms?${params.toString()}`
          : "/api/dorms";

      const res = await fetch(url);
      const data = await res.json();

      let filtered: DormListItem[] = data.dorms || [];

      // filter by date availability only when a range is selected
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
            // if bookings fail, keep the dorm visible (fail-open)
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

  // ---- CLEAR ----
  const handleClear = () => {
    setRoomType("");
    setCity("");
    setUniversity("");
    setDateRange([null, null]);

    // Only reset list if /room passed data into this component
    if (onResults && initialDorms) {
      onResults(initialDorms);
    }
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

      {/* City */}
      <select value={city} onChange={(e) => setCity(e.target.value)}>
        <option value="">City</option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* University */}
      <select
        value={university}
        onChange={(e) => setUniversity(e.target.value)}
      >
        <option value="">University</option>
        {universities.map((u) => (
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

      {/* Buttons */}
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
