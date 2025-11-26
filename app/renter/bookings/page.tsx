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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/renter/bookings");
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error("Error loading bookings", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="mb-3">Bookings</h2>

      {loading && <p>Loading bookings...</p>}

      {!loading && bookings.length === 0 && (
        <p>
          No bookings yet. When clients reserve your listings, they’ll show
          here.
        </p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Dorm</th>
                <th>Client</th>
                <th>Dates</th>
                <th>Total Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.dorm?.title}</td>
                  <td>
                    {b.client?.name} <br />
                    <small className="text-muted">{b.client?.email}</small>
                  </td>
                  <td>
                    {new Date(b.startDate).toLocaleDateString()} –{" "}
                    {new Date(b.endDate).toLocaleDateString()}
                  </td>
                  <td>${b.totalPrice}</td>
                  <td className="text-capitalize">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
