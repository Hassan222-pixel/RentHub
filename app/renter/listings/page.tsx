/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Dorm {
  _id: string;
  title: string;
  description: string;
  city: string;
  pricePerNight?: number;
  pricePerMonth?: number;
  createdAt: string;
  profileImg?: string;
  roomType?: "private" | "double" | "shared";
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
    const ok = window.confirm("Are you sure you want to delete this listing?");
    if (!ok) return;

    try {
      setDeletingId(id);
      setError("");

      const res = await fetch(`/api/renter/listings/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Failed to delete listing");
        return;
      }

      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  const formatRoomType = (type?: Dorm["roomType"]) => {
    if (!type) return "";
    if (type === "private") return "Private room";
    if (type === "double") return "Double room";
    if (type === "shared") return "Shared room";
    return type;
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
          <div className="spinner-border text-primary me-2" />
          <span>Loading listings...</span>
        </div>
      )}

      {!loading && listings.length === 0 && !error && (
        <p>You have no listings yet.</p>
      )}

      {!loading && listings.length > 0 && (
        <div className="row g-4">
          {listings.map((listing) => (
            <div key={listing._id} className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                {/* IMAGE */}
                <div className="position-relative">
                  {listing.profileImg ? (
                    <img
                      src={listing.profileImg}
                      alt={listing.title}
                      className="w-100"
                      style={{
                        height: 190,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="w-100 bg-light d-flex justify-content-center align-items-center text-muted"
                      style={{ height: 190 }}
                    >
                      No Image
                    </div>
                  )}

                  {/* PRICE BADGE */}
                  {(listing.pricePerMonth || listing.pricePerNight) && (
                    <div className="position-absolute bottom-0 start-0 m-2 px-3 py-1 rounded-pill bg-primary text-white small">
                      {listing.pricePerNight && (
                        <span className="me-3">
                          Night: ${listing.pricePerNight}
                        </span>
                      )}
                      {listing.pricePerMonth && (
                        <span>   Month: ${listing.pricePerMonth}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* BODY */}
                <div className="card-body d-flex flex-column">
                  <p className="text-muted small mb-1">{listing.city}</p>

                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{listing.title}</h5>

                    {listing.roomType && (
                      <span className="badge bg-secondary-subtle text-secondary-emphasis small ms-2">
                        {formatRoomType(listing.roomType)}
                      </span>
                    )}
                  </div>

                  <p className="card-text small text-muted mb-3">
                    {listing.description.length > 110
                      ? listing.description.slice(0, 110) + "..."
                      : listing.description}
                  </p>

                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <div className="btn-group btn-group-sm">
                      <Link
                        href={`/renter/listings/${listing._id}/edit`}
                        className="btn btn-outline-primary"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </Link>

                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(listing._id)}
                        disabled={deletingId === listing._id}
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>

                    <small className="text-muted">
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
