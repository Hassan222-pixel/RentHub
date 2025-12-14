/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { DormListItem } from "./page";

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
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  }

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
      )}

      <div
        className="mb-4 p-3"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
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
