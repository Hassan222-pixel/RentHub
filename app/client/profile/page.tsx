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
  return `${(v || 0).toLocaleString()} ${currency}`;
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
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load bookings");
      }

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
          className="container"
          style={{ paddingTop: 30, paddingBottom: 30 }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <h2 style={{ fontWeight: 900, marginBottom: 6 }}>My Profile</h2>
              <div className="text-muted" style={{ fontSize: 13 }}>
                {user.name} • {user.email}
              </div>
            </div>

            <button
              className="btn btn-outline-secondary"
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

          <div
            className="card border-0 mb-3"
            style={{
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <div className="card-body" style={{ padding: 16 }}>
              <div
                style={{ fontWeight: 900, color: "#0f172a", marginBottom: 10 }}
              >
                My bookings
              </div>

              {bookingsLoading ? (
                <div className="text-muted">Loading bookings...</div>
              ) : sorted.length === 0 ? (
                <div className="text-muted">You have no bookings yet.</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {sorted.map((b) => {
                    const isConfirmed = b.status === "confirmed";
                    const badgeBg = isConfirmed ? "#22c55e" : "#ef4444";
                    const badgeText = isConfirmed ? "Confirmed" : "Reserved";

                    const canPayRemaining =
                      b.paymentType === "deposit" &&
                      b.status === "reserved" &&
                      (b.remainingAmount || 0) > 0;

                    return (
                      <div
                        key={b.id}
                        style={{
                          border: "1px solid rgba(15,23,42,0.08)",
                          borderRadius: 14,
                          padding: 12,
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: 54,
                              height: 54,
                              borderRadius: 12,
                              background: "rgba(15,23,42,0.06)",
                              overflow: "hidden",
                              flex: "0 0 auto",
                            }}
                          >
                            {b.dorm.profileImg ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={b.dorm.profileImg}
                                alt={b.dorm.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : null}
                          </div>

                          <div>
                            <div style={{ fontWeight: 900, color: "#0f172a" }}>
                              {b.dorm.title}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: 13 }}
                            >
                              {b.dorm.city ? `${b.dorm.city} • ` : ""}
                              {fmtDate(b.startDate)} → {fmtDate(b.endDate)}
                            </div>

                            <div
                              className="text-muted"
                              style={{ fontSize: 12, marginTop: 4 }}
                            >
                              Type:{" "}
                              <span style={{ fontWeight: 800 }}>
                                {b.paymentType}
                              </span>
                              {" • "}
                              Total:{" "}
                              <span style={{ fontWeight: 800 }}>
                                {money(b.totalPrice, b.currency)}
                              </span>
                              {b.paymentType === "deposit" ? (
                                <>
                                  {" • "}
                                  Paid:{" "}
                                  <span style={{ fontWeight: 800 }}>
                                    {money(b.depositAmount, b.currency)}
                                  </span>
                                  {" • "}
                                  Remaining:{" "}
                                  <span style={{ fontWeight: 800 }}>
                                    {money(b.remainingAmount, b.currency)}
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginLeft: "auto",
                          }}
                        >
                          <span
                            style={{
                              background: badgeBg,
                              color: "#fff",
                              padding: "6px 10px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 900,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {badgeText}
                          </span>

                          {canPayRemaining && (
                            <button
                              className="btn btn-primary"
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

          <div
            className="card border-0"
            style={{
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <div className="card-body" style={{ padding: 16 }}>
              <div
                style={{ fontWeight: 900, color: "#0f172a", marginBottom: 10 }}
              >
                Basic information
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Name
                  </div>
                  <div style={{ fontWeight: 800 }}>{user.name}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Email
                  </div>
                  <div style={{ fontWeight: 800 }}>{user.email}</div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Role
                  </div>
                  <div style={{ fontWeight: 800 }}>{user.role}</div>
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
