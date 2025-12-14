/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { DormListItem } from "../types/dorms";

// Used when we check confirmed bookings for a dorm
type BookingSummary = {
  startDate: string;
  endDate: string;
};

// Notification type returned from /api/bookings/me
type ConflictNotification = {
  id: string;
  dormTitle: string;
  startDate: string;
  endDate: string;
};

type Props = {
  initialDorms: DormListItem[];
};

const DISMISSED_KEY = "renthub_dismissed_conflict_notifications";

/* 🔹 PRICE FORMATTER (reused from room/page.tsx logic) */
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

export default function RoomFilterList({ initialDorms }: Props) {
  const [dorms, setDorms] = useState<DormListItem[]>(initialDorms);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [roomType, setRoomType] = useState<
    "" | "private" | "double" | "shared"
  >("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;

  // Notifications
  const [notifications, setNotifications] = useState<ConflictNotification[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<
    string[]
  >([]);

  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  // ----------------- HELPERS -----------------

  function hasOverlap(
    requestedStart: Date,
    requestedEnd: Date,
    bookings: BookingSummary[]
  ): boolean {
    return bookings.some((b) => {
      const existingStart = new Date(b.startDate);
      const existingEnd = new Date(b.endDate);
      return existingStart < requestedEnd && existingEnd > requestedStart;
    });
  }

  function formatDate(value: string) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  }

  // ----------------- EFFECTS -----------------

  useEffect(() => {
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (stored) {
      try {
        setDismissedNotificationIds(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    fetch("/api/bookings/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setNotifications(d.notifications || []))
      .catch(() => {});
  }, []);

  // ----------------- HANDLERS -----------------

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchText.trim()) params.set("q", searchText.trim());
      if (roomType) params.set("roomType", roomType);

      const res = await fetch(
        params.toString() ? `/api/dorms?${params}` : "/api/dorms"
      );

      if (!res.ok) throw new Error("Failed to load properties");

      const data = await res.json();
      let filteredDorms: DormListItem[] = data.dorms || [];

      if (startDate && endDate) {
        const available: DormListItem[] = [];

        for (const dorm of filteredDorms) {
          const r = await fetch(`/api/bookings?dormId=${dorm._id}`);
          if (!r.ok) {
            available.push(dorm);
            continue;
          }

          const b = await r.json();
          if (!hasOverlap(startDate, endDate, b.bookings || [])) {
            available.push(dorm);
          }
        }

        filteredDorms = available;
      }

      setDorms(filteredDorms);
    } catch (e: any) {
      setError(e.message || "Failed to apply filters");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchText("");
    setRoomType("");
    setDateRange([null, null]);
    setDorms(initialDorms);
    setError(null);
  };

  const visibleNotifications = notifications.filter(
    (n) => !dismissedNotificationIds.includes(n.id)
  );

  // ----------------- UI -----------------

  return (
    <>
      {/* NOTIFICATIONS */}
      {visibleNotifications.map((n) => (
        <div
          key={n.id}
          className="alert alert-danger d-flex justify-content-between align-items-center"
        >
          <span>
            Someone already booked <strong>{n.dormTitle}</strong> (
            {formatDate(n.startDate)} – {formatDate(n.endDate)})
          </span>
          <button
            onClick={() =>
              setDismissedNotificationIds((p) => {
                const next = [...p, n.id];
                localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
                return next;
              })
            }
            style={{
              background: "transparent",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      ))}

      {/* FILTER BAR (UNCHANGED FUNCTIONALITY) */}
      {/* <div
        className="mb-4 p-3"
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <input
            type="text"
            placeholder="Search city, university, or title"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="form-control"
            style={{ maxWidth: "260px" }}
          />

          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) =>
              setDateRange(update as [Date | null, Date | null])
            }
            minDate={today}
            placeholderText="Check-in — Check-out"
            className="form-control"
          />

          <select
            className="form-select"
            value={roomType}
            onChange={(e) =>
              setRoomType(
                e.target.value as "" | "private" | "double" | "shared"
              )
            }
            style={{ maxWidth: "200px" }}
          >
            <option value="">Room type (Any)</option>
            <option value="private">Private</option>
            <option value="double">Double</option>
            <option value="shared">Shared</option>
          </select>

          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>

          <button
            className="btn btn-outline-secondary"
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </div> */}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ✅ PROPERTIES GRID (BLSKY STYLE) */}
      <div className="property-grid">
        {loading && <p>Loading properties...</p>}
        {!loading && dorms.length === 0 && <p>No properties found.</p>}

        {!loading &&
          dorms.map((dorm) => (
            <Link
              key={dorm._id}
              href={`/room-details/${dorm._id}`}
              className="property-card"
            >
              <div
                className="property-img"
                style={{
                  backgroundImage: `url(${
                    dorm.profileImg ||
                    "https://images.unsplash.com/photo-1523217582562-09d0def993a6"
                  })`,
                }}
              >
                {dorm.roomType && (
                  <span className="badge badge-new">
                    {dorm.roomType.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="property-info">
                <p className="city">{dorm.city}</p>
                <h3>{dorm.title}</h3>
                <p className="price">{formatPrice(dorm)}</p>
              </div>

              <div className="property-footer">
                <span>🛏 {dorm.roomType}</span>
                <span>🎓 {dorm.university}</span>
                <span>📍 {dorm.city}</span>
              </div>
            </Link>
          ))}
      </div>
    </>
  );
}
