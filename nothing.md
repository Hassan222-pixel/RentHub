models/Dorm.ts
// models/Dorm.ts
import mongoose, { Schema, Document, models } from "mongoose";
import { IUser } from "./User";

export type DormRoomType = "private" | "double" | "shared";
export type DormGenderPreference = "any" | "male" | "female";

export interface IDorm extends Document {
  owner: IUser["_id"];
  title: string;
  description: string;
  city: string;
  address?: string;
  university?: string;

  pricePerNight?: number;
  pricePerMonth?: number;

  roomType?: DormRoomType;
  maxOccupants?: number;
  genderPreference?: DormGenderPreference;

  allowsSmoking: boolean;
  allowsPets: boolean;
  houseRules?: string[];

  depositAmount?: number;
  depositCurrency?: string;

  latitude?: number;
  longitude?: number;

  hasWifi: boolean;
  hasAirConditioning: boolean;
  hasHeating: boolean;
  hasParking: boolean;
  hasLaundry: boolean;
  isFurnished: boolean;

  amenities: string[];

  images: string[];
  profileImg?: string;
  tour3DUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DormSchema = new Schema<IDorm>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    university: { type: String },

    pricePerNight: { type: Number },
    pricePerMonth: { type: Number },

    roomType: {
      type: String,
      enum: ["private", "double", "shared"],
    },
    maxOccupants: { type: Number },
    genderPreference: {
      type: String,
      enum: ["any", "male", "female"],
      default: "any",
    },

    allowsSmoking: { type: Boolean, default: false },
    allowsPets: { type: Boolean, default: false },
    houseRules: [{ type: String }],

    depositAmount: { type: Number },
    depositCurrency: { type: String, default: "USD" },

    latitude: { type: Number },
    longitude: { type: Number },

    hasWifi: { type: Boolean, default: false },
    hasAirConditioning: { type: Boolean, default: false },
    hasHeating: { type: Boolean, default: false },
    hasParking: { type: Boolean, default: false },
    hasLaundry: { type: Boolean, default: false },
    isFurnished: { type: Boolean, default: false },

    amenities: [{ type: String }],

    images: [{ type: String }],
    profileImg: { type: String },
    tour3DUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Dorm = models.Dorm || mongoose.model<IDorm>("Dorm", DormSchema);

app/api/dorms/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { Booking } from "@/models/Booking";

function getDormCapacity(dormDoc: any): number {
  const roomType = dormDoc.roomType as
    | "private"
    | "double"
    | "shared"
    | undefined;
  if (roomType === "private") return 1;
  if (roomType === "double") return 2;

  if (roomType === "shared") {
    if (typeof dormDoc.maxOccupants === "number" && dormDoc.maxOccupants > 0) {
      return dormDoc.maxOccupants;
    }
    return 1;
  }

  return 1;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await params;

    const dormDoc: any = await Dorm.findById(id).lean();

    if (!dormDoc || dormDoc.isActive === false) {
      return NextResponse.json({ message: "Dorm not found" }, { status: 404 });
    }

    const now = new Date();
    const dormId = dormDoc._id;
    const capacity = getDormCapacity(dormDoc);

    const activeBookings = await Booking.find({
      dorm: dormId,
      status: { $in: ["reserved", "confirmed"] },
      startDate: { $lte: now },
      endDate: { $gt: now },
    })
      .select(
        "clientFirstName clientLastName clientPhone startDate endDate paymentType"
      )
      .lean();

    const activeCount = activeBookings.length;
    const availableBeds = Math.max(capacity - activeCount, 0);
    const isOccupiedNow = availableBeds <= 0;

    let occupiedUntil: Date | null = null;
    if (isOccupiedNow && activeBookings.length > 0) {
      for (const b of activeBookings) {
        const e = new Date((b as any).endDate);
        if (!occupiedUntil || e < occupiedUntil) {
          occupiedUntil = e;
        }
      }
    }

    const currentTenants = activeBookings.map((b: any) => ({
      firstName: b.clientFirstName || "",
      lastName: b.clientLastName || "",
      phone: b.clientPhone || "",
      startDate: b.startDate,
      endDate: b.endDate,
      paymentType: b.paymentType,
    }));

    return NextResponse.json({
      dorm: dormDoc,
      capacity,
      activeBookingsCount: activeCount,
      availableBeds,
      isOccupiedNow,
      occupiedUntil,
      currentTenants,
    });
  } catch (err) {
    console.error("GET /api/dorms/[id] error:", err);
    return NextResponse.json(
      { message: "Failed to load dorm" },
      { status: 500 }
    );
  }
}

