/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { DormListItem } from "../types/dorms";

type BookingSummary = {
  startDate: string;
  endDate: string;
};

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

  const [searchText, setSearchText] = useState("");
  const [roomType, setRoomType] = useState<
    "" | "private" | "double" | "shared"
  >("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;

  const [notifications, setNotifications] = useState<ConflictNotification[]>(
    []
  );
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<
    string[]
  >([]);

  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

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

  function formatDate(value: string) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  }

  useEffect(() => {
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (stored) {
      try {
        setDismissedNotificationIds(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch("/api/bookings/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Error loading client notifications:", err);
      }
    };

    loadNotifications();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchText.trim()) params.set("q", searchText.trim());
      if (roomType) params.set("roomType", roomType);

      if (searchText.trim()) params.set("q", searchText.trim());
      if (roomType) params.set("roomType", roomType);

      const queryString = params.toString();
      const url = queryString ? `/api/dorms?${queryString}` : "/api/dorms";

      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to apply filters.");
      }

      const data = await res.json();
      let filteredDorms: DormListItem[] = data.dorms || [];

      // ✅ Immediately remove admin-blocked dorms
      filteredDorms = filteredDorms.filter(
        (d) => d.adminAvailability !== "not_available" && !d.isAdminBlocked
      );

      if (startDate && endDate) {
        const available: DormListItem[] = [];

        for (const dorm of filteredDorms) {
          const r = await fetch(`/api/bookings?dormId=${dorm._id}`);
          if (!r.ok) {
            available.push(dorm);
            continue;
          }

            if (!bookingsRes.ok) {
              availableDorms.push(dorm);
              continue;
            }

            const bookingsData = await bookingsRes.json();
            const bookings: BookingSummary[] = bookingsData.bookings || [];

            const overlap = hasOverlap(start, end, bookings);
            if (!overlap) availableDorms.push(dorm);
          } catch (err) {
            console.error("Error checking bookings for dorm:", dorm._id, err);
            availableDorms.push(dorm);
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
    setError(null);

    // ✅ keep only dorms not blocked by admin in initial list
    setDorms(
      initialDorms.filter(
        (d) => d.adminAvailability !== "not_available" && !d.isAdminBlocked
      )
    );
  };

  const handleDismissNotification = (id: string) => {
    setDismissedNotificationIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save dismissed notifications", err);
      }
      return next;
    });
  };

  const visibleNotifications = notifications.filter(
    (n) => !dismissedNotificationIds.includes(n.id)
  );

  // ----------------- UI -----------------

  return (
    <>
      {visibleNotifications.length > 0 && (
        <div className="mb-3">
          {visibleNotifications.map((n) => (
            <div
              key={n.id}
              style={{
                backgroundColor: "#ffdddd",
                border: "1px solid #ff4d4f",
                padding: "10px 14px",
                borderRadius: "6px",
                color: "#a10000",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span>
                Sorry, someone already booked <strong>{n.dormTitle}</strong> for
                your requested dates ({formatDate(n.startDate)} –{" "}
                {formatDate(n.endDate)}).
              </span>

              <button
                type="button"
                onClick={() => handleDismissNotification(n.id)}
                style={{
                  marginLeft: "12px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  lineHeight: 1,
                  color: "#a10000",
                }}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ))}

      <div
        className="mb-4 p-3"
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <div
            className="d-flex align-items-center px-3 py-2"
            style={{
              borderRadius: "8px",
              border: "1px solid #ddd",
              flex: "1 1 220px",
              minWidth: "200px",
            }}
          >
            <span
              style={{ marginRight: "8px", fontSize: "16px" }}
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              type="text"
              className="form-control border-0 p-0"
              placeholder="Search city, university, or title"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ boxShadow: "none" }}
            />
          </div>

          <div
            className="d-flex align-items-center px-3 py-2"
            style={{
              borderRadius: "8px",
              border: "1px solid #ddd",
              flex: "1 1 220px",
              minWidth: "200px",
            }}
          >
            <span
              style={{ marginRight: "8px", fontSize: "16px" }}
              aria-hidden="true"
            >
              📅
            </span>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) =>
                setDateRange(update as [Date | null, Date | null])
              }
              minDate={today}
              dateFormat="dd MMM yyyy"
              placeholderText="Check-in — Check-out"
              className="form-control border-0 p-0"
              wrapperClassName="w-100"
            />
          </div>

          <div
            className="d-flex align-items-center px-3 py-2"
            style={{
              borderRadius: "8px",
              border: "1px solid #ddd",
              flex: "0 0 200px",
              minWidth: "160px",
            }}
          >
            <option value="">Room type (Any)</option>
            <option value="private">Private</option>
            <option value="double">Double</option>
            <option value="shared">Shared</option>
          </select>

          <div className="d-flex gap-2 ms-auto">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>
      </div> */}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        {dorms.length === 0 && !loading && (
          <div className="col-md-12">
            <p>No rooms match your filters.</p>
          </div>
        )}

        {loading && (
          <div className="col-md-12">
            <p>Loading rooms...</p>
          </div>
        )}

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
