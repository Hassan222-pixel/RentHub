/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// app/room/RoomFilterList.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { DormListItem } from "./page";

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

export default function RoomFilterList({ initialDorms }: Props) {
  const [dorms, setDorms] = useState<DormListItem[]>(initialDorms);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [roomType, setRoomType] = useState<
    "" | "private" | "double" | "shared"
  >("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;

  // Client notifications (conflict bookings)
  const [notifications, setNotifications] = useState<ConflictNotification[]>(
    []
  );
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<
    string[]
  >([]);

  // "Today" with time removed (used as minDate in DatePicker)
  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  // ----- Helpers -----

  // Check if the requested [start, end] overlaps existing confirmed bookings
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

      // Overlap if: existingStart < requestedEnd AND existingEnd > requestedStart
      return existingStart < requestedEnd && existingEnd > requestedStart;
    });
  }

  // Format date string nicely for the notification
  function formatDate(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  }

  // ----- Load dismissed notifications from localStorage once -----
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDismissedNotificationIds(parsed);
        }
      }
    } catch (err) {
      console.error(
        "Failed to read dismissed notifications from localStorage",
        err
      );
    }
  }, []);

  // ----- Load client conflict notifications once on mount -----
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch("/api/bookings/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          // If user is not logged in as client, API returns notifications: []
          return;
        }

        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Error loading client notifications:", err);
      }
    };

    loadNotifications();
  }, []);

  // ----- Search / filter handler -----
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params for /api/dorms
      const params = new URLSearchParams();

      if (searchText.trim()) {
        params.set("q", searchText.trim());
      }

      if (roomType) {
        params.set("roomType", roomType);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/dorms?${queryString}` : "/api/dorms";

      // 1) Filter by text + room type via backend
      const res = await fetch(url, { method: "GET" });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message || "Failed to apply filters.";
        throw new Error(msg);
      }

      const data = await res.json();
      let filteredDorms: DormListItem[] = data.dorms || [];

      // 2) If user picked a date range, filter rooms by availability (no overlap with confirmed bookings)
      if (startDate && endDate) {
        const start = startDate;
        const end = endDate;

        const availableDorms: DormListItem[] = [];

        for (const dorm of filteredDorms) {
          try {
            const bookingsRes = await fetch(
              `/api/bookings?dormId=${encodeURIComponent(dorm._id)}`,
              { method: "GET" }
            );

            if (!bookingsRes.ok) {
              // If bookings cannot be loaded, keep dorm visible as fallback
              availableDorms.push(dorm);
              continue;
            }

            const bookingsData = await bookingsRes.json();
            const bookings: BookingSummary[] = bookingsData.bookings || [];

            const overlap = hasOverlap(start, end, bookings);

            if (!overlap) {
              availableDorms.push(dorm);
            }
          } catch (err) {
            console.error("Error checking bookings for dorm:", dorm._id, err);
            // In case of error, keep dorm as available (fail-open)
            availableDorms.push(dorm);
          }
        }

        filteredDorms = availableDorms;
      }

      setDorms(filteredDorms);
    } catch (err: any) {
      console.error("Filter error:", err);
      setError(err.message || "Failed to load filtered rooms.");
    } finally {
      setLoading(false);
    }
  };

  // ----- Clear button handler -----
  const handleClear = () => {
    setSearchText("");
    setRoomType("");
    setDateRange([null, null]);
    setError(null);
    setDorms(initialDorms);
  };

  // X button handler: dismiss one notification + store it in localStorage
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

  // Only show notifications that were not dismissed with X
  const visibleNotifications = notifications.filter(
    (n) => !dismissedNotificationIds.includes(n.id)
  );

  return (
    <>
      {/* CLIENT NOTIFICATIONS: red banner with X button */}
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

              {/* X button to dismiss the message */}
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
      )}

      {/* FILTER BAR */}
      <div
        className="mb-4 p-3"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {/* Search input */}
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
              style={{
                boxShadow: "none",
              }}
            />
          </div>

          {/* Date range picker */}
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

          {/* Room type select */}
          <div
            className="d-flex align-items-center px-3 py-2"
            style={{
              borderRadius: "8px",
              border: "1px solid #ddd",
              flex: "0 0 200px",
              minWidth: "160px",
            }}
          >
            <span
              style={{ marginRight: "8px", fontSize: "16px" }}
              aria-hidden="true"
            >
              🛏
            </span>
            <select
              className="form-select border-0 p-0"
              value={roomType}
              onChange={(e) =>
                setRoomType(
                  e.target.value as "" | "private" | "double" | "shared"
                )
              }
              style={{ boxShadow: "none", backgroundColor: "transparent" }}
            >
              <option value="">Room type (Any)</option>
              <option value="private">Private</option>
              <option value="double">Double</option>
              <option value="shared">Shared</option>
            </select>
          </div>

          {/* Buttons */}
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
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* ROOMS LIST */}
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
            <div key={dorm._id} className="col-md-4 col-sm-6 mb-4">
              <Link
                href={`/room-details/${dorm._id}`}
                className="text-decoration-none"
              >
                <div id="serv_hover" className="room">
                  <div className="room_img">
                    <figure>
                      <img
                        src={dorm.profileImg || "/template/images/room1.jpg"}
                        alt={dorm.title}
                      />
                    </figure>
                  </div>
                  <div className="bed_room">
                    <h3>{dorm.title}</h3>
                    <p className="mb-1">
                      {dorm.description && dorm.description.length > 120
                        ? dorm.description.slice(0, 120) + "..."
                        : dorm.description}
                    </p>
                    <small className="text-muted">
                      {dorm.roomType && (
                        <>
                          {dorm.roomType.charAt(0).toUpperCase() +
                            dorm.roomType.slice(1)}{" "}
                          room
                        </>
                      )}
                      {dorm.city && ` · ${dorm.city}`}
                      {dorm.university && ` · Near ${dorm.university}`}
                    </small>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </>
  );
}
