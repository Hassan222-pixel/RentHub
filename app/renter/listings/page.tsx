/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setError("");
        const res = await fetch("/api/renter/listings", {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to load listings");
          return;
        }
        setListings(data.listings || []);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Error loading listings", err);
        setError("Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone."
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      setError("");

      const res = await fetch(`/api/renter/listings/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Delete error:", data);
        setError(data.message || "Failed to delete listing");
        return;
      }

      // Remove from UI
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">My Listings</h2>
        <Link href="/renter/listings/new" className="btn btn-primary">
          + Add Listing
        </Link>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {loading && (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>Loading listings...</span>
        </div>
      )}

      {!loading && listings.length === 0 && !error && (
        <p>
          You have no listings yet. Click &quot;Add Listing&rdquo; to create
          one.
        </p>
      )}

      {!loading && listings.length > 0 && (
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
                    {listing.pricePerMonth !== undefined && (
                      <div className="small">
                        <strong>${listing.pricePerMonth}</strong> / month
                      </div>
                    )}
                    {listing.pricePerNight !== undefined && (
                      <div className="small text-muted">
                        ${listing.pricePerNight} / night
                      </div>
                    )}
                  </div>

                  <div className="mt-3 d-flex justify-content-between align-items-center gap-2">
                    <div className="btn-group btn-group-sm" role="group">
                      <Link
                        href={`/renter/listings/${listing._id}/edit`}
                        className="btn btn-outline-primary"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(listing._id)}
                        disabled={deletingId === listing._id}
                      >
                        {deletingId === listing._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>

                    <small className="text-muted ms-2">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
