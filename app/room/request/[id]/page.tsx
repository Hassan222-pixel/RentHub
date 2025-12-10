/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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

  // Booking form state (MONTHLY ONLY)
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [months, setMonths] = useState<number>(1); // 1–3 months
  const [endDatePreview, setEndDatePreview] = useState<Date | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  // Client info
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

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

  // 🔹 Compute endDate preview + estimated monthly price
  useEffect(() => {
    if (!startDate || !dorm || !dorm.pricePerMonth) {
      setEndDatePreview(null);
      setEstimatedPrice(null);
      return;
    }

    // Compute end date = start date + months
    const end = new Date(startDate);
    end.setMonth(end.getMonth() + months);
    setEndDatePreview(end);

    // Monthly pricing only
    const total = dorm.pricePerMonth * months;
    setEstimatedPrice(total);
  }, [startDate, months, dorm]);

  // 🔹 Submit booking request (MONTHLY)
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (submitting) return;

    setError(null);
    setSuccess(null);

    if (!id) {
      setError("Missing room id.");
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedPhone) {
      setError("Please fill in your first name, last name, and phone number.");
      return;
    }

    if (!startDate) {
      setError("Please select a start date.");
      return;
    }

    if (startDate < today) {
      setError("Start date cannot be in the past.");
      return;
    }

    if (months < 1 || months > 3) {
      setError("Please select between 1 and 3 months.");
      return;
    }

    if (!dorm?.pricePerMonth) {
      setError("Monthly price is not available for this dorm.");
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
          months,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          phone: trimmedPhone,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message || "Failed to create booking request.";
        throw new Error(msg);
      }

      setSuccess("Booking request sent successfully! ✅");
      router.push("/room");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  }

  if (checkingAuth) {
    return (
      <div className="main-layout">
        <div className="our_room">
          <div className="container">
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
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
                  Monthly:{" "}
                  {dorm.pricePerMonth != null
                    ? `${dorm.pricePerMonth} ${currency} / month`
                    : "N/A"}
                  {"  "}
                  {dorm.pricePerNight != null && (
                    <>
                      <br />
                      <small className="text-muted">
                        Daily: {dorm.pricePerNight} {currency}
                      </small>
                    </>
                  )}
                  {dorm.pricePerWeek != null && (
                    <>
                      <br />
                      <small className="text-muted">
                        Weekly: {dorm.pricePerWeek} {currency}
                      </small>
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {!loadingDorm && (
            <div className="row mt-3">
              <div className="col-md-8">
                <form onSubmit={handleSubmit}>
                  {/* Client info */}
                  <div className="form-group mb-3">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      className="form-control"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Start date picker (single date) */}
                  <div className="form-group mb-3">
                    <label htmlFor="startDate">Start Date</label>
                    <DatePicker
                      id="startDate"
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      minDate={today}
                      excludeDateIntervals={blockedIntervals}
                      selectsStart
                      startDate={startDate}
                      dateFormat="yyyy-MM-dd"
                      className="form-control"
                      placeholderText="Select start date"
                      wrapperClassName="w-100"
                    />
                  </div>

                  {/* Months dropdown */}
                  <div className="form-group mb-3">
                    <label htmlFor="months">Duration (months)</label>
                    <select
                      id="months"
                      className="form-control"
                      value={months}
                      onChange={(e) => setMonths(Number(e.target.value))}
                    >
                      <option value={1}>1 month</option>
                      <option value={2}>2 months</option>
                      <option value={3}>3 months</option>
                    </select>
                  </div>

                  {/* Preview of end date + price */}
                  {startDate && endDatePreview && (
                    <p>
                      Duration:{" "}
                      <strong>
                        {months} month{months > 1 ? "s" : ""}
                      </strong>{" "}
                      <br />
                      From{" "}
                      <strong>
                        {startDate.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </strong>{" "}
                      to{" "}
                      <strong>
                        {endDatePreview.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </strong>
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
    </div>
  );
}
