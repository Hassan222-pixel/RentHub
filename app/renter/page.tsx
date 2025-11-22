// app/renter/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function RenterHomePage() {
  const [totalListings, setTotalListings] = useState(0);
  const [activeListings, setActiveListings] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [listingsRes, bookingsRes] = await Promise.all([
          fetch("/api/renter/listings"),
          fetch("/api/renter/bookings"),
        ]);

        const listingsData = await listingsRes.json();
        const bookingsData = await bookingsRes.json();

        const listings = listingsData.listings || [];
        setTotalListings(listings.length);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActiveListings(listings.filter((l: any) => l.isActive).length);

        const bookings = bookingsData.bookings || [];
        setTotalBookings(bookings.length);
      } catch (err) {
        console.error("Error loading renter summary", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <h2 className="mb-3">Renter Dashboard</h2>

      {loading && <p>Loading summary...</p>}

      {!loading && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="renthub-content-card">
                <h6 className="text-muted mb-1">Total Listings</h6>
                <div className="fs-3 fw-semibold">{totalListings}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="renthub-content-card">
                <h6 className="text-muted mb-1">Active Listings</h6>
                <div className="fs-3 fw-semibold">{activeListings}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="renthub-content-card">
                <h6 className="text-muted mb-1">Total Bookings</h6>
                <div className="fs-3 fw-semibold">{totalBookings}</div>
              </div>
            </div>
          </div>

          <p className="text-muted small">
            Use the sidebar to manage your listings, view bookings, and explore
            upcoming features like requests, messages, and analytics.
          </p>
        </>
      )}
    </div>
  );
}
