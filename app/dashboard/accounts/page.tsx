/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Totals = {
  totalRevenue: number;
  totalPlatformFee: number;
  totalRenterShare: number;
};

type MonthlyStat = {
  month: string; // "YYYY-MM"
  amount: number;
};

type RenterStat = {
  renterId: string;
  renterName: string;
  renterEmail: string;
  bookingsCount: number;
  renterRevenue: number; // renter share after 8%
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

  paidAmount: number;
  totalPrice: number;
  platformFee: number;
  renterShare: number;
  currency: string;
};

function fmtMoney(v: number | null | undefined, currency = "USD") {
  return `${(v || 0).toLocaleString()} ${currency}`;
}

function shortMonthLabel(yyyyMm: string) {
  const [, mm] = yyyyMm.split("-");
  const map: Record<string, string> = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };
  return map[mm] || yyyyMm;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function buildLinePath(values: number[], width: number, height: number) {
  if (!values.length) return "";
  const max = Math.max(...values, 1);
  const padX = 16;
  const padY = 18;
  const w = width;
  const h = height;
  const xStep = (w - padX * 2) / Math.max(values.length - 1, 1);

  return values
    .map((v, i) => {
      const x = padX + i * xStep;
      const y = padY + (1 - v / max) * (h - padY * 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function donutArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

function normalizePct(part: number, total: number) {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

function CardShell({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="card border-0"
      style={{
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <div className="card-body" style={{ padding: 16 }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div style={{ fontWeight: 800, fontSize: 14, color: "#334155" }}>
            {title}
          </div>
          {right}
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  accent: "orange" | "red" | "green" | "blue";
}) {
  const accents: Record<string, { bg: string; fg: string }> = {
    orange: { bg: "#f59e0b", fg: "#0b1220" },
    red: { bg: "#ef4444", fg: "#ffffff" },
    green: { bg: "#22c55e", fg: "#052e16" },
    blue: { bg: "#2563eb", fg: "#ffffff" },
  };

  const a = accents[accent];

  return (
    <div
      className="card border-0 h-100"
      style={{
        borderRadius: 16,
        background: a.bg,
        color: a.fg,
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <div className="card-body" style={{ padding: 16 }}>
        <div style={{ opacity: 0.95, fontWeight: 700, fontSize: 13 }}>
          {title}
        </div>
        <div style={{ fontWeight: 900, fontSize: 26, marginTop: 6 }}>
          {value}
        </div>
        <div style={{ opacity: 0.9, fontSize: 12, marginTop: 6 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function buildSmoothAreaPath(values: number[], width: number, height: number) {
  if (values.length < 2) return "";

  const padX = 24;
  const padY = 24;
  const max = Math.max(...values, 1);
  const stepX = (width - padX * 2) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - v / max) * (height - padY * 2);
    return { x, y };
  });

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    d += ` Q ${cx} ${prev.y}, ${curr.x} ${curr.y}`;
  }

  d += ` L ${points[points.length - 1].x} ${height - padY}`;
  d += ` L ${points[0].x} ${height - padY} Z`;

  return d;
}

export default function AccountsPage() {
  const router = useRouter();

  const [accessChecked, setAccessChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totals, setTotals] = useState<Totals | null>(null);

  // ✅ changed
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);

  const [renters, setRenters] = useState<RenterStat[]>([]);
  const [latestBookings, setLatestBookings] = useState<LatestBooking[]>([]);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return router.replace("/login");
        const { user } = await res.json();
        if (!(user.role === "super-admin" || user.role === "accounts-admin")) {
          return router.replace("/dashboard");
        }
        setAccessChecked(true);
      } catch {
        router.replace("/login");
      }
    };
    check();
  }, [router]);

  useEffect(() => {
    if (!accessChecked) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/dashboard/accounts/overview", {
          cache: "no-store",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "Failed to load accounts overview");
        }
        const data = await res.json();
        setTotals(data.totals);

        // ✅ changed
        setMonthlyStats(data.monthlyStats || []);

        setRenters(data.renters || []);
        setLatestBookings(data.latestBookings || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [accessChecked]);

  const chart = useMemo(() => {
    const values = monthlyStats.map((d) => d.amount);
    const max = Math.max(...values, 1);

    const w = Math.max(780, values.length * 80);
    const h = 180;

    const path = buildLinePath(values, w, h);

    return { values, max, w, h, path };
  }, [monthlyStats]);

  const donut = useMemo(() => {
    const total = totals?.totalRevenue || 0 || 0;
    const platform = totals?.totalPlatformFee || 0;
    const rentersShare = totals?.totalRenterShare || 0;

    const pPlatform = normalizePct(platform, total);
    const pRenter = normalizePct(rentersShare, total);

    return {
      total,
      platform,
      rentersShare,
      pPlatform,
      pRenter,
    };
  }, [totals]);

  const traffic = useMemo(() => {
    const list = [...renters]
      .sort((a, b) => b.renterRevenue - a.renterRevenue)
      .slice(0, 5);

    const totalRenter = totals?.totalRenterShare || 0 || 0;

    return list.map((r) => ({
      key: r.renterId,
      label: r.renterName,
      value: r.renterRevenue,
      pct: normalizePct(r.renterRevenue, totalRenter),
      sub: r.renterEmail,
      bookingsCount: r.bookingsCount, // ✅ FIX (was missing)
    }));
  }, [renters, totals]);

  if (!accessChecked) return <div className="p-3">Loading...</div>;
  if (loading && !totals) return <div className="p-3">Loading accounts...</div>;

  return (
    <div style={{ padding: "10px 4px" }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h2 className="mb-0" style={{ fontWeight: 900, color: "#0f172a" }}>
            Accounts
          </h2>
          <div className="text-muted" style={{ fontSize: 13 }}>
            Financial overview + renters split + monthly revenue chart
          </div>
        </div>

        <div className="text-muted" style={{ fontSize: 12 }}>
          {loading ? "Refreshing…" : "Up to date"}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      {/* TOP STAT CARDS */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-3">
          <StatCard
            title="Total Revenue"
            value={fmtMoney(totals?.totalRevenue, "USD")}
            subtitle="Money received (deposit + full)."
            accent="orange"
          />
        </div>
        <div className="col-12 col-md-3">
          <StatCard
            title="Platform (8%)"
            value={fmtMoney(totals?.totalPlatformFee, "USD")}
            subtitle="Your platform earnings."
            accent="red"
          />
        </div>
        <div className="col-12 col-md-3">
          <StatCard
            title="Renters (92%)"
            value={fmtMoney(totals?.totalRenterShare, "USD")}
            subtitle="Total renters share."
            accent="green"
          />
        </div>
        <div className="col-12 col-md-3">
          <StatCard
            title="Paid bookings"
            value={`${latestBookings.length}`}
            subtitle="Latest paid list count shown below."
            accent="blue"
          />
        </div>
      </div>

      {/* CHART ROW */}
      <div className="row g-3 mb-3">
        {/* Area chart */}
        <div className="col-12 col-lg-6">
          <CardShell title="Sales per month">
            <div
              style={{
                borderRadius: 16,
                background: "linear-gradient(135deg, #2563eb, #1e40af)",
                padding: 16,
                color: "white",
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div style={{ fontWeight: 900, fontSize: 14 }}>
                    Revenue per month
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    Starting from this month (Dec → next months)
                  </div>
                </div>

                <div style={{ fontWeight: 900 }}>
                  {fmtMoney(
                    monthlyStats.reduce((s, d) => s + d.amount, 0),
                    "USD"
                  )}
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <svg
                  width={Math.max(800, monthlyStats.length * 120)}
                  height={200}
                  viewBox={`0 0 ${Math.max(
                    800,
                    monthlyStats.length * 120
                  )} 200`}
                >
                  <defs>
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                    </linearGradient>
                  </defs>

                  <path
                    d={buildSmoothAreaPath(
                      monthlyStats.map((d) => d.amount),
                      Math.max(800, monthlyStats.length * 120),
                      200
                    )}
                    fill="url(#areaGradient)"
                  />

                  <path
                    d={buildSmoothAreaPath(
                      monthlyStats.map((d) => d.amount),
                      Math.max(800, monthlyStats.length * 120),
                      200
                    ).replace(/Z$/, "")}
                    fill="none"
                    stroke="white"
                    strokeWidth={3}
                  />

                  {monthlyStats.map((d, i) => {
                    const maxV = Math.max(
                      ...monthlyStats.map((x) => x.amount),
                      1
                    );
                    const padX = 24;
                    const padY = 24;
                    const width = Math.max(800, monthlyStats.length * 120);
                    const stepX =
                      (width - padX * 2) / Math.max(monthlyStats.length - 1, 1);

                    const x = padX + i * stepX;
                    const y = padY + (1 - d.amount / maxV) * (200 - padY * 2);

                    return (
                      <circle
                        key={d.month}
                        cx={x}
                        cy={y}
                        r={4}
                        fill="white"
                        opacity={0.95}
                      />
                    );
                  })}
                </svg>
              </div>

              <div
                className="d-flex justify-content-between mt-2"
                style={{ fontSize: 11, opacity: 0.85 }}
              >
                {monthlyStats.map((d, i) => (
                  <span
                    key={d.month}
                    style={{
                      minWidth: 50,
                      textAlign: "center",
                      opacity: i % 1 === 0 ? 1 : 0.25,
                    }}
                  >
                    {shortMonthLabel(d.month)}
                  </span>
                ))}
              </div>
            </div>
          </CardShell>
        </div>

        {/* Donut chart */}
        <div className="col-12 col-lg-3">
          <CardShell title="Total revenue split">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{ height: 230 }}
            >
              <svg width={180} height={180} viewBox="0 0 180 180">
                <circle
                  cx="90"
                  cy="90"
                  r="58"
                  fill="none"
                  stroke="rgba(15,23,42,0.08)"
                  strokeWidth="16"
                />

                {(() => {
                  const pct = clamp(donut.pPlatform, 0, 100);
                  const start = -Math.PI / 2;
                  const end = start + (pct / 100) * Math.PI * 2;
                  return (
                    <path
                      d={donutArc(90, 90, 58, start, end)}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                  );
                })()}

                {(() => {
                  const pctP = clamp(donut.pPlatform, 0, 100);
                  const start = -Math.PI / 2 + (pctP / 100) * Math.PI * 2;
                  const end =
                    -Math.PI / 2 +
                    ((pctP + clamp(donut.pRenter, 0, 100)) / 100) * Math.PI * 2;
                  return (
                    <path
                      d={donutArc(90, 90, 58, start, end)}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="16"
                      strokeLinecap="round"
                    />
                  );
                })()}

                <text
                  x="90"
                  y="86"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#334155"
                  style={{ fontWeight: 800 }}
                >
                  Total
                </text>
                <text
                  x="90"
                  y="108"
                  textAnchor="middle"
                  fontSize="16"
                  fill="#0f172a"
                  style={{ fontWeight: 900 }}
                >
                  {fmtMoney(donut.total, "USD")}
                </text>
              </svg>
            </div>

            <div
              className="d-flex justify-content-between"
              style={{ fontSize: 13 }}
            >
              <div className="d-flex align-items-center gap-2">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 99,
                    background: "#ef4444",
                    display: "inline-block",
                  }}
                />
                <span style={{ fontWeight: 700, color: "#334155" }}>
                  Platform
                </span>
              </div>
              <span style={{ fontWeight: 900 }}>
                {donut.pPlatform.toFixed(1)}%
              </span>
            </div>

            <div
              className="d-flex justify-content-between mt-2"
              style={{ fontSize: 13 }}
            >
              <div className="d-flex align-items-center gap-2">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 99,
                    background: "#22c55e",
                    display: "inline-block",
                  }}
                />
                <span style={{ fontWeight: 700, color: "#334155" }}>
                  Renters
                </span>
              </div>
              <span style={{ fontWeight: 900 }}>
                {donut.pRenter.toFixed(1)}%
              </span>
            </div>
          </CardShell>
        </div>

        {/* Traffic sources style */}
        <div className="col-12 col-lg-3">
          <CardShell title="Top renters (share of 92%)">
            {traffic.length === 0 ? (
              <div className="text-muted" style={{ fontSize: 13 }}>
                No paid bookings yet.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {traffic.map((t) => (
                  <div key={t.key}>
                    <div className="d-flex justify-content-between">
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#0f172a",
                          fontSize: 13,
                        }}
                      >
                        {t.label}
                      </div>
                      <div
                        style={{
                          fontWeight: 900,
                          color: "#0f172a",
                          fontSize: 13,
                        }}
                      >
                        {t.pct.toFixed(0)}%
                      </div>
                    </div>
                    {t.sub ? (
                      <div
                        className="text-muted"
                        style={{ fontSize: 11, marginTop: 2 }}
                      >
                        {t.sub}
                      </div>
                    ) : null}
                    <div
                      style={{
                        height: 8,
                        borderRadius: 99,
                        background: "rgba(15,23,42,0.08)",
                        overflow: "hidden",
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          width: `${clamp(t.pct, 0, 100)}%`,
                          height: "100%",
                          borderRadius: 99,
                          background:
                            "linear-gradient(90deg, #60a5fa, #2563eb)",
                        }}
                      />
                    </div>

                    <div
                      className="text-muted"
                      style={{ fontSize: 12, marginTop: 6 }}
                    >
                      {fmtMoney(t.value, "USD")} • {t.bookingsCount} bookings
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardShell>
        </div>
      </div>

      {/* TABLE */}
      <div className="row g-3">
        <div className="col-12">
          <CardShell title="Latest paid bookings">
            {latestBookings.length === 0 ? (
              <div className="text-muted" style={{ fontSize: 13 }}>
                No paid bookings yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr style={{ color: "#334155", fontSize: 13 }}>
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
                        <td style={{ whiteSpace: "nowrap" }}>
                          {new Date(b.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {b.dormTitle || "—"}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>
                            {b.renterName || "—"}
                          </div>
                          {b.renterEmail ? (
                            <div
                              className="text-muted"
                              style={{ fontSize: 12 }}
                            >
                              {b.renterEmail}
                            </div>
                          ) : null}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>
                            {b.clientName || "Unknown"}
                          </div>
                          {b.phone ? (
                            <div
                              className="text-muted"
                              style={{ fontSize: 12 }}
                            >
                              {b.phone}
                            </div>
                          ) : null}
                        </td>
                        <td className="text-capitalize">{b.paymentType}</td>
                        <td>{fmtMoney(b.paidAmount, b.currency)}</td>
                        <td>{fmtMoney(b.totalPrice, b.currency)}</td>
                        <td>{fmtMoney(b.platformFee, b.currency)}</td>
                        <td>{fmtMoney(b.renterShare, b.currency)}</td>
                        <td className="text-capitalize">{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardShell>
        </div>
      </div>
    </div>
  );
}
