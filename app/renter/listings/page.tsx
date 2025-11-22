// app/renter/listings/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Dorm {
  _id: string;
  title: string;
  description: string;
  city: string;
  university?: string;
  pricePerNight?: number;
  pricePerMonth?: number;
  createdAt: string;
}

export default function RenterListingsPage() {
  const [listings, setListings] = useState<Dorm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/renter/listings");
        const data = await res.json();
        setListings(data.listings || []);
      } catch (err) {
        console.error("Error loading listings", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">My Listings</h2>
        <Link href="/renter/listings/new" className="btn btn-primary">
          + Add Listing
        </Link>
      </div>

      {loading && <p>Loading listings...</p>}

      {!loading && listings.length === 0 && (
        <p>
          You have no listings yet. Click &quot;Add Listing&rdquo; to create
          one.
        </p>
      )}

      <div className="row g-3">
        {listings.map((listing) => (
          <div key={listing._id} className="col-md-4">
            <div className="card h-100 bg-transparent border-secondary">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{listing.title}</h5>
                <p className="card-text small text-muted mb-1">
                  {listing.city}
                  {listing.university ? ` · ${listing.university}` : ""}
                </p>
                <p className="card-text small flex-grow-1">
                  {listing.description.length > 120
                    ? listing.description.slice(0, 120) + "..."
                    : listing.description}
                </p>
                <div className="mt-2">
                  {listing.pricePerMonth && (
                    <div className="small">
                      <strong>${listing.pricePerMonth}</strong> / month
                    </div>
                  )}
                  {listing.pricePerNight && (
                    <div className="small text-muted">
                      ${listing.pricePerNight} / night
                    </div>
                  )}
                </div>
                <div className="mt-3 d-flex justify-content-between align-items-center">
                  <Link
                    href={`/renter/listings/${listing._id}/edit`}
                    className="btn btn-sm btn-outline-light"
                  >
                    Edit
                  </Link>
                  <small className="text-muted">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
