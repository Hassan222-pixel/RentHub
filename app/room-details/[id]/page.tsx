/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type DormType = {
  _id: string;
  title: string;
  description: string;
  city: string;
  address?: string;
  university?: string;

  pricePerNight?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  depositAmount?: number;
  depositCurrency?: string;

  roomType?: "private" | "double" | "shared";
  maxOccupants?: number;
  genderPreference?: "any" | "male" | "female";
  allowsSmoking?: boolean;
  allowsPets?: boolean;
  houseRules?: string;

  latitude?: number;
  longitude?: number;

  amenities?: string[];
  images?: string[];
  profileImg?: string;
  tour3DUrl?: string;

  adminAvailability?: "available" | "not_available";
};

type DormApiResponse = {
  dorm: DormType;
  isOccupiedNow?: boolean;
  occupiedUntil?: string | null;

  adminAvailability?: "available" | "not_available";
  isAdminBlocked?: boolean;
};

type MyDormBookingResponse = {
  hasBooking: boolean;
  booking?: { status: string; startDate: string; endDate: string };
} | null;

export default function RoomDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [dorm, setDorm] = useState<DormType | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isOccupiedNow, setIsOccupiedNow] = useState<boolean>(false);
  const [occupiedUntil, setOccupiedUntil] = useState<string | null>(null);

  const [isAdminBlocked, setIsAdminBlocked] = useState<boolean>(false);

  const [hasMyBooking, setHasMyBooking] = useState<boolean>(false);
  const [myBookingStatus, setMyBookingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchDorm() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/dorms/${id}`);
        if (!res.ok) throw new Error("Failed to load dorm");

        const data: DormApiResponse = await res.json();

        if (!cancelled) {
          setDorm(data.dorm);

          setIsAdminBlocked(!!data.isAdminBlocked);

          // keep old logic but admin block overrides
          setIsOccupiedNow(!!data.isOccupiedNow || !!data.isAdminBlocked);
          setOccupiedUntil(data.occupiedUntil ?? null);

          const firstImage =
            data.dorm?.profileImg ||
            (data.dorm?.images && data.dorm.images[0]) ||
            "/template/images/room1.jpg";

          setActiveImage(firstImage);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Could not load this room.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDorm();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function checkMyBooking() {
      try {
        const res = await fetch(`/api/bookings/my-dorm?dormId=${id}`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data: MyDormBookingResponse = await res.json();
        if (cancelled || !data) return;

        if (data.hasBooking) {
          setHasMyBooking(true);
          setMyBookingStatus(data.booking?.status ?? null);
        } else {
          setHasMyBooking(false);
          setMyBookingStatus(null);
        }
      } catch (err) {
        console.error("Error checking my booking for this dorm:", err);
      }
    }

    checkMyBooking();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const currency = dorm?.depositCurrency || "USD";

  const occupiedUntilDate =
    occupiedUntil != null ? new Date(occupiedUntil) : null;

  const handleBookClick = () => {
    if (!dorm?._id) return;
    if (isAdminBlocked) return;
    if (isOccupiedNow) return;
    if (hasMyBooking) return;
    router.push(`/room/request/${dorm._id}`);
  };

  return (
    <div className="main-layout">
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

      <div className="our_room">
        <div className="container">
          {loading && (
            <div className="row">
              <div className="col-md-12">
                <p>Loading room details...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="row">
              <div className="col-md-12">
                <p>{error}</p>
              </div>
            </div>
          )}

          {dorm && !loading && !error && (
            <>
              <div className="row">
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

                <div className="col-md-6">
                  <div className="bed_room">
                    <h3>{dorm.title}</h3>
                    <p>{dorm.description}</p>

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
                    </ul>

                    <div className="mt-4">
                      {isAdminBlocked ? (
                        <p className="text-danger fw-bold">
                          Not available (disabled by admin)
                        </p>
                      ) : hasMyBooking ? (
                        <p className="text-warning fw-bold">
                          You already have a booking for this room
                          {myBookingStatus ? ` (${myBookingStatus})` : ""}.
                        </p>
                      ) : isOccupiedNow && occupiedUntilDate ? (
                        <p className="text-danger fw-bold">
                          Occupied until{" "}
                          {occupiedUntilDate.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      ) : (
                        <p className="text-success fw-bold">
                          This room is available
                        </p>
                      )}

                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={
                          isAdminBlocked || isOccupiedNow || hasMyBooking
                        }
                        onClick={handleBookClick}
                      >
                        Book this room
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-md-12">
                  <Link href="/room" className="btn btn-secondary">
                    ← Back to Rooms
                  </Link>
                </div>
              </div>
            </>
          )}

          {!loading && !dorm && !error && (
            <div className="row">
              <div className="col-md-12">
                <p>Room not found.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
