/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Totals = {
  totalRevenue: number; // money received
  totalPlatformFee: number;
  totalRenterShare: number;
};

type DailyStat = {
  day: string; // "YYYY-MM-DD"
  amount: number; // money received that day
};

type RenterStat = {
  renterId: string;
  renterName: string;
  renterEmail: string;
  bookingsCount: number;
  renterRevenue: number; // ✅ after 8%
};

type LatestBooking = {
  id: string;
  dormTitle: string;
  renterName: string;
  renterEmail: string;
  clientName: string;
  phone: string;
  paymentType: string;
  status: string;
  createdAt: string;

  paidAmount: number; // received
  totalPrice: number; // contract total
  platformFee: number;
  renterShare: number;
  currency: string;
};

function formatMoney(value: number | undefined | null, currency = "USD") {
  return `${(value || 0).toLocaleString()} ${currency}`;
}

function shortDayLabel(yyyyMMdd: string) {
  // "2025-12-14" => "12/14"
  const [, mm, dd] = yyyyMMdd.split("-");
  return `${mm}/${dd}`;
}

function buildLinePath(values: number[], width: number, height: number) {
  if (values.length === 0) return "";

  const max = Math.max(...values, 1);
  const pad = 18;
  const w = Math.max(width, 700);
  const h = Math.max(height, 180);

  const xStep = (w - pad * 2) / Math.max(values.length - 1, 1);

  return values
    .map((v, i) => {
      const x = pad + i * xStep;
      const y = pad + (1 - v / max) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accessChecked, setAccessChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [totals, setTotals] = useState<Totals | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [renters, setRenters] = useState<RenterStat[]>([]);
  const [latestBookings, setLatestBookings] = useState<LatestBooking[]>([]);

  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const { user } = await res.json();
        if (!(user.role === "super-admin" || user.role === "accounts-admin")) {
          router.replace("/dashboard");
          return;
        }
        setAccessChecked(true);
      } catch {
        router.replace("/login");
      }
    };

    checkAccess();
  }, [router]);

  useEffect(() => {
    if (!accessChecked) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/dashboard/accounts/overview", {
          cache: "no-store",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "Failed to load accounts data");
        }

        const data = await res.json();
        setTotals(data.totals);
        setDailyStats(data.dailyStats || []);
        setRenters(data.renters || []);
        setLatestBookings(data.latestBookings || []);
      } catch (err: any) {
        console.error("Accounts load error:", err);
        setError(err.message || "Failed to load accounts data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [accessChecked]);

  const chart = useMemo(() => {
    const values = dailyStats.map((d) => d.amount);
    const w = Math.max(900, dailyStats.length * 35); // scrollable width
    const h = 190;
    const path = buildLinePath(values, w, h);
    const max = Math.max(...values, 1);
    return { values, w, h, path, max };
  }, [dailyStats]);

  if (!accessChecked) return <div>Loading...</div>;
  if (loading && !totals) return <div>Loading accounts...</div>;

  return (
    <div>
      <h2 className="mb-3">Accounts Overview</h2>

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      {totals && (
        <div className="row mb-4">
          <div className="col-md-4 mb-3">
            <div
              className="p-3 h-100"
              style={{
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, rgba(76,175,80,0.9), rgba(56,142,60,0.9))",
                color: "white",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
            >
              <h5>Total Revenue</h5>
              <h3 className="mt-2 mb-1">
                {formatMoney(totals.totalRevenue, "USD")}
              </h3>
              <p className="mb-0" style={{ opacity: 0.9 }}>
                Money received (deposit + full).
              </p>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div
              className="p-3 h-100"
              style={{
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, rgba(33,150,243,0.9), rgba(25,118,210,0.9))",
                color: "white",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
            >
              <h5>Platform Earnings (8%)</h5>
              <h3 className="mt-2 mb-1">
                {formatMoney(totals.totalPlatformFee, "USD")}
              </h3>
              <p className="mb-0" style={{ opacity: 0.9 }}>
                8% from received payments.
              </p>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div
              className="p-3 h-100"
              style={{
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, rgba(255,152,0,0.9), rgba(239,108,0,0.9))",
                color: "white",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
              }}
            >
              <h5>Renters Share (92%)</h5>
              <h3 className="mt-2 mb-1">
                {formatMoney(totals.totalRenterShare, "USD")}
              </h3>
              <p className="mb-0" style={{ opacity: 0.9 }}>
                Total split to renters (after 8%).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Daily Line Chart */}
      {dailyStats.length > 0 && (
        <div className="mb-4">
          <h5 className="mb-2">Daily revenue (last 30 days)</h5>

          <div
            style={{
              borderRadius: "12px",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <svg width={chart.w} height={chart.h}>
                {/* baseline */}
                <line
                  x1="0"
                  y1={chart.h - 18}
                  x2={chart.w}
                  y2={chart.h - 18}
                  stroke="rgba(0,0,0,0.12)"
                />

                {/* draw line only if 2+ points */}
                {chart.values.length > 1 && (
                  <path
                    d={chart.path}
                    fill="none"
                    stroke="#1e88e5"
                    strokeWidth="3"
                  />
                )}

                {/* dots */}
                {chart.values.map((v, i) => {
                  const pad = 18;
                  const xStep =
                    (chart.w - pad * 2) / Math.max(chart.values.length - 1, 1);
                  const x = pad + i * xStep;
                  const y = pad + (1 - v / chart.max) * (chart.h - pad * 2);

                  return <circle key={i} cx={x} cy={y} r="4" fill="#1e88e5" />;
                })}
              </svg>
            </div>

            {/* labels (show every 5 days to avoid mess) */}
            <div
              className="d-flex justify-content-between mt-2"
              style={{ fontSize: 12, color: "#555" }}
            >
              {dailyStats.map((d, i) => (
                <span
                  key={d.day}
                  style={{
                    minWidth: 42,
                    textAlign: "center",
                    opacity: i % 5 === 0 ? 1 : 0.25,
                  }}
                >
                  {shortDayLabel(d.day)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Renters split (real) */}
      <div className="mb-4">
        <h5 className="mb-2">Renters split (real)</h5>

        {renters.length === 0 ? (
          <p>No paid bookings yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Renter</th>
                  <th>Email</th>
                  <th>Paid Bookings</th>
                  <th>Renter Revenue (92%)</th>
                </tr>
              </thead>
              <tbody>
                {renters.map((r) => (
                  <tr key={r.renterId}>
                    <td>
                      <strong>{r.renterName}</strong>
                    </td>
                    <td className="text-muted">{r.renterEmail || "—"}</td>
                    <td>{r.bookingsCount}</td>
                    <td>{formatMoney(r.renterRevenue, "USD")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Latest bookings */}
      <div>
        <h5 className="mb-2">Latest bookings (paid)</h5>

        {latestBookings.length === 0 ? (
          <p>No paid bookings yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Dorm</th>
                  <th>Renter</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Paid</th>
                  <th>Total</th>
                  <th>Platform</th>
                  <th>Renter</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {latestBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      {new Date(b.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>{b.dormTitle || "—"}</td>
                    <td>
                      {b.renterName || "—"}
                      {b.renterEmail ? (
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {b.renterEmail}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      {b.clientName || "Unknown"}
                      {b.phone ? (
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {b.phone}
                        </div>
                      ) : null}
                    </td>
                    <td className="text-capitalize">{b.paymentType}</td>
                    <td>{formatMoney(b.paidAmount, b.currency)}</td>
                    <td>{formatMoney(b.totalPrice, b.currency)}</td>
                    <td>{formatMoney(b.platformFee, b.currency)}</td>
                    <td>{formatMoney(b.renterShare, b.currency)}</td>
                    <td className="text-capitalize">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
