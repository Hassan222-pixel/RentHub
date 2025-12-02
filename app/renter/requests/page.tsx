/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

interface RequestBooking {
  _id: string;
  dorm: {
    title: string;
    profileImg?: string;
    city?: string;
  };
  client: {
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  hasConflict?: boolean; // added by the API when another confirmed booking overlaps
}

export default function RenterRequestsPage() {
  const [requests, setRequests] = useState<RequestBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/renter/requests");
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to load requests");
      }
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      console.error("Error loading requests", err);
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleAction(
    id: string,
    action: "confirm" | "cancel" | "spam"
  ) {
    try {
      setActionLoadingId(id);
      setError(null);

      const res = await fetch("/api/renter/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, action }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to update booking");
      }

      // After success, reload the list so conflict flags are recalculated
      await loadRequests();
    } catch (err: any) {
      console.error("Error updating booking", err);
      setError(err.message || "Failed to update booking");
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div>
      <h2 className="mb-3">Requests</h2>

      {loading && <p>Loading requests...</p>}

      {error && !loading && (
        <p style={{ color: "red" }} className="mb-2">
          {error}
        </p>
      )}

      {!loading && requests.length === 0 && !error && (
        <p>
          No pending requests right now. When clients request to book your
          dorms, they’ll show here.
        </p>
      )}

      {!loading && requests.length > 0 && (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <thead>
              <tr>
                <th>Dorm</th>
                <th>Client</th>
                <th>Dates</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>
                    <strong>{r.dorm?.title}</strong>
                    {r.dorm?.city && (
                      <>
                        <br />
                        <small className="text-muted">{r.dorm.city}</small>
                      </>
                    )}
                  </td>
                  <td>
                    {r.client?.name}
                    <br />
                    <small className="text-muted">{r.client?.email}</small>
                  </td>
                  <td>
                    {new Date(r.startDate).toLocaleDateString()} –{" "}
                    {new Date(r.endDate).toLocaleDateString()}
                  </td>
                  <td>${r.totalPrice}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      {/* If this request conflicts with an already confirmed booking */}
                      {r.hasConflict ? (
                        <>
                          {/* Accept is visibly disabled when there is a conflict */}
                          <button
                            className="btn btn-sm btn-success"
                            disabled
                            title="This room is already confirmed for these dates"
                          >
                            Accept
                          </button>
                          {/* Button to mark the request as conflict/spam (cancels with specific reason) */}
                          <button
                            className="btn btn-sm btn-warning"
                            disabled={actionLoadingId === r._id}
                            onClick={() => handleAction(r._id, "spam")}
                          >
                            {actionLoadingId === r._id
                              ? "Saving..."
                              : "Mark as conflict"}
                          </button>
                        </>
                      ) : (
                        <>
                          {/* Normal Accept / Reject buttons when no conflict */}
                          <button
                            className="btn btn-sm btn-success"
                            disabled={actionLoadingId === r._id}
                            onClick={() => handleAction(r._id, "confirm")}
                          >
                            {actionLoadingId === r._id ? "Saving..." : "Accept"}
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            disabled={actionLoadingId === r._id}
                            onClick={() => handleAction(r._id, "cancel")}
                          >
                            {actionLoadingId === r._id ? "Saving..." : "Reject"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