app/room-details/[id]/page.tsx
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// This type should match (or be compatible with) your Mongoose Dorm model.
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

// Response shape from /api/dorms/[id]
type DormApiResponse = {
  dorm: DormType;
  isOccupiedNow?: boolean;
  occupiedUntil?: string | null;
};

type MyDormBookingResponse = {
  hasBooking: boolean;
  booking?: {
    status: string;
    startDate: string;
    endDate: string;
  };
} | null;

export default function RoomDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  // useParams can return string | string[] | undefined
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [dorm, setDorm] = useState<DormType | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Availability flags from /api/dorms/[id]
  const [isOccupiedNow, setIsOccupiedNow] = useState<boolean>(false);
  const [occupiedUntil, setOccupiedUntil] = useState<string | null>(null);

  // does the current client already have a booking for this room?
  const [hasMyBooking, setHasMyBooking] = useState<boolean>(false);
  const [myBookingStatus, setMyBookingStatus] = useState<string | null>(null);

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

        const data: DormApiResponse = await res.json();
        if (!cancelled) {
          setDorm(data.dorm);

          setIsOccupiedNow(!!data.isOccupiedNow);
          setOccupiedUntil(data.occupiedUntil ?? null);

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

  // check if the current client already has a booking for this dorm
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function checkMyBooking() {
      try {
        const res = await fetch(`/api/bookings/my-dorm?dormId=${id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          // If unauthorized or any error, just ignore and assume no booking
          return;
        }

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

  const formatDate = (value?: string) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString();
  };

  const occupiedUntilDate =
    occupiedUntil != null ? new Date(occupiedUntil) : null;

  const handleBookClick = () => {
    if (!dorm?._id || isOccupiedNow || hasMyBooking) return;
    router.push(`/room/request/${dorm._id}`);
  };

  return (
    <div className="main-layout">
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

                    {/* Booking section with occupancy + my booking check */}
                    <div className="mt-4">
                      {hasMyBooking ? (
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
                      ) : !isOccupiedNow ? (
                        <p className="text-success fw-bold">
                          This room is available
                        </p>
                      ) : null}

                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={isOccupiedNow || hasMyBooking}
                        onClick={handleBookClick}
                      >
                        Book this room
                      </button>
                    </div>
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
    </div>
  );
}

app/room/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import HeroSearch from "../components/Herosearch";
import RecentProperties, {
  type PropertyCard,
} from "../components/RecentProperties";

export type DormListItem = {
  _id: string;
  title: string;
  description: string;
  profileImg?: string | null;
  roomType?: "private" | "double" | "shared" | null;
  city?: string;
  pricePerNight?: number | null;
  pricePerWeek?: number | null;
  pricePerMonth?: number | null;
  maxOccupants?: number | null;
  genderPreference?: "any" | "male" | "female" | null;

  // availability info coming from /api/dorms
  isOccupiedNow?: boolean;
  occupiedUntil?: string | null;

  // capacity info
  capacity?: number | null;
  availableBeds?: number | null;
};

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

// Uses availableBeds when provided (for double/shared logic)
function formatBeds(d: DormListItem): string {
  if (typeof d.availableBeds === "number") {
    if (d.availableBeds <= 0) {
      return "🛏️ No beds available";
    }
    const label = d.availableBeds === 1 ? "bed available" : "beds available";
    return `🛏️ ${d.availableBeds} ${label}`;
  }

  // Fallback static logic
  if (d.roomType === "private") {
    return "🛏️ 1 bed";
  }
  if (d.roomType === "double") {
    return "🛏️ 2 beds";
  }
  if (d.roomType === "shared") {
    const count = d.maxOccupants ?? 1;
    const label = count === 1 ? "bed" : "beds";
    return `🛏️ ${count} ${label}`;
  }
  return "🛏️ N/A";
}

function formatGender(d: DormListItem): string {
  const pref = d.genderPreference || "any";
  if (pref === "male") {
    return "👨 Only male";
  }
  if (pref === "female") {
    return "👩 Only female";
  }
  return "👨👩 Any";
}

export default function RoomPage() {
  const [dorms, setDorms] = useState<DormListItem[]>([]);
  const [filteredDorms, setFilteredDorms] = useState<DormListItem[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dormRes = await fetch("/api/dorms", { cache: "no-store" });
        const dormData = await dormRes.json();
        const dormList: DormListItem[] = dormData.dorms || [];

        setDorms(dormList);
        setFilteredDorms(dormList);

        const uniqueCities = [
          ...new Set(dormList.map((d) => d.city).filter(Boolean) as string[]),
        ];
        setCities(uniqueCities);

        const uniRes = await fetch("/api/universities", {
          cache: "no-store",
        });
        if (uniRes.ok) {
          const uniData = await uniRes.json();
          const uniNames: string[] = (uniData.universities || []).map(
            (u: any) => u.name as string
          );
          setUniversities(uniNames);
        } else {
          setUniversities([]);
        }
      } catch (err) {
        console.error("Failed to load room data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const cards: PropertyCard[] = filteredDorms.map((d) => {
    const isFullyOccupied =
      typeof d.availableBeds === "number"
        ? d.availableBeds <= 0
        : d.isOccupiedNow === true;

    const statusBadge = isFullyOccupied ? "Not available" : "Available";
    const cityLine = d.city || "Unknown";

    return {
      id: d._id,
      title: d.title,
      city: cityLine,
      price: formatPrice(d),
      badge: statusBadge,
      image:
        d.profileImg ||
        "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
      href: `/room-details/${d._id}`,
      bedsLabel: formatBeds(d),
      genderLabel: formatGender(d),
    };
  });

  return (
    <div className="main-layout">
      <section className="our_room">
        <div className="container">
          <div className="titlepage text-center mb-4">
            <h2>Find a Room</h2>
            <p>Search and browse available rooms near your university.</p>
          </div>

          <div className="d-flex justify-content-center mb-4">
            {!loading && (
              <HeroSearch
                cities={cities}
                universities={universities}
                initialDorms={dorms}
                onResults={(filtered) => setFilteredDorms(filtered)}
              />
            )}
          </div>

          {loading && (
            <p className="text-center" style={{ marginTop: "10px" }}>
              Loading rooms...
            </p>
          )}
        </div>
      </section>

      <RecentProperties
        properties={cards}
        title="Available rooms"
        subtitle="Browse all currently active rooms from our renters."
        showButton={false}
      />
    </div>
  );
}

app/room/RoomFilterList.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// app/room/RoomFilterList.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { DormListItem } from "./page";

// Used when we check confirmed bookings for a dorm
type BookingSummary = {
  startDate: string;
  endDate: string;
};

// Notification type returned from /api/bookings/me
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

export default function RoomFilterList({ initialDorms }: Props) {
  const [dorms, setDorms] = useState<DormListItem[]>(initialDorms);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchText, setSearchText] = useState("");
  const [roomType, setRoomType] = useState<
    "" | "private" | "double" | "shared"
  >("");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;

  // Client notifications (conflict bookings)
  const [notifications, setNotifications] = useState<ConflictNotification[]>(
    []
  );
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<
    string[]
  >([]);

  // "Today" with time removed (used as minDate in DatePicker)
  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  // ----- Helpers -----

  // Check if the requested [start, end] overlaps existing confirmed bookings
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

      // Overlap if: existingStart < requestedEnd AND existingEnd > requestedStart
      return existingStart < requestedEnd && existingEnd > requestedStart;
    });
  }

  // Format date string nicely for the notification
  function formatDate(value: string) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  }

  // ----- Load dismissed notifications from localStorage once -----
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setDismissedNotificationIds(parsed);
        }
      }
    } catch (err) {
      console.error(
        "Failed to read dismissed notifications from localStorage",
        err
      );
    }
  }, []);

  // ----- Load client conflict notifications once on mount -----
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetch("/api/bookings/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          // If user is not logged in as client, API returns notifications: []
          return;
        }

        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Error loading client notifications:", err);
      }
    };

    loadNotifications();
  }, []);

  // ----- Search / filter handler -----
  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params for /api/dorms
      const params = new URLSearchParams();

      if (searchText.trim()) {
        params.set("q", searchText.trim());
      }

      if (roomType) {
        params.set("roomType", roomType);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/dorms?${queryString}` : "/api/dorms";

      // 1) Filter by text + room type via backend
      const res = await fetch(url, { method: "GET" });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message || "Failed to apply filters.";
        throw new Error(msg);
      }

      const data = await res.json();
      let filteredDorms: DormListItem[] = data.dorms || [];

      // 2) If user picked a date range, filter rooms by availability (no overlap with confirmed bookings)
      if (startDate && endDate) {
        const start = startDate;
        const end = endDate;

        const availableDorms: DormListItem[] = [];

        for (const dorm of filteredDorms) {
          try {
            const bookingsRes = await fetch(
              `/api/bookings?dormId=${encodeURIComponent(dorm._id)}`,
              { method: "GET" }
            );

            if (!bookingsRes.ok) {
              // If bookings cannot be loaded, keep dorm visible as fallback
              availableDorms.push(dorm);
              continue;
            }

            const bookingsData = await bookingsRes.json();
            const bookings: BookingSummary[] = bookingsData.bookings || [];

            const overlap = hasOverlap(start, end, bookings);

            if (!overlap) {
              availableDorms.push(dorm);
            }
          } catch (err) {
            console.error("Error checking bookings for dorm:", dorm._id, err);
            // In case of error, keep dorm as available (fail-open)
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

  // ----- Clear button handler -----
  const handleClear = () => {
    setSearchText("");
    setRoomType("");
    setDateRange([null, null]);
    setError(null);
    setDorms(initialDorms);
  };

  // X button handler: dismiss one notification + store it in localStorage
  const handleDismissNotification = (id: string) => {
    setDismissedNotificationIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Failed to save dismissed notifications", err);
      }
      return next;
    });
  };

  // Only show notifications that were not dismissed with X
  const visibleNotifications = notifications.filter(
    (n) => !dismissedNotificationIds.includes(n.id)
  );

  return (
    <>
      {/* CLIENT NOTIFICATIONS: red banner with X button */}
      {visibleNotifications.length > 0 && (
        <div className="mb-3">
          {visibleNotifications.map((n) => (
            <div
              key={n.id}
              style={{
                backgroundColor: "#ffdddd",
                border: "1px solid #ff4d4f",
                padding: "10px 14px",
                borderRadius: "6px",
                color: "#a10000",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span>
                Sorry, someone already booked <strong>{n.dormTitle}</strong> for
                your requested dates ({formatDate(n.startDate)} –{" "}
                {formatDate(n.endDate)}).
              </span>

              {/* X button to dismiss the message */}
              <button
                type="button"
                onClick={() => handleDismissNotification(n.id)}
                style={{
                  marginLeft: "12px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: "bold",
                  lineHeight: 1,
                  color: "#a10000",
                }}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

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

          {/* Date range picker */}
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

          {/* Room type select */}
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

      {/* Error alert */}
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

app/api/dorms/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { Booking } from "@/models/Booking";

function getDormCapacity(dormDoc: any): number {
  const roomType = dormDoc.roomType as
    | "private"
    | "double"
    | "shared"
    | undefined;
  if (roomType === "private") return 1;
  if (roomType === "double") return 2;

  if (roomType === "shared") {
    if (typeof dormDoc.maxOccupants === "number" && dormDoc.maxOccupants > 0) {
      return dormDoc.maxOccupants;
    }
    return 1;
  }

  return 1;
}

// GET /api/dorms?q=&roomType=
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim() || "";
    const roomType = searchParams.get("roomType");

    const filter: any = { isActive: true };

    if (
      roomType &&
      ["private", "double", "shared"].includes(roomType.toLowerCase())
    ) {
      filter.roomType = roomType.toLowerCase();
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { university: { $regex: q, $options: "i" } },
      ];
    }

    const dormDocs: any[] = await Dorm.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "title description profileImg roomType city university pricePerNight pricePerMonth maxOccupants genderPreference"
      )
      .lean();

    const now = new Date();
    const dormIds = dormDocs.map((d) => d._id);

    // ✅ IMPORTANT CHANGE:
    // Only ONGOING bookings affect the "Not Available" red card status,
    // and only if they overlap NOW (startDate <= now < endDate).
    const activeOngoingBookingsNow = await Booking.find({
      dorm: { $in: dormIds },
      status: { $in: ["reserved", "confirmed"] },
      isOngoing: true, // ✅ ONLY ongoing matters for card availability
      startDate: { $lte: now },
      endDate: { $gt: now },
    })
      .select("dorm")
      .lean();

    // Count how many ongoing bookings are active NOW per dorm
    const bookingsCountMap: Record<string, number> = {};
    for (const b of activeOngoingBookingsNow) {
      const key = (b as any).dorm.toString();
      bookingsCountMap[key] = (bookingsCountMap[key] || 0) + 1;
    }

    const dorms = dormDocs.map((d) => {
      const idStr = d._id.toString();
      const capacity = getDormCapacity(d);

      const activeCount = bookingsCountMap[idStr] || 0; // ongoing active now only
      const availableBeds = Math.max(capacity - activeCount, 0);
      const isOccupiedNow = availableBeds <= 0;

      return {
        _id: idStr,
        title: d.title,
        description: d.description,
        profileImg: d.profileImg || null,
        roomType: d.roomType || null,
        city: d.city || "",
        university: d.university || "",
        pricePerNight: d.pricePerNight ?? null,
        pricePerMonth: d.pricePerMonth ?? null,
        maxOccupants: d.maxOccupants ?? null,
        genderPreference: d.genderPreference ?? null,
        capacity,
        availableBeds,
        isOccupiedNow,
      };
    });

    return NextResponse.json({ dorms });
  } catch (err) {
    console.error("GET /api/dorms error:", err);
    return NextResponse.json(
      { message: "Failed to load dorms" },
      { status: 500 }
    );
  }
}

app/api/payments/create-checkout-session/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import { Booking } from "@/models/Booking";
import { getCurrentUserFromApi } from "@/lib/currentUser";

type CurrentUser = {
  _id: string;
  role: string;
  name?: string;
  email?: string;
};

function getDormCapacity(dormDoc: any): number {
  const roomType = dormDoc.roomType as
    | "private"
    | "double"
    | "shared"
    | undefined;
  if (roomType === "private") return 1;
  if (roomType === "double") return 2;

  if (roomType === "shared") {
    if (typeof dormDoc.maxOccupants === "number" && dormDoc.maxOccupants > 0) {
      return dormDoc.maxOccupants;
    }
    return 1;
  }

  return 1;
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const user = (await getCurrentUserFromApi()) as (CurrentUser & any) | null;

    if (!user || user.role !== "client") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      dormId,
      startDate,
      months,
      firstName,
      lastName,
      phone,
      paymentType, // "deposit" | "full"
    }: {
      dormId?: string;
      startDate?: string;
      months?: number;
      firstName?: string;
      lastName?: string;
      phone?: string;
      paymentType?: "deposit" | "full";
    } = body;

    if (!dormId || !startDate || !months || !paymentType) {
      return NextResponse.json(
        { message: "dormId, startDate, months and paymentType are required" },
        { status: 400 }
      );
    }

    if (!["deposit", "full"].includes(paymentType)) {
      return NextResponse.json(
        { message: "Invalid paymentType" },
        { status: 400 }
      );
    }

    if (months < 1 || months > 3) {
      return NextResponse.json(
        { message: "Months must be between 1 and 3" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { message: "Invalid startDate" },
        { status: 400 }
      );
    }

    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    if (end <= start) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      );
    }

    const dormDoc: any = await Dorm.findById(dormId).lean();
    if (!dormDoc || dormDoc.isActive === false) {
      return NextResponse.json({ message: "Dorm not found" }, { status: 404 });
    }

    const capacity = getDormCapacity(dormDoc);

    // نفس الطالب ما يحجز نفس الغرفة مرتين
    const existingBooking = await Booking.findOne({
      dorm: dormId,
      client: user._id,
      status: { $in: ["reserved", "confirmed", "pending_payment"] },
    }).lean();

    if (existingBooking) {
      return NextResponse.json(
        { message: "You already have a booking for this room." },
        { status: 400 }
      );
    }

    // تحقق السعة (نحسب reserved + confirmed فقط)
    const overlappingCount = await Booking.countDocuments({
      dorm: dormId,
      status: { $in: ["reserved", "confirmed"] },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (overlappingCount >= capacity) {
      return NextResponse.json(
        { message: "This room is fully booked in this period" },
        { status: 409 }
      );
    }

    if (!dormDoc.pricePerMonth) {
      return NextResponse.json(
        { message: "Monthly price is not available for this dorm" },
        { status: 400 }
      );
    }

    const baseMonthly = dormDoc.pricePerMonth;
    let pricePerStudentPerMonth = baseMonthly;

    if (dormDoc.roomType === "double" || dormDoc.roomType === "shared") {
      const cap = capacity || 1;
      pricePerStudentPerMonth = baseMonthly / cap;
    }

    const totalPrice = pricePerStudentPerMonth * months;

    // Deposit logic
    const depositFromDorm: number | undefined = dormDoc.depositAmount;
    let depositAmount = 0;
    let remainingAmount = 0;

    if (paymentType === "deposit") {
      depositAmount = depositFromDorm ?? 50;
      if (depositAmount <= 0 || depositAmount >= totalPrice) {
        depositAmount = Math.round(totalPrice * 0.2);
      }
      remainingAmount = totalPrice - depositAmount;
    } else {
      depositAmount = 0;
      remainingAmount = 0;
    }

    const platformFee = Number((totalPrice * 0.08).toFixed(2));
    const renterShare = Number((totalPrice * 0.92).toFixed(2));

    let deadlineToPayRest: Date | undefined = undefined;
    if (paymentType === "deposit") {
      const deadline = new Date(start);
      deadline.setDate(deadline.getDate() - 5);
      deadlineToPayRest = deadline;
    }

    const trimmedFirstName = (firstName || "").trim();
    const trimmedLastName = (lastName || "").trim();
    const trimmedPhone = (phone || "").trim();

    // 1) إنشاء booking بحالة pending_payment
    const booking = await Booking.create({
      dorm: dormId,
      renter: dormDoc.owner,
      client: user._id,
      clientFirstName: trimmedFirstName,
      clientLastName: trimmedLastName,
      clientPhone: trimmedPhone,
      startDate: start,
      endDate: end,

      totalPrice,
      paymentType,
      paymentStatus: "unpaid",
      currency: dormDoc.depositCurrency || "USD",

      depositAmount: paymentType === "deposit" ? depositAmount : undefined,
      remainingAmount,
      deadlineToPayRest,

      platformFee,
      renterShare,

      status: "pending_payment",
      isTestPayment: true,
    });

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const amountToCharge = paymentType === "full" ? totalPrice : depositAmount;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: dormDoc.depositCurrency?.toLowerCase() || "usd",
            unit_amount: Math.round(amountToCharge * 100),
            product_data: {
              name: `${dormDoc.title} (${
                paymentType === "full" ? "Full payment" : "Deposit"
              })`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/room/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/room/payment-cancelled`,
      metadata: {
        bookingId: booking._id.toString(),
        dormId,
        clientId: user._id.toString(),
        paymentType,
      },
      customer_email: user.email,
    });

    booking.stripeSessionId = session.id;
    await booking.save();

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("POST /api/payments/create-checkout-session error:", err);
    return NextResponse.json(
      { message: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

app/api/payments/confirm/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { message: "session_id is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata || !session.metadata.bookingId) {
      return NextResponse.json(
        { message: "Booking metadata not found on session" },
        { status: 400 }
      );
    }

    const bookingId = session.metadata.bookingId;
    const paymentType = session.metadata.paymentType as
      | "deposit"
      | "full"
      | undefined;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "pending_payment") {
      // already processed
      return NextResponse.json({ booking });
    }

    if (session.payment_status !== "paid") {
      booking.paymentStatus = "failed";
      booking.status = "cancelled";
      booking.cancelReason = "payment_failed";
      await booking.save();
      return NextResponse.json(
        { message: "Payment not completed", booking },
        { status: 400 }
      );
    }

    // مكتملة ومدفوعة
    booking.paymentStatus = "paid";
    booking.status = paymentType === "full" ? "confirmed" : "reserved";
    booking.stripePaymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : undefined;

    await booking.save();

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("GET /api/payments/confirm error:", err);
    return NextResponse.json(
      { message: "Failed to confirm payment" },
      { status: 500 }
    );
  }
}


app/dashboard/layout.tsx
// app/dashboard/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import {
  FiHome,
  FiDollarSign,
  FiUsers,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiMoon,
  FiSun,
  FiMonitor,
  FiLogOut,
  FiMenu,
  FiMapPin, // 👈 NEW
} from "react-icons/fi";

interface User {
  id: string;
  name: string;
  email: string;
  role: "super-admin" | "accounts-admin" | "managers-admin" | string;
}

type ThemeOption = "system" | "light" | "dark";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [collapsed, setCollapsed] = useState(false); // sidebar collapsed (desktop)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // sidebar visible (mobile)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>("system");

  const router = useRouter();
  const pathname = usePathname();

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [router]);

  // Theme load
  useEffect(() => {
    const stored =
      (localStorage.getItem("renthub-theme") as ThemeOption) || "system";
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const applyTheme = (value: ThemeOption) => {
    if (value === "light")
      document.documentElement.setAttribute("data-theme", "light");
    else if (value === "dark")
      document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
  };

  const changeTheme = (value: ThemeOption) => {
    setTheme(value);
    localStorage.setItem("renthub-theme", value);
    applyTheme(value);
    setThemeMenuOpen(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return null;

  const isSuperAdmin = user.role === "super-admin";
  const isAccountsAdmin = user.role === "accounts-admin";
  const isManagersAdmin = user.role === "managers-admin";

  const isActive = (t: string) => pathname?.startsWith(t);

  const avatarInitial = user.name?.[0]?.toUpperCase() || "S";

  // Close mobile sidebar whenever a nav link is clicked
  const handleNavClick = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="renthub-app d-flex flex-column">
      {/* Top bar */}
      <header className="renthub-topbar px-3 px-md-4">
        <div className="d-flex align-items-center gap-2">
          {/* Mobile burger button */}
          <button
            type="button"
            className="renthub-burger-btn d-inline d-md-none me-1"
            onClick={() => setMobileSidebarOpen((open) => !open)}
          >
            <FiMenu size={20} />
          </button>

          <Link href="/dashboard" className="renthub-brand-link">
            <div className="d-flex align-items-center gap-2">
              <div className="renthub-logo-mark">
                <FiHome className="renthub-logo-icon" size={18} />
              </div>
              <span className="fw-semibold text-white">RentHub</span>
            </div>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            className="renthub-theme-btn"
            onClick={() => setThemeMenuOpen((o) => !o)}
          >
            {theme === "light" ? (
              <FiSun />
            ) : theme === "dark" ? (
              <FiMoon />
            ) : (
              <FiMonitor />
            )}
          </button>

          {themeMenuOpen && (
            <div className="renthub-theme-dropdown">
              <button onClick={() => changeTheme("system")}>System</button>
              <button onClick={() => changeTheme("light")}>Light</button>
              <button onClick={() => changeTheme("dark")}>Dark</button>
            </div>
          )}

          <span className="d-none d-md-inline">{user.email}</span>

          <div className="renthub-avatar-circle">{avatarInitial}</div>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <div className="renthub-main-shell d-flex flex-grow-1">
        {/* Sidebar */}
        <aside
          className={
            "renthub-sidebar d-flex flex-column" +
            (collapsed ? " renthub-sidebar-collapsed" : "") +
            (mobileSidebarOpen ? " renthub-sidebar-mobile-open" : "")
          }
        >
          {/* Floating toggle (desktop only, hidden on mobile via CSS) */}
          <button
            className="renthub-sidebar-toggle"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>

          <div className="renthub-sidebar-header">
            <div className="renthub-sidebar-avatar">{avatarInitial}</div>
            <div>
              <div className="renthub-sidebar-name">{user.name}</div>
              <div className="renthub-sidebar-role text-uppercase">
                {user.role}
              </div>
            </div>
          </div>

          <nav className="renthub-nav flex-grow-1 mt-3">
            <p className="renthub-nav-section-label">Navigation</p>

            <ul className="list-unstyled">
              {/* HOME */}
              <li>
                <Link
                  href="/dashboard"
                  className={
                    "renthub-nav-link" +
                    (isActive("/dashboard") ? " renthub-nav-link-active" : "")
                  }
                  onClick={handleNavClick}
                >
                  <FiHome />
                  <span>Home</span>
                </Link>
              </li>

              {/* ACCOUNTS */}
              {(isSuperAdmin || isAccountsAdmin) && (
                <li>
                  <Link
                    href="/dashboard/accounts"
                    className={
                      "renthub-nav-link" +
                      (isActive("/dashboard/accounts")
                        ? " renthub-nav-link-active"
                        : "")
                    }
                    onClick={handleNavClick}
                  >
                    <FiDollarSign />
                    <span>Accounts</span>
                  </Link>
                </li>
              )}

              {/* MANAGERS */}
              {(isSuperAdmin || isManagersAdmin) && (
                <li>
                  <Link
                    href="/dashboard/managers"
                    className={
                      "renthub-nav-link" +
                      (isActive("/dashboard/managers")
                        ? " renthub-nav-link-active"
                        : "")
                    }
                    onClick={handleNavClick}
                  >
                    <FiUsers />
                    <span>Managers</span>
                  </Link>
                </li>
              )}

              {/* ADMIN USERS */}
              {isSuperAdmin && (
                <li>
                  <Link
                    href="/dashboard/admins"
                    className={
                      "renthub-nav-link" +
                      (isActive("/dashboard/admins")
                        ? " renthub-nav-link-active"
                        : "")
                    }
                    onClick={handleNavClick}
                  >
                    <FiUser />
                    <span>Admin Users</span>
                  </Link>
                </li>
              )}

              {/* UNIVERSITIES – متاحة لكل الـ admin roles */}
              {(isSuperAdmin || isAccountsAdmin || isManagersAdmin) && (
                <li>
                  <Link
                    href="/dashboard/universities"
                    className={
                      "renthub-nav-link" +
                      (isActive("/dashboard/universities")
                        ? " renthub-nav-link-active"
                        : "")
                    }
                    onClick={handleNavClick}
                  >
                    <FiMapPin />
                    <span>Universities</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* LOGOUT */}
          <div className="renthub-sidebar-footer">
            <button
              type="button"
              className="btn btn-sm btn-outline-light w-100 renthub-logout-btn"
              onClick={() => {
                handleLogout();
                setMobileSidebarOpen(false);
              }}
            >
              <FiLogOut className="renthub-logout-icon" size={16} />
              <span className="renthub-logout-label">Logout</span>
            </button>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {mobileSidebarOpen && (
          <div
            className="renthub-sidebar-backdrop d-md-none"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="renthub-main">
          <div className="renthub-content-card">{children}</div>
        </main>
      </div>
    </div>
  );
}


