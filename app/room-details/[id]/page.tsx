/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";

// This type should match (or be compatible with) your Mongoose Dorm model.
// You can leave some fields optional if you are not using them yet on the frontend.
type DormType = {
  _id: string;
  title: string;
  description: string;
  city: string;
  address?: string;
  university?: string;

  // Pricing
  pricePerNight?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  depositAmount?: number;
  depositCurrency?: string;

  // Availability
  availableFrom?: string; // will be an ISO string from API
  minStayNights?: number;

  // Room details / rules
  roomType?: "private" | "double" | "shared";
  maxOccupants?: number;
  genderPreference?: "any" | "male" | "female";
  allowsSmoking?: boolean;
  allowsPets?: boolean;
  houseRules?: string;

  // Location
  latitude?: number;
  longitude?: number;

  amenities?: string[];
  images?: string[];
  profileImg?: string;
  tour3DUrl?: string;
};

export default function RoomDetailsPage() {
  const params = useParams<{ id: string }>();

  // useParams can return string | string[] | undefined
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [dorm, setDorm] = useState<DormType | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dorm data by id
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchDorm() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/dorms/${id}`);

        if (!res.ok) {
          throw new Error("Failed to load dorm");
        }

        const data = await res.json();
        if (!cancelled) {
          setDorm(data.dorm);

          // Set initial active image:
          // 1) profileImg
          // 2) first image from images[]
          // 3) fallback template image
          const firstImage =
            data.dorm?.profileImg ||
            (data.dorm?.images && data.dorm.images[0]) ||
            "/template/images/room1.jpg";

          setActiveImage(firstImage);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Could not load this room.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDorm();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const currency = dorm?.depositCurrency || "USD";

  // Helper to format date strings (like availableFrom)
  const formatDate = (value?: string) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString();
  };

  return (
    <div className="main-layout">
      <TemplateHeader />

      {/* PAGE TITLE */}
      <div className="back_re">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2>{dorm ? dorm.title : "Room details"}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="our_room">
        <div className="container">
          {/* Loading state */}
          {loading && (
            <div className="row">
              <div className="col-md-12">
                <p>Loading room details...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="row">
              <div className="col-md-12">
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Main details when dorm is loaded */}
          {dorm && !loading && !error && (
            <>
              <div className="row">
                {/* LEFT: Image gallery */}
                <div className="col-md-6">
                  <div className="room_img mb-3">
                    <figure>
                      <img
                        src={
                          activeImage ||
                          dorm.profileImg ||
                          dorm.images?.[0] ||
                          "/template/images/room1.jpg"
                        }
                        alt={dorm.title}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "8px",
                          objectFit: "cover",
                        }}
                      />
                    </figure>
                  </div>

                  {/* Thumbnails from images[] */}
                  {dorm.images && dorm.images.length > 0 && (
                    <div className="d-flex flex-wrap gap-2">
                      {dorm.images.map((img, index) => (
                        <button
                          type="button"
                          key={index}
                          onClick={() => setActiveImage(img)}
                          style={{
                            border:
                              activeImage === img
                                ? "2px solid #ff0000"
                                : "1px solid #ddd",
                            padding: 0,
                            borderRadius: "6px",
                            background: "transparent",
                            cursor: "pointer",
                          }}
                        >
                          <img
                            src={img}
                            alt={`${dorm.title} image ${index + 1}`}
                            style={{
                              width: "80px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              display: "block",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: Text details */}
                <div className="col-md-6">
                  <div className="bed_room">
                    <h3>{dorm.title}</h3>

                    {/* Description */}
                    <p>{dorm.description}</p>

                    {/* Location section */}
                    <h4 className="mt-3">Location</h4>
                    <ul>
                      <li>
                        <strong>City:</strong> {dorm.city}
                      </li>
                      {dorm.address && (
                        <li>
                          <strong>Address:</strong> {dorm.address}
                        </li>
                      )}
                      {dorm.university && (
                        <li>
                          <strong>Near University:</strong> {dorm.university}
                        </li>
                      )}
                    </ul>

                    {/* Pricing section */}
                    <h4 className="mt-3">Pricing</h4>
                    <ul>
                      {dorm.pricePerMonth != null && (
                        <li>
                          <strong>Monthly:</strong> {dorm.pricePerMonth}{" "}
                          {currency}
                        </li>
                      )}
                      {dorm.pricePerWeek != null && (
                        <li>
                          <strong>Weekly:</strong> {dorm.pricePerWeek}{" "}
                          {currency}
                        </li>
                      )}
                      {dorm.pricePerNight != null && (
                        <li>
                          <strong>Daily:</strong> {dorm.pricePerNight}{" "}
                          {currency}
                        </li>
                      )}
                      {dorm.depositAmount != null && (
                        <li>
                          <strong>Deposit:</strong> {dorm.depositAmount}{" "}
                          {currency}
                        </li>
                      )}
                    </ul>

                    {/* Room info & rules */}
                    <h4 className="mt-3">Room Information</h4>
                    <ul>
                      {dorm.roomType && (
                        <li>
                          <strong>Room Type:</strong>{" "}
                          {dorm.roomType.charAt(0).toUpperCase() +
                            dorm.roomType.slice(1)}
                        </li>
                      )}
                      {dorm.maxOccupants != null && (
                        <li>
                          <strong>Max Occupants:</strong> {dorm.maxOccupants}
                        </li>
                      )}
                      {dorm.genderPreference && (
                        <li>
                          <strong>Gender Preference:</strong>{" "}
                          {dorm.genderPreference === "any"
                            ? "Any"
                            : dorm.genderPreference === "male"
                            ? "Male only"
                            : "Female only"}
                        </li>
                      )}
                      <li>
                        <strong>Smoking:</strong>{" "}
                        {dorm.allowsSmoking ? "Allowed" : "Not allowed"}
                      </li>
                      <li>
                        <strong>Pets:</strong>{" "}
                        {dorm.allowsPets ? "Allowed" : "Not allowed"}
                      </li>
                      {dorm.houseRules && (
                        <li>
                          <strong>House Rules:</strong> {dorm.houseRules}
                        </li>
                      )}
                    </ul>

                    {/* Amenities list */}
                    {dorm.amenities && dorm.amenities.length > 0 && (
                      <>
                        <h4 className="mt-3">Amenities</h4>
                        <div className="d-flex flex-wrap gap-2">
                          {dorm.amenities.map((amenity, index) => (
                            <span
                              key={index}
                              className="badge badge-pill badge-secondary"
                              style={{
                                padding: "6px 10px",
                                fontSize: "12px",
                                borderRadius: "12px",
                              }}
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Availability & Deposit */}
                    <h4 className="mt-3">Availability</h4>
                    <ul>
                      {formatDate(dorm.availableFrom) && (
                        <li>
                          <strong>Available From:</strong>{" "}
                          {formatDate(dorm.availableFrom)}
                        </li>
                      )}
                      {dorm.minStayNights != null && (
                        <li>
                          <strong>Minimum Stay:</strong> {dorm.minStayNights}{" "}
                          night(s)
                        </li>
                      )}
                    </ul>

                    {/* Optional 3D Tour link */}
                    {dorm.tour3DUrl && (
                      <div className="mt-3">
                        <a
                          href={dorm.tour3DUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm"
                        >
                          View 3D Tour
                        </a>
                      </div>
                    )}

                    {/* Booking button */}
                    <Link
                      href={`/room/request/${dorm._id}`}
                      className="btn btn-primary mt-4"
                    >
                      Book this room
                    </Link>
                  </div>
                </div>
              </div>

              {/* Back to rooms button under the details */}
              <div className="row mt-4">
                <div className="col-md-12">
                  <Link href="/room" className="btn btn-secondary">
                    ← Back to Rooms
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* If there is no dorm (for example, not found) */}
          {!loading && !dorm && !error && (
            <div className="row">
              <div className="col-md-12">
                <p>Room not found.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <TemplateFooter />
    </div>
  );
}
