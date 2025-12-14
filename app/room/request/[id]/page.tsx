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
  depositAmount?: number;
  roomType?: "private" | "double" | "shared";
  maxOccupants?: number;
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

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [months, setMonths] = useState<number>(1);
  const [endDatePreview, setEndDatePreview] = useState<Date | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const [paymentType, setPaymentType] = useState<"deposit" | "full">("full");
  const [depositPreview, setDepositPreview] = useState<number | null>(null);
  const [remainingPreview, setRemainingPreview] = useState<number | null>(null);

  const [isOngoing, setIsOngoing] = useState(false);

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);

  const [blockedIntervals, setBlockedIntervals] = useState<DateInterval[]>([]);

  const currency = dorm?.depositCurrency || "USD";

  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  // 🔐 Auth check: must be Client
  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Not logged in");
        const data = await res.json();
        if (!cancelled) {
          if (data.user.role !== "client") throw new Error("Not a client");
        }
      } catch (_err) {
        if (!cancelled && id) {
          const next = encodeURIComponent(`/room/request/${id}`);
          router.push(`/client/login?next=${next}`);
        }
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    }

    if (id) checkAuth();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  // Load dorm data
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchDorm() {
      try {
        setLoadingDorm(true);
        setError(null);

        const res = await fetch(`/api/dorms/${id}`);
        if (!res.ok) throw new Error("Failed to load dorm");

        const data = await res.json();
        if (!cancelled) {
          setDorm(data.dorm);
        }
      } catch (_err) {
        if (!cancelled) setError("Could not load room info.");
      } finally {
        if (!cancelled) setLoadingDorm(false);
      }
    }

    fetchDorm();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Load fully booked intervals for this dorm (for DatePicker disabling)
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadBlockedDates() {
      try {
        const res = await fetch(`/api/bookings?dormId=${id}`);
        if (!res.ok) return;

        const data = await res.json();
        const bookings: ApiBooking[] = data.bookings || [];

        if (cancelled) return;

        const intervals: DateInterval[] = bookings.map((b) => {
          const start = new Date(b.startDate);
          const end = new Date(b.endDate);

          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);

          return { start, end };
        });

        setBlockedIntervals(intervals);
      } catch (_err) {
        // no console.error to avoid dev overlay
      }
    }

    loadBlockedDates();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Compute endDate + price + deposit preview
  useEffect(() => {
    if (!startDate || !dorm || !dorm.pricePerMonth) {
      setEndDatePreview(null);
      setEstimatedPrice(null);
      setDepositPreview(null);
      setRemainingPreview(null);
      return;
    }

    const end = new Date(startDate);
    end.setMonth(end.getMonth() + months);
    setEndDatePreview(end);

    let capacity = 1;
    if (dorm.roomType === "double") capacity = 2;
    else if (dorm.roomType === "shared") {
      if (dorm.maxOccupants && dorm.maxOccupants > 0)
        capacity = dorm.maxOccupants;
    }

    const baseMonthly = dorm.pricePerMonth;
    const pricePerStudentPerMonth =
      capacity > 0 ? baseMonthly / capacity : baseMonthly;

    const total = pricePerStudentPerMonth * months;
    setEstimatedPrice(total);

    if (paymentType === "deposit") {
      let deposit = dorm.depositAmount ?? 50;
      if (deposit <= 0 || deposit >= total) {
        deposit = Math.round(total * 0.2);
      }
      setDepositPreview(deposit);
      setRemainingPreview(total - deposit);
    } else {
      setDepositPreview(null);
      setRemainingPreview(0);
    }
  }, [startDate, months, dorm, paymentType]);

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

    // normalize time to avoid timezone issues
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    if (start < today) {
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
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dormId: id,
          startDate: start.toISOString(),
          months,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          phone: trimmedPhone,
          paymentType,
          bookingMode: isOngoing ? "ongoing" : "normal",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // ✅ show message to the user, no throw, no console.error overlay
        const msg =
          data?.message ||
          "This room is not available for some dates in your selected period. Please choose another start date.";
        setError(msg);
        setSubmitting(false);
        return;
      }

      const url = data?.url as string | undefined;
      if (!url) {
        setError("No checkout URL returned from server.");
        setSubmitting(false);
        return;
      }

      window.location.href = url;
    } catch (err: any) {
      // avoid console.error in dev for expected UI flows
      setError(err?.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
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
      <div className="back_re">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2>Booking & Payment</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <h3>Book: {dorm.title}</h3>
                <p>
                  Monthly (full room):{" "}
                  {dorm.pricePerMonth != null
                    ? `${dorm.pricePerMonth} ${currency} / month`
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
                    <label htmlFor="firstName">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                    />
                  </div>

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
                    <small className="text-muted d-block mt-1">
                      You can start on any day.
                    </small>
                  </div>

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

                  <div className="form-group mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isOngoing"
                        checked={isOngoing}
                        onChange={(e) => setIsOngoing(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="isOngoing">
                        Ongoing booking
                      </label>
                    </div>
                  </div>

                  {estimatedPrice != null && (
                    <p>
                      Estimated price for you:{" "}
                      <strong>
                        {estimatedPrice} {currency}
                      </strong>
                    </p>
                  )}

                  <div className="form-group mb-3">
                    <label>Payment option</label>
                    <div className="d-flex flex-column">
                      <label className="mb-1">
                        <input
                          type="radio"
                          name="paymentType"
                          value="full"
                          checked={paymentType === "full"}
                          onChange={() => setPaymentType("full")}
                          className="me-2"
                        />
                        Pay full amount now{" "}
                        {estimatedPrice != null && (
                          <span className="ms-1">
                            ({estimatedPrice} {currency})
                          </span>
                        )}
                      </label>

                      <label>
                        <input
                          type="radio"
                          name="paymentType"
                          value="deposit"
                          checked={paymentType === "deposit"}
                          onChange={() => setPaymentType("deposit")}
                          className="me-2"
                        />
                        Pay deposit now{" "}
                        {depositPreview != null && remainingPreview != null && (
                          <span className="ms-1">
                            ({depositPreview} {currency} now, {remainingPreview}{" "}
                            {currency} later)
                          </span>
                        )}
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-warning mt-2" role="alert">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success mt-2" role="alert">
                      {success}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary mt-3"
                    disabled={submitting}
                  >
                    {submitting ? "Redirecting to payment..." : "Pay with card"}
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
