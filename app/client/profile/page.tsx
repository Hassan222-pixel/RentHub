/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type BookingItem = {
  id: string;
  dorm: {
    id: string;
    title: string;
    profileImg: string | null;
    city: string;
    roomType: string | null;
  };
  startDate: string;
  endDate: string;

  status: "reserved" | "confirmed";
  paymentType: "deposit" | "full";
  paymentStatus: "paid" | "unpaid" | "failed" | "refunded";

  currency: string;
  totalPrice: number;

  depositAmount: number;
  remainingAmount: number;
  deadlineToPayRest: string | null;

  createdAt: string;
};

function money(v: number | null | undefined, currency = "USD") {
  const value = typeof v === "number" ? v : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString()} ${currency}`;
  }
}

function fmtDate(d: string) {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  return x.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ClientProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          const next = encodeURIComponent("/client/profile");
          router.replace(`/client/login?next=${next}`);
          return;
        }

        const data = await res.json();
        if (!cancelled) setUser(data.user || null);
      } catch {
        const next = encodeURIComponent("/client/profile");
        router.replace(`/client/login?next=${next}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const loadBookings = async () => {
    try {
      setBookingsLoading(true);
      setError(null);

      const res = await fetch("/api/bookings/my", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed to load bookings");

      setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const sorted = useMemo(() => {
    return [...bookings].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));
  }, [bookings]);

  const payRemaining = async (bookingId: string) => {
    try {
      setPayingId(bookingId);

      const res = await fetch("/api/payments/create-remaining-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to start remaining payment.");
      }

      const url = data?.url as string | undefined;
      if (!url) throw new Error("No checkout URL returned.");

      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || "Payment failed.");
      setPayingId(null);
    }
  };

  if (loading) return <div className="p-3">Loading profile...</div>;
  if (!user) return <div className="p-3">Not logged in.</div>;

  return (
    <div className="main-layout">
      <div className="our_room">
        <div
          className="container rh-profile"
          style={{ paddingTop: 30, paddingBottom: 30 }}
        >
          {/* Header */}
          <div className="rh-profile-head mb-3">
            <div>
              <div className="rh-profile-kicker">Account</div>
              <h2 className="rh-profile-title mb-1">My Profile</h2>
              <div className="rh-profile-sub">
                <span className="rh-dot" />
                <span className="rh-strong">{user.name}</span>
                <span className="rh-sep">•</span>
                <span className="rh-strong">{user.email}</span>
              </div>
            </div>

            <button
              className="btn btn-outline-secondary rounded-pill"
              onClick={loadBookings}
              disabled={bookingsLoading}
            >
              {bookingsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Bookings card */}
          <div className="card rh-card border-0 mb-3">
            <div className="card-body rh-card-body">
              <div className="rh-card-head mb-3">
                <div>
                  <div className="rh-section-title">My bookings</div>
                  <div className="rh-section-sub">
                    Track status, payments, and dates for your stays.
                  </div>
                </div>

                <div className="rh-badge-soft">
                  {sorted.length} booking{sorted.length === 1 ? "" : "s"}
                </div>
              </div>

              {bookingsLoading ? (
                <div className="rh-empty">Loading bookings...</div>
              ) : sorted.length === 0 ? (
                <div className="rh-empty">You have no bookings yet.</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {sorted.map((b) => {
                    const isConfirmed = b.status === "confirmed";

                    const statusLabel = isConfirmed ? "Confirmed" : "Reserved";
                    const statusClass = isConfirmed
                      ? "rh-status-ok"
                      : "rh-status-warn";

                    const canPayRemaining =
                      b.paymentType === "deposit" &&
                      b.status === "reserved" &&
                      (b.remainingAmount || 0) > 0;

                    const imageSrc = b.dorm.profileImg || "";

                    return (
                      <div key={b.id} className="rh-booking-row">
                        {/* left */}
                        <div className="rh-booking-left">
                          <div className="rh-thumb">
                            {imageSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imageSrc}
                                alt={b.dorm.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div className="rh-thumb-fallback">
                                {b.dorm.title?.slice(0, 1) || "R"}
                              </div>
                            )}
                          </div>

                          <div className="rh-booking-meta">
                            <div className="rh-booking-title">
                              {b.dorm.title}
                            </div>

                            <div className="rh-booking-sub">
                              {b.dorm.city ? <span>{b.dorm.city}</span> : null}
                              {b.dorm.city ? (
                                <span className="rh-sep">•</span>
                              ) : null}
                              <span>
                                {fmtDate(b.startDate)} → {fmtDate(b.endDate)}
                              </span>
                            </div>

                            <div className="rh-booking-line">
                              <span className="rh-chip">
                                Payment: <strong>{b.paymentType}</strong>
                              </span>
                              <span className="rh-chip">
                                Total:{" "}
                                <strong>
                                  {money(b.totalPrice, b.currency)}
                                </strong>
                              </span>

                              {b.paymentType === "deposit" ? (
                                <>
                                  <span className="rh-chip">
                                    Paid:{" "}
                                    <strong>
                                      {money(b.depositAmount, b.currency)}
                                    </strong>
                                  </span>
                                  <span className="rh-chip">
                                    Remaining:{" "}
                                    <strong>
                                      {money(b.remainingAmount, b.currency)}
                                    </strong>
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {/* right */}
                        <div className="rh-booking-right">
                          <span className={`rh-status ${statusClass}`}>
                            {statusLabel}
                          </span>

                          {canPayRemaining && (
                            <button
                              className="btn btn-primary rounded-pill"
                              onClick={() => payRemaining(b.id)}
                              disabled={payingId === b.id}
                            >
                              {payingId === b.id
                                ? "Redirecting..."
                                : "Pay the remaining"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Basic info card */}
          <div className="card rh-card border-0">
            <div className="card-body rh-card-body">
              <div className="rh-card-head mb-3">
                <div>
                  <div className="rh-section-title">Basic information</div>
                  <div className="rh-section-sub">
                    Your account details used for bookings.
                  </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="rh-field-label">Name</div>
                  <div className="rh-field-value">{user.name}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="rh-field-label">Email</div>
                  <div className="rh-field-value">{user.email}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="rh-field-label">Role</div>
                  <div className="rh-field-value">{user.role}</div>
                </div>
              </div>
            </div>
          </div>
          {/* end */}
        </div>
      </div>
    </div>
  );
}
