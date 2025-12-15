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

/* 🔹 PRICE FORMATTER */
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
      return existingStart < requestedEnd && existingEnd > requestedStart;
    });
  }

  function formatDate(value: string) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  }

  /* Load dismissed notifications */
  useEffect(() => {
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (stored) {
      try {
        setDismissedNotificationIds(JSON.parse(stored));
      } catch {}
    }
  }, []);

  /* Load booking conflict notifications */
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch("/api/bookings/me", {
          credentials: "include",
        });

        if (!res.ok) return;

        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error(err);
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

      const url =
        params.toString().length > 0
          ? `/api/dorms?${params.toString()}`
          : "/api/dorms";

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch dorms");

      const data = await res.json();
      let filteredDorms: DormListItem[] = data.dorms || [];

      // Remove admin-blocked dorms
      filteredDorms = filteredDorms.filter(
        (d) => d.adminAvailability !== "not_available" && !d.isAdminBlocked
      );

      // Date availability check
      if (startDate && endDate) {
        const available: DormListItem[] = [];

        for (const dorm of filteredDorms) {
          try {
            const r = await fetch(`/api/bookings?dormId=${dorm._id}`);
            if (!r.ok) {
              available.push(dorm);
              continue;
            }

            const bookingsData = await r.json();
            const bookings: BookingSummary[] = bookingsData.bookings || [];

            if (!hasOverlap(startDate, endDate, bookings)) {
              available.push(dorm);
            }
          } catch {
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
    setError(null);

    setDorms(
      initialDorms.filter(
        (d) => d.adminAvailability !== "not_available" && !d.isAdminBlocked
      )
    );
  };

  const handleDismissNotification = (id: string) => {
    setDismissedNotificationIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const visibleNotifications = notifications.filter(
    (n) => !dismissedNotificationIds.includes(n.id)
  );

  return (
    <>
      {visibleNotifications.map((n) => (
        <div key={n.id} className="alert alert-danger d-flex justify-content-between">
          <span>
            Someone booked <strong>{n.dormTitle}</strong> (
            {formatDate(n.startDate)} – {formatDate(n.endDate)})
          </span>
          <button onClick={() => handleDismissNotification(n.id)}>×</button>
        </div>
      ))}

      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update) =>
            setDateRange(update as [Date | null, Date | null])
          }
          minDate={today}
          className="form-control"
          placeholderText="Dates"
        />

        <select
          className="form-control"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value as any)}
        >
          <option value="">Any</option>
          <option value="private">Private</option>
          <option value="double">Double</option>
          <option value="shared">Shared</option>
        </select>

        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>

        <button className="btn btn-outline-secondary" onClick={handleClear}>
          Clear
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {dorms.map((dorm) => (
          <Link
            key={dorm._id}
            href={`/room-details/${dorm._id}`}
            className="col-md-4 mb-3"
          >
            <div className="card">
              <img
                src={dorm.profileImg || "https://images.unsplash.com/photo-1523217582562-09d0def993a6"}
                className="card-img-top"
              />
              <div className="card-body">
                <h5>{dorm.title}</h5>
                <p>{formatPrice(dorm)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
