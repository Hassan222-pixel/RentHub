/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
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
  houseRules?: string[] | string;

  latitude?: number;
  longitude?: number;

  amenities?: string[];
  images?: string[];
  profileImg?: string;
  tour3DUrl?: string;

  // model booleans
  hasWifi?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  hasParking?: boolean;
  hasLaundry?: boolean;
  isFurnished?: boolean;

  adminAvailability?: "available" | "not_available";
};

type DormApiResponse = {
  dorm: DormType;
  isOccupiedNow?: boolean;
  occupiedUntil?: string | null;
  adminAvailability?: "available" | "not_available";
  isAdminBlocked?: boolean;
  availableBeds?: number;
  capacity?: number;
};

type MyDormBookingResponse = {
  hasBooking: boolean;
  booking?: { status: string; startDate: string; endDate: string };
} | null;

/* ---------------- Icons (inline SVG, no extra deps) ---------------- */
function Icon({
  name,
  className,
}: {
  name:
    | "wifi"
    | "parking"
    | "laundry"
    | "ac"
    | "heating"
    | "furnished"
    | "map"
    | "rules"
    | "people"
    | "gender"
    | "smoking"
    | "pets"
    | "camera"
    | "tour";
  className?: string;
}) {
  const common = {
    className: `rh-icon ${className ?? ""}`.trim(),
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (name) {
    case "wifi":
      return (
        <svg {...common}>
          <path
            d="M5 9.5C9.5 6 14.5 6 19 9.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M7.8 12.2c3-2.4 5.4-2.4 8.4 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10.6 15c1.2-1 1.6-1.2 2.8 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="12" cy="18" r="1.2" fill="currentColor" />
        </svg>
      );
    case "parking":
      return (
        <svg {...common}>
          <path
            d="M7 20V4h6a4 4 0 0 1 0 8H7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 12h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "laundry":
      return (
        <svg {...common}>
          <path
            d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle
            cx="12"
            cy="13"
            r="4"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 6h.01M11 6h.01"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "ac":
      return (
        <svg {...common}>
          <path
            d="M4 8h16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M7 16v2M12 16v2M17 16v2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "heating":
      return (
        <svg {...common}>
          <path
            d="M8 3v18M16 3v18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M5 7h14M5 12h14M5 17h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "furnished":
      return (
        <svg {...common}>
          <path
            d="M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M4 12h16v6H4v-6Z" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M6 18v2M18 18v2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path
            d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle
            cx="12"
            cy="10"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "rules":
      return (
        <svg {...common}>
          <path d="M7 3h10v18H7z" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M9 7h6M9 11h6M9 15h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle
            cx="10"
            cy="8"
            r="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M20 21v-2a3.5 3.5 0 0 0-3-3.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "gender":
      return (
        <svg {...common}>
          <path
            d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M12 14v7M9 18h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "smoking":
      return (
        <svg {...common}>
          <path
            d="M2 14h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M18 14h4v3h-4z" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M16 17v-3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M6 10c0-1 1-1 1-2s-1-1-1-2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "pets":
      return (
        <svg {...common}>
          <path
            d="M12 12c2 0 4 1.5 4 3.5S14.5 19 12 19s-4-1.5-4-3.5S10 12 12 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="8" cy="10" r="1.2" fill="currentColor" />
          <circle cx="16" cy="10" r="1.2" fill="currentColor" />
          <circle cx="10" cy="8" r="1.2" fill="currentColor" />
          <circle cx="14" cy="8" r="1.2" fill="currentColor" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path
            d="M4 7h3l2-2h6l2 2h3v12H4V7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="13"
            r="3"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "tour":
      return (
        <svg {...common}>
          <path
            d="M12 3l9 4.5-9 4.5-9-4.5L12 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M21 7.5v9L12 21l-9-4.5v-9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

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

  const [capacity, setCapacity] = useState<number | null>(null);
  const [availableBeds, setAvailableBeds] = useState<number | null>(null);

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
          setIsOccupiedNow(!!data.isOccupiedNow || !!data.isAdminBlocked);
          setOccupiedUntil(data.occupiedUntil ?? null);

          setCapacity(typeof data.capacity === "number" ? data.capacity : null);
          setAvailableBeds(
            typeof data.availableBeds === "number" ? data.availableBeds : null
          );

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

  const heroImages = useMemo(() => {
    const list = [dorm?.profileImg, ...(dorm?.images ?? [])].filter(
      Boolean
    ) as string[];
    return Array.from(new Set(list)).slice(0, 12);
  }, [dorm?.profileImg, dorm?.images]);

  const highlights = useMemo(() => {
    if (!dorm) return [];
    const items: Array<{ label: string; icon: any; on?: boolean }> = [
      { label: "Free WiFi", icon: "wifi", on: !!dorm.hasWifi },
      { label: "Parking", icon: "parking", on: !!dorm.hasParking },
      { label: "Laundry", icon: "laundry", on: !!dorm.hasLaundry },
      { label: "Air conditioning", icon: "ac", on: !!dorm.hasAirConditioning },
      { label: "Heating", icon: "heating", on: !!dorm.hasHeating },
      { label: "Furnished", icon: "furnished", on: !!dorm.isFurnished },
    ];

    const extra = (dorm.amenities ?? [])
      .filter((a) => typeof a === "string" && a.trim().length > 0)
      .slice(0, 8)
      .map((a) => ({ label: a, icon: "camera" as const, on: true }));

    return [...items.filter((x) => x.on), ...extra];
  }, [dorm]);

  const computedCapacity = useMemo(() => {
    if (typeof capacity === "number" && capacity > 0) return capacity;
    if (!dorm) return 1;
    if (dorm.roomType === "private") return 1;
    if (dorm.roomType === "double") return 2;
    if (dorm.roomType === "shared")
      return dorm.maxOccupants && dorm.maxOccupants > 0 ? dorm.maxOccupants : 1;
    return 1;
  }, [capacity, dorm]);

  const perPersonPrice = useMemo(() => {
    if (!dorm) return null;
    // Prefer monthly price for "per person" since your model has pricePerMonth
    if (typeof dorm.pricePerMonth === "number" && dorm.pricePerMonth > 0) {
      return Math.round(dorm.pricePerMonth / Math.max(computedCapacity, 1));
    }
    // fallback to nightly if monthly doesn't exist
    if (typeof dorm.pricePerNight === "number" && dorm.pricePerNight > 0) {
      return Math.round(dorm.pricePerNight / Math.max(computedCapacity, 1));
    }
    return null;
  }, [dorm, computedCapacity]);

  const roomMeta = useMemo(() => {
    if (!dorm) return [];

    const capacityLabel =
      dorm.roomType === "private"
        ? "1 person"
        : dorm.roomType === "double"
        ? "2 people"
        : dorm.maxOccupants
        ? `${dorm.maxOccupants} people`
        : computedCapacity
        ? `${computedCapacity} people`
        : "—";

    const gender =
      dorm.genderPreference === "male"
        ? "Male only"
        : dorm.genderPreference === "female"
        ? "Female only"
        : "Any";

    return [
      {
        label: "Room type",
        value: dorm.roomType ?? "—",
        icon: "people" as const,
      },
      { label: "Capacity", value: capacityLabel, icon: "people" as const },
      { label: "Gender preference", value: gender, icon: "gender" as const },
      {
        label: "Smoking",
        value: dorm.allowsSmoking ? "Allowed" : "Not allowed",
        icon: "smoking" as const,
      },
      {
        label: "Pets",
        value: dorm.allowsPets ? "Allowed" : "Not allowed",
        icon: "pets" as const,
      },
    ];
  }, [dorm, computedCapacity]);

  const canBook =
    !!dorm?._id && !isAdminBlocked && !isOccupiedNow && !hasMyBooking;

  const availabilityBlock = useMemo(() => {
    if (isAdminBlocked)
      return { tone: "danger", text: "Not available (disabled by admin)" };
    if (hasMyBooking)
      return {
        tone: "warning",
        text: `You already have a booking${
          myBookingStatus ? ` (${myBookingStatus})` : ""
        }.`,
      };
    if (isOccupiedNow && occupiedUntilDate) {
      return {
        tone: "danger",
        text: `Occupied until ${occupiedUntilDate.toLocaleDateString(
          undefined,
          { year: "numeric", month: "short", day: "numeric" }
        )}`,
      };
    }
    if (isOccupiedNow) return { tone: "danger", text: "Currently occupied" };
    return { tone: "success", text: "Available now" };
  }, [
    isAdminBlocked,
    hasMyBooking,
    myBookingStatus,
    isOccupiedNow,
    occupiedUntilDate,
  ]);

  const handleBookClick = () => {
    if (!dorm?._id) return;
    if (!canBook) return;
    router.push(`/room/request/${dorm._id}`);
  };

  const locationLine = useMemo(() => {
    if (!dorm) return "";
    const parts = [dorm.address, dorm.city].filter(Boolean);
    return parts.join(", ");
  }, [dorm]);

  const rulesList: string[] = useMemo(() => {
    if (!dorm?.houseRules) return [];
    if (Array.isArray(dorm.houseRules)) return dorm.houseRules.filter(Boolean);
    return String(dorm.houseRules)
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [dorm?.houseRules]);

  const hasCoords = dorm?.latitude != null && dorm?.longitude != null;

  return (
    <div className="container py-4 rh-room-details">
      <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
        <div>
          <nav className="rh-breadcrumb mb-2">
            <Link href="/room" className="rh-breadcrumb-link">
              Rooms
            </Link>
            <span className="rh-breadcrumb-sep">/</span>
            <span className="rh-breadcrumb-current">Details</span>
          </nav>

          <h1 className="rh-title mb-1">
            {dorm ? dorm.title : "Room details"}
          </h1>
          <div className="rh-subtitle">
            {dorm?.university ? (
              <span className="me-2">{dorm.university}</span>
            ) : null}
            {locationLine ? (
              <span className="text-muted">{locationLine}</span>
            ) : null}
          </div>
        </div>

        <div className="d-none d-md-flex gap-2">
          <Link href="/room" className="btn btn-outline-secondary rounded-pill">
            ← Back
          </Link>
        </div>
      </div>

      {loading && (
        <div className="rh-skeleton card border-0">
          <div className="card-body">
            <div className="rh-skel-line w-50 mb-2" />
            <div className="rh-skel-line w-75 mb-3" />
            <div className="row g-3">
              <div className="col-lg-8">
                <div className="rh-skel-box" style={{ height: 360 }} />
              </div>
              <div className="col-lg-4">
                <div className="rh-skel-box" style={{ height: 360 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {error && !loading && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && dorm && (
        <div className="row g-4">
          {/* LEFT */}
          <div className="col-lg-8">
            {/* Gallery */}
            <div className="card rh-card border-0 mb-4">
              <div className="card-body">
                <div className="rh-gallery">
                  <div className="rh-gallery-main">
                    <img
                      src={
                        activeImage ||
                        dorm.profileImg ||
                        dorm.images?.[0] ||
                        "/template/images/room1.jpg"
                      }
                      alt={dorm.title}
                      className="rh-gallery-main-img"
                    />

                    <div className="rh-gallery-badges">
                      <span
                        className={`badge rh-badge bg-${availabilityBlock.tone}`}
                      >
                        {availabilityBlock.text}
                      </span>
                      {typeof availableBeds === "number" &&
                      typeof capacity === "number" ? (
                        <span className="badge rh-badge bg-light text-dark">
                          Beds: {availableBeds}/{capacity}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {heroImages.length > 1 && (
                    <div className="rh-gallery-thumbs mt-3">
                      {heroImages.map((img, idx) => (
                        <button
                          type="button"
                          key={`${img}-${idx}`}
                          className={`rh-thumb ${
                            activeImage === img ? "rh-thumb-active" : ""
                          }`}
                          onClick={() => setActiveImage(img)}
                          aria-label={`Open image ${idx + 1}`}
                        >
                          <img
                            src={img}
                            alt={`${dorm.title} thumbnail ${idx + 1}`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="card rh-card border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h5 className="mb-0 rh-section-title">Property highlights</h5>
                  {dorm.tour3DUrl ? (
                    <a
                      href={dorm.tour3DUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-primary rounded-pill"
                    >
                      <span className="me-1">
                        <Icon name="tour" />
                      </span>
                      3D Tour
                    </a>
                  ) : null}
                </div>

                <div className="rh-chips">
                  {highlights.length > 0 ? (
                    highlights.map((h, i) => (
                      <span className="rh-chip" key={`${h.label}-${i}`}>
                        <Icon name={h.icon} />
                        <span>{h.label}</span>
                      </span>
                    ))
                  ) : (
                    <div className="text-muted">No highlights added yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="card rh-card border-0 mb-4">
              <div className="card-body">
                <h5 className="mb-3 rh-section-title">Details</h5>
                <div className="row g-3">
                  {roomMeta.map((m) => (
                    <div className="col-md-6" key={m.label}>
                      <div className="rh-meta">
                        <div className="rh-meta-icon">
                          <Icon name={m.icon} />
                        </div>
                        <div>
                          <div className="rh-meta-label">{m.label}</div>
                          <div className="rh-meta-value">{m.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ✅ House Rules (moved ABOVE About) */}
            <div className="card rh-card border-0 mb-4">
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Icon name="rules" />
                  <h5 className="mb-0 rh-section-title">House rules</h5>
                </div>

                {rulesList.length > 0 ? (
                  <ul className="rh-list">
                    {rulesList.map((r, i) => (
                      <li key={`${r}-${i}`}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted">No specific rules provided.</div>
                )}
              </div>
            </div>

            {/* ✅ About (now after rules) */}
            <div className="card rh-card border-0 mb-4">
              <div className="card-body">
                <h5 className="mb-2 rh-section-title">About this room</h5>
                <p className="mb-0 rh-body">{dorm.description}</p>
              </div>
            </div>

            <div className="d-md-none">
              <Link
                href="/room"
                className="btn btn-outline-secondary w-100 rounded-pill"
              >
                ← Back to Rooms
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-lg-4">
            <div className="rh-sticky">
              {/* Pricing/CTA */}
              <div className="card rh-card border-0">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <div>
                      <div className="rh-mini-title">Pricing</div>
                      <div className="rh-price">
                        {dorm.pricePerMonth != null
                          ? `${formatMoney(dorm.pricePerMonth, currency)}`
                          : dorm.pricePerNight != null
                          ? `${formatMoney(dorm.pricePerNight, currency)}`
                          : "—"}
                        <span className="rh-price-suffix">
                          {dorm.pricePerMonth != null
                            ? "/month"
                            : dorm.pricePerNight != null
                            ? "/night"
                            : ""}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`badge rh-badge bg-${availabilityBlock.tone}`}
                    >
                      {availabilityBlock.tone === "success"
                        ? "Available"
                        : "Unavailable"}
                    </span>
                  </div>

                  <div className="rh-divider my-3" />

                  <div className="rh-kv">
                    <div className="rh-kv-row">
                      <span className="rh-kv-key">Monthly</span>
                      <span className="rh-kv-val">
                        {dorm.pricePerMonth != null
                          ? formatMoney(dorm.pricePerMonth, currency)
                          : "—"}
                      </span>
                    </div>

                    {/* ✅ Removed Daily row, replaced with per person */}
                    <div className="rh-kv-row">
                      <span className="rh-kv-key">Per person</span>
                      <span className="rh-kv-val">
                        {perPersonPrice != null
                          ? `${formatMoney(perPersonPrice, currency)} / person`
                          : "—"}
                      </span>
                    </div>

                    <div className="rh-kv-row">
                      <span className="rh-kv-key">Deposit</span>
                      <span className="rh-kv-val">
                        {dorm.depositAmount != null
                          ? formatMoney(dorm.depositAmount, currency)
                          : "—"}
                      </span>
                    </div>

                    {typeof availableBeds === "number" &&
                    typeof capacity === "number" ? (
                      <div className="rh-kv-row">
                        <span className="rh-kv-key">Beds</span>
                        <span className="rh-kv-val">
                          {availableBeds}/{capacity}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="rh-divider my-3" />

                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    disabled={!canBook}
                    onClick={handleBookClick}
                  >
                    Book this room
                  </button>

                  {!canBook ? (
                    <div className="rh-help mt-2">
                      {isAdminBlocked
                        ? "This listing is disabled by admin."
                        : hasMyBooking
                        ? "You already have a booking for this room."
                        : isOccupiedNow
                        ? "This room is currently occupied."
                        : ""}
                    </div>
                  ) : (
                    <div className="rh-help mt-2">
                      You’ll pick your dates on the next step.
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ Location map box like the picture */}
              {(hasCoords || locationLine) && (
                <div className="card rh-card border-0 mt-3">
                  <div className="card-body">
                    <div className="rh-mini-title mb-2">Location</div>

                    {hasCoords ? (
                      <div className="rh-mapbox">
                        <iframe
                          className="rh-map-iframe"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps?q=${
                            dorm!.latitude
                          },${dorm!.longitude}&z=14&output=embed`}
                          title="Google map"
                        />
                        <a
                          className="rh-map-btn"
                          target="_blank"
                          rel="noreferrer"
                          href={`https://www.google.com/maps?q=${
                            dorm!.latitude
                          },${dorm!.longitude}`}
                        >
                          Show on map
                        </a>
                      </div>
                    ) : (
                      <div className="rh-location">
                        <Icon name="map" />
                        <div className="flex-grow-1">
                          <div className="rh-location-text">{locationLine}</div>
                        </div>
                      </div>
                    )}

                    {locationLine ? (
                      <div className="rh-map-caption mt-2">{locationLine}</div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Quick info */}
              <div className="card rh-card border-0 mt-3">
                <div className="card-body">
                  <div className="rh-mini-title mb-2">Quick info</div>
                  <div className="rh-quick">
                    <div className="rh-quick-item">
                      <Icon name="camera" />
                      <span>{heroImages.length} photos</span>
                    </div>
                    {dorm.roomType ? (
                      <div className="rh-quick-item">
                        <Icon name="people" />
                        <span>{dorm.roomType}</span>
                      </div>
                    ) : null}
                    {dorm.genderPreference ? (
                      <div className="rh-quick-item">
                        <Icon name="gender" />
                        <span>{dorm.genderPreference}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !dorm && !error && (
        <div className="alert alert-warning">Room not found.</div>
      )}
    </div>
  );
}
