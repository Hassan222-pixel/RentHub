/* eslint-disable @typescript-eslint/no-explicit-any */
// app/room/RoomFilterList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { DormListItem } from "./page";

type Props = {
  initialDorms: DormListItem[];
};

type BookingSummary = {
  startDate: string;
  endDate: string;
};

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

  // Today for minDate
  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  // Helper: check if any confirmed booking overlaps (front-end logic)
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

      // overlap: existingStart < requestedEnd && existingEnd > requestedStart
      return existingStart < requestedEnd && existingEnd > requestedStart;
    });
  }

  // Search button handler
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1) Call /api/dorms with q + roomType
      const params = new URLSearchParams();

      if (searchText.trim()) {
        params.set("q", searchText.trim());
      }

      if (roomType) {
        params.set("roomType", roomType);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/dorms?${queryString}` : "/api/dorms";

      const res = await fetch(url, {
        method: "GET",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message || "Failed to apply filters.";
        throw new Error(msg);
      }

      const data = await res.json();
      let filteredDorms: DormListItem[] = data.dorms || [];

      // 2) If the user selected a date range, filter by availability
      if (startDate && endDate) {
        const start = startDate;
        const end = endDate;

        const availableDorms: DormListItem[] = [];

        // For each dorm, check bookings from /api/bookings?dormId=xxx
        for (const dorm of filteredDorms) {
          try {
            const bookingsRes = await fetch(
              `/api/bookings?dormId=${encodeURIComponent(dorm._id)}`,
              { method: "GET" }
            );

            if (!bookingsRes.ok) {
              // If this fails, just consider it as no bookings blocking
              availableDorms.push(dorm);
              continue;
            }

            const bookingsData = await bookingsRes.json();
            const bookings: BookingSummary[] = bookingsData.bookings || [];

            const overlap = hasOverlap(start, end, bookings);

            // If there is NO overlap, this dorm is available for that period
            if (!overlap) {
              availableDorms.push(dorm);
            }
          } catch (err) {
            console.error("Error checking bookings for dorm:", dorm._id, err);
            // In case of error, we can still keep the dorm (or skip it).
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

  // Clear button handler
  const handleClear = () => {
    setSearchText("");
    setRoomType("");
    setDateRange([null, null]);
    setError(null);
    setDorms(initialDorms);
  };

  return (
    <>
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

          {/* Date range */}
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

          {/* Room type */}
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

      {/* Error */}
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
