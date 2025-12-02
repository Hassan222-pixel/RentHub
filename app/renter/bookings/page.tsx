/* eslint-disable @typescript-eslint/no-explicit-any */
// app/renter/bookings/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Booking {
  _id: string;
  dorm: { title: string };
  client: { name: string; email: string };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
}

export default function RenterBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load bookings when the page mounts
  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await fetch("/api/renter/bookings", {
          method: "GET",
          // Include cookies (JWT token) for auth
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to load bookings");
        }

        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error("Error loading bookings", err);
        setError("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // app/renter/bookings/page.tsx (inside handleDelete)
  const handleDelete = async (bookingId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmDelete) return;

    console.log("Attempting to delete booking with id:", bookingId);

    try {
      setDeletingId(bookingId);
      setError(null);

      const res = await fetch(`/api/renter/bookings/${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => null);

      // Log the server response so you can see deletedCount in the console
      console.log("Delete response:", data);

      if (!res.ok) {
        const msg = data?.message || "Failed to delete booking.";
        throw new Error(msg);
      }

      // Locally remove the booking row from the UI
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err: any) {
      console.error("Delete booking error:", err);
      setError(err.message || "Failed to delete booking.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h2 className="mb-3">Bookings</h2>

      {loading && <p>Loading bookings...</p>}

      {error && !loading && <p style={{ color: "red" }}>{error}</p>}

      {!loading && bookings.length === 0 && !error && (
        <p>
          No bookings yet. When clients reserve your listings, they’ll show
          here.
        </p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              {/* IMPORTANT: keep <tr> children as only <th>, no comments/whitespace */}
              <tr>
                <th>Dorm</th>
                <th>Client</th>
                <th>Dates</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const start = new Date(b.startDate).toLocaleDateString();
                const end = new Date(b.endDate).toLocaleDateString();

                return (
                  // IMPORTANT: again, only <td> directly inside <tr>, no extra text
                  <tr key={b._id}>
                    <td>{b.dorm?.title}</td>
                    <td>
                      {b.client?.name}
                      <br />
                      <small className="text-muted">{b.client?.email}</small>
                    </td>
                    <td>
                      {start} – {end}
                    </td>
                    <td>${b.totalPrice}</td>
                    <td className="text-capitalize">{b.status}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(b._id)}
                        disabled={deletingId === b._id}
                      >
                        {deletingId === b._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
