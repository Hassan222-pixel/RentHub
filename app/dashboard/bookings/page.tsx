/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";

type AdminAvailability = "available" | "not_available";
type BookingMode = "normal" | "ongoing";

type BookingDormRow = {
  dormId: string;
  title: string;
  city: string;
  roomType?: string | null;

  adminAvailability: AdminAvailability;

  bookingsCount: number;
  latestBookingMode?: BookingMode | null;
  latestBookingCreatedAt?: string | null;
};

type BookingDetail = {
  bookingId: string;
  clientFirstName: string;
  clientLastName: string;
  clientPhone: string;
  startDate: string;
  endDate: string;

  totalPrice: number;
  depositAmount: number;
  remainingAmount: number;
  paidAmount: number;

  paymentType: "deposit" | "full";
  paymentStatus: "unpaid" | "paid" | "refunded" | "failed";
  status: string;
  currency: string;
  createdAt?: string | null;
};

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtMoney(amount: number, currency: string) {
  const v = Number(amount || 0);
  return `${v.toLocaleString()} ${currency || "USD"}`;
}

export default function DashboardBookingsPage() {
  const [rows, setRows] = useState<BookingDormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [detailsMap, setDetailsMap] = useState<Record<string, BookingDetail[]>>(
    {}
  );
  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/dashboard/bookings", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to load booking dorms");
      }

      const data = await res.json();
      setRows(data.items || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateAvailability(dormId: string, value: AdminAvailability) {
    try {
      setSavingId(dormId);
      setError(null);

      const res = await fetch("/api/dashboard/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dormId, adminAvailability: value }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to update availability");
      }

      setRows((prev) =>
        prev.map((r) =>
          r.dormId === dormId ? { ...r, adminAvailability: value } : r
        )
      );
    } catch (e: any) {
      setError(e?.message || "Failed to update");
    } finally {
      setSavingId(null);
    }
  }

  async function toggleRow(dormId: string) {
    const isOpen = !!expanded[dormId];

    // close
    if (isOpen) {
      setExpanded((prev) => ({ ...prev, [dormId]: false }));
      return;
    }

    // open
    setExpanded((prev) => ({ ...prev, [dormId]: true }));

    // fetch details only if not cached
    if (detailsMap[dormId]) return;

    try {
      setDetailsLoadingId(dormId);

      const res = await fetch(`/api/dashboard/bookings?dormId=${dormId}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load dorm booking details");
      }

      setDetailsMap((prev) => ({ ...prev, [dormId]: data.bookings || [] }));
    } catch (e: any) {
      setError(e?.message || "Failed to load dorm details");
    } finally {
      setDetailsLoadingId(null);
    }
  }

  const badgeStyle = (value: AdminAvailability) => {
    const bg = value === "available" ? "#d1fae5" : "#fee2e2";
    const color = value === "available" ? "#065f46" : "#991b1b";
    return {
      background: bg,
      color,
      fontWeight: 700,
      borderRadius: 999,
      padding: "4px 10px",
      display: "inline-block",
      fontSize: 12,
    } as const;
  };

  const modeBadgeStyle = (value: BookingMode) => {
    const bg = value === "ongoing" ? "#dbeafe" : "#dcfce7";
    const color = value === "ongoing" ? "#1d4ed8" : "#166534";
    return {
      background: bg,
      color,
      fontWeight: 700,
      borderRadius: 999,
      padding: "4px 10px",
      display: "inline-block",
      fontSize: 12,
    } as const;
  };

  return (
    <div>
      <h2 className="mb-3">Booking Dorms</h2>
      <p className="text-muted">
        Click a row to expand and see booking details (clients, dates, payment).
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && rows.length === 0 && <p>No dorms with bookings yet.</p>}

      {!loading && rows.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Dorm</th>
                <th>City</th>
                <th>Type</th>
                <th>Bookings</th>
                <th>Latest Mode</th>
                <th>Availability</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const isOpen = !!expanded[r.dormId];
                const details = detailsMap[r.dormId] || [];
                const detailsLoading = detailsLoadingId === r.dormId;

                return (
                  <React.Fragment key={r.dormId}>
                    <tr
                      onClick={() => toggleRow(r.dormId)}
                      style={{ cursor: "pointer" }}
                      title="Click to expand/collapse"
                    >
                      <td>
                        <strong>{r.title}</strong>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {r.dormId}
                        </div>
                      </td>

                      <td>{r.city}</td>
                      <td>{r.roomType || "—"}</td>
                      <td>{r.bookingsCount}</td>

                      <td>
                        {r.latestBookingMode ? (
                          <span style={modeBadgeStyle(r.latestBookingMode)}>
                            {r.latestBookingMode}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* stopPropagation so selecting availability doesn't toggle row */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-2 align-items-center">
                          <span style={badgeStyle(r.adminAvailability)}>
                            {r.adminAvailability === "available"
                              ? "Available"
                              : "Not available"}
                          </span>

                          <select
                            className="form-select form-select-sm"
                            style={{ width: 170 }}
                            value={r.adminAvailability}
                            disabled={savingId === r.dormId}
                            onChange={(e) =>
                              updateAvailability(
                                r.dormId,
                                e.target.value as AdminAvailability
                              )
                            }
                          >
                            <option value="available">available</option>
                            <option value="not_available">not_available</option>
                          </select>

                          {savingId === r.dormId && (
                            <small className="text-muted">Saving...</small>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={6} style={{ background: "#f8fafc" }}>
                          {detailsLoading && (
                            <p className="m-2">Loading details...</p>
                          )}

                          {!detailsLoading && details.length === 0 && (
                            <p className="m-2 text-muted">
                              No booking details found.
                            </p>
                          )}

                          {!detailsLoading && details.length > 0 && (
                            <div className="table-responsive">
                              <table className="table table-bordered table-sm m-0">
                                <thead>
                                  <tr>
                                    <th>Client</th>
                                    <th>Phone</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Paid</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {details.map((b) => (
                                    <tr key={b.bookingId}>
                                      <td>
                                        <strong>
                                          {b.clientFirstName} {b.clientLastName}
                                        </strong>
                                      </td>
                                      <td>{b.clientPhone || "—"}</td>
                                      <td>{fmtDate(b.startDate)}</td>
                                      <td>{fmtDate(b.endDate)}</td>
                                      <td>
                                        {fmtMoney(b.paidAmount, b.currency)}
                                      </td>
                                      <td>
                                        {fmtMoney(b.totalPrice, b.currency)}
                                      </td>
                                      <td>{b.status}</td>
                                      <td>
                                        {b.paymentStatus} ({b.paymentType})
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
