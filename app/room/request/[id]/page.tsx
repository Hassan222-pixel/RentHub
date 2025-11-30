/* eslint-disable @typescript-eslint/no-explicit-any */
// app/room/request/[id]/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";

type DormType = {
  _id: string;
  title: string;
  pricePerNight?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  depositCurrency?: string;
};

export default function RoomRequestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [dorm, setDorm] = useState<DormType | null>(null);
  const [loadingDorm, setLoadingDorm] = useState(true);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [days, setDays] = useState<number>(0);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);

  const currency = dorm?.depositCurrency || "USD";

  // 🔐 Check auth: لازم يكون role = client
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          throw new Error("Not logged in");
        }
        const data = await res.json();
        if (!cancelled) {
          if (data.user.role !== "client") {
            throw new Error("Not a client");
          }
        }
      } catch (_err) {
        if (!cancelled && id) {
          const next = encodeURIComponent(`/room/request/${id}`);
          router.push(`/client/login?next=${next}`);
        }
      } finally {
        if (!cancelled) {
          setCheckingAuth(false);
        }
      }
    }

    if (id) {
      checkAuth();
    }

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  // 🔹 جلب معلومات الـ Dorm
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchDorm() {
      try {
        setLoadingDorm(true);
        setError(null);

        const res = await fetch(`/api/dorms/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load dorm");
        }

        const data = await res.json();
        if (!cancelled) {
          setDorm(data.dorm);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Could not load room info.");
        }
      } finally {
        if (!cancelled) {
          setLoadingDorm(false);
        }
      }
    }

    fetchDorm();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // 🔹 حساب الأيام والسعر التقريبي
  useEffect(() => {
    if (!startDate || !endDate) {
      setDays(0);
      setEstimatedPrice(null);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffMs = end.getTime() - start.getTime();
    const msPerDay = 1000 * 60 * 60 * 24;
    const d = Math.ceil(diffMs / msPerDay);

    if (isNaN(d) || d <= 0) {
      setDays(0);
      setEstimatedPrice(null);
      return;
    }

    setDays(d);

    if (!dorm) {
      setEstimatedPrice(null);
      return;
    }

    let total = 0;

    if (dorm.pricePerMonth && d >= 28) {
      const months = Math.ceil(d / 30);
      total = months * dorm.pricePerMonth;
    } else if (dorm.pricePerWeek && d >= 7) {
      const weeks = Math.ceil(d / 7);
      total = weeks * dorm.pricePerWeek;
    } else if (dorm.pricePerNight) {
      total = d * dorm.pricePerNight;
    } else {
      total = 0;
    }

    setEstimatedPrice(total);
  }, [startDate, endDate, dorm]);

  // 🔹 إرسال الطلب
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!id) {
      setError("Missing room id.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select start and end dates.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dormId: id,
          startDate,
          endDate,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message || "Failed to create booking request.";
        throw new Error(msg);
      }

      setSuccess("Booking request sent successfully! ✅");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="main-layout">
        <TemplateHeader />
        <div className="our_room">
          <div className="container">
            <p>Checking authentication...</p>
          </div>
        </div>
        <TemplateFooter />
      </div>
    );
  }

  return (
    <div className="main-layout">
      <TemplateHeader />

      {/* PAGE TITLE */}
      <div className="back_re">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2>Booking Request</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="our_room">
        <div className="container">
          {loadingDorm && (
            <div className="row mt-4">
              <div className="col-md-12">
                <p>Loading room info...</p>
              </div>
            </div>
          )}

          {!loadingDorm && dorm && (
            <div className="row mt-4">
              <div className="col-md-12">
                <h3>Request to Book: {dorm.title}</h3>
                <p>
                  Daily:{" "}
                  {dorm.pricePerNight != null
                    ? `${dorm.pricePerNight} ${currency}`
                    : "N/A"}{" "}
                  | Weekly:{" "}
                  {dorm.pricePerWeek != null
                    ? `${dorm.pricePerWeek} ${currency}`
                    : "N/A"}{" "}
                  | Monthly:{" "}
                  {dorm.pricePerMonth != null
                    ? `${dorm.pricePerMonth} ${currency}`
                    : "N/A"}
                </p>
              </div>
            </div>
          )}

          {!loadingDorm && (
            <div className="row mt-3">
              <div className="col-md-8">
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                      id="startDate"
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="endDate">End Date</label>
                    <input
                      id="endDate"
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  {days > 0 && (
                    <p>
                      Duration: <strong>{days}</strong> day(s)
                    </p>
                  )}

                  {estimatedPrice != null && estimatedPrice > 0 && (
                    <p>
                      Estimated Price:{" "}
                      <strong>
                        {estimatedPrice} {currency}
                      </strong>
                    </p>
                  )}

                  {error && (
                    <p style={{ color: "red" }} className="mt-2">
                      {error}
                    </p>
                  )}

                  {success && (
                    <p style={{ color: "green" }} className="mt-2">
                      {success}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary mt-3"
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Send Booking Request"}
                  </button>
                </form>

                <div className="mt-4">
                  <Link
                    href={`/room-details/${id}`}
                    className="btn btn-secondary"
                  >
                    ← Back to Room Details
                  </Link>
                </div>
              </div>
            </div>
          )}

          {!loadingDorm && !dorm && (
            <div className="row mt-4">
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
