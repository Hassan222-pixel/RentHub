/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
 
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type DormType = {
  _id: string;
  title: string;
  pricePerNight?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  depositCurrency?: string;
};

type ApiBooking = {
  startDate: string;
  endDate: string;
};

type DateInterval = {
  start: Date;
  end: Date;
};

export default function RoomRequestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [dorm, setDorm] = useState<DormType | null>(null);
  const [loadingDorm, setLoadingDorm] = useState(true);

  // Booking form state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [days, setDays] = useState<number>(0);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);

  // Existing confirmed bookings for this dorm (for disabling dates)
  const [blockedIntervals, setBlockedIntervals] = useState<DateInterval[]>([]);

  const currency = dorm?.depositCurrency || "USD";

  // Helper: get "today" with time removed (start of day)
  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  // 🔐 Check auth: user must be client
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
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

  // 🔹 Load dorm info
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

  // 🔹 Load confirmed bookings for this dorm to disable those dates
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadBlockedDates() {
      try {
        const res = await fetch(`/api/bookings?dormId=${id}`);
        if (!res.ok) {
          console.error("Failed to load existing bookings for calendar");
          return;
        }

        const data = await res.json();
        const bookings: ApiBooking[] = data.bookings || [];

        if (cancelled) return;

        const intervals: DateInterval[] = bookings.map((b) => {
          const start = new Date(b.startDate);
          const end = new Date(b.endDate);

          // Normalize to start/end of day to make the interval clean
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          return { start, end };
        });

        setBlockedIntervals(intervals);
      } catch (err) {
        console.error("Error loading blocked dates:", err);
      }
    }

    loadBlockedDates();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // 🔹 Compute days and estimated price whenever dates or dorm change
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

    // Simple pricing logic: monthly > weekly > daily
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

  // 🔹 Submit booking request
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // ✅ Extra guard: if already submitting, ignore further clicks
    if (submitting) return;

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

    // Prevent selecting a start date in the past
    if (startDate < today) {
      setError("Start date cannot be in the past.");
      return;
    }

    if (endDate <= startDate) {
      setError("End date must be after start date.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dormId: id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message || "Failed to create booking request.";
        throw new Error(msg);
      }

      setSuccess("Booking request sent successfully! ✅");

      // ✅ After successful booking, redirect client to /room
      router.push("/room");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setSubmitting(false); // allow retry if there was an error
      return;
    }

    // Note: if we reached here (success + redirect),
    // the component will unmount because of navigation,
    // so we don't really need to reset submitting. But it's safe:
    setSubmitting(false);
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
                  {/* Start date picker */}
                  <div className="form-group mb-3">
                    <label htmlFor="startDate">Start Date</label>
                    <DatePicker
                      id="startDate"
                      selected={startDate}
                      onChange={(date) => {
                        setStartDate(date);
                        // Reset end date if it is before the new start date
                        if (date && endDate && endDate <= date) {
                          setEndDate(null);
                        }
                      }}
                      minDate={today}
                      excludeDateIntervals={blockedIntervals}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      dateFormat="yyyy-MM-dd"
                      className="form-control"
                      placeholderText="Select start date"
                      wrapperClassName="w-100"
                    />
                  </div>

                  {/* End date picker */}
                  <div className="form-group mb-3">
                    <label htmlFor="endDate">End Date</label>
                    <DatePicker
                      id="endDate"
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      minDate={startDate || today}
                      excludeDateIntervals={blockedIntervals}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      dateFormat="yyyy-MM-dd"
                      className="form-control"
                      placeholderText="Select end date"
                      wrapperClassName="w-100"
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
