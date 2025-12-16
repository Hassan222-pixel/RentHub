/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
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

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${Math.round(value)} ${currency}`;
  }
}

export default function RoomRequestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  // ✅ Wizard step (UI only, functionality kept)
  const [step, setStep] = useState<1 | 2 | 3>(1);

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

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

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
        // silent
      }
    }

    loadBlockedDates();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Compute endDate + price + deposit preview (same logic)
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

  // ✅ Wizard navigation (no submit logic changes)
  const goNext = () => {
    setError(null);
    setSuccess(null);

    if (step === 1) {
      const fn = firstName.trim();
      const ln = lastName.trim();
      const ph = phone.trim();
      if (!fn || !ln || !ph) {
        setError(
          "Please fill in your first name, last name, and phone number."
        );
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!startDate) {
        setError("Please select a start date.");
        return;
      }
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
      if (estimatedPrice == null) {
        setError("Please select dates to calculate price.");
        return;
      }
      setStep(3);
    }
  };

  const goBack = () => {
    setError(null);
    setSuccess(null);
    setStep((s) => (s === 3 ? 2 : 1));
  };

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
      setError(err?.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="container py-4 rh-booking">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="card rh-card border-0">
              <div className="card-body">
                <div className="text-muted">Checking authentication...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stepTitle = step === 1 ? "Your info" : step === 2 ? "Dates" : "Payment";

  return (
    <div className="container py-4 rh-booking">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          {/* Header */}
          <div className="mb-3">
            <nav className="rh-breadcrumb mb-2">
              <Link href="/room" className="rh-breadcrumb-link">
                Rooms
              </Link>
              <span className="rh-breadcrumb-sep">/</span>
              <Link
                href={id ? `/room-details/${id}` : "/room"}
                className="rh-breadcrumb-link"
              >
                Details
              </Link>
              <span className="rh-breadcrumb-sep">/</span>
              <span className="rh-breadcrumb-current">Booking</span>
            </nav>

            <h2 className="rh-title mb-1">Booking & Payment</h2>
            {dorm?.title ? (
              <div className="rh-subtitle">
                {dorm.title}
                {dorm.pricePerMonth != null ? (
                  <span className="text-muted">
                    {" "}
                    • {formatMoney(dorm.pricePerMonth, currency)} / month (full
                    room)
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Stepper */}
          <div className="rh-stepper mb-3">
            {[
              { n: 1, t: "Your info" },
              { n: 2, t: "Dates" },
              { n: 3, t: "Payment" },
            ].map((s) => {
              const state =
                step === s.n ? "active" : step > s.n ? "done" : "todo";
              return (
                <div key={s.n} className={`rh-step-item ${state}`}>
                  <div className="rh-step-circle">{s.n}</div>
                  <div className="rh-step-label">{s.t}</div>
                </div>
              );
            })}
          </div>

          {/* Main card */}
          <div className="card rh-card border-0">
            <div className="card-body">
              {loadingDorm && (
                <div className="text-muted">Loading room info...</div>
              )}

              {!loadingDorm && !dorm && (
                <div className="alert alert-warning mb-0">Room not found.</div>
              )}

              {!loadingDorm && dorm && (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h4 className="mb-0">{stepTitle}</h4>

                    {/* Small summary pill */}
                    {estimatedPrice != null ? (
                      <span className="badge bg-light text-dark rh-pill">
                        Total: {formatMoney(estimatedPrice, currency)}
                      </span>
                    ) : (
                      <span className="badge bg-light text-dark rh-pill">
                        Pick dates to calculate
                      </span>
                    )}
                  </div>

                  {error && (
                    <div className="alert alert-warning" role="alert">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success" role="alert">
                      {success}
                    </div>
                  )}

                  {/* ✅ Keep functionality: same form submit, just content switches by step */}
                  <form onSubmit={handleSubmit}>
                    {/* Step 1 */}
                    {step === 1 && (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="firstName" className="form-label">
                            First Name
                          </label>
                          <input
                            id="firstName"
                            type="text"
                            className="form-control"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="e.g. Ahmed"
                          />
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="lastName" className="form-label">
                            Last Name
                          </label>
                          <input
                            id="lastName"
                            type="text"
                            className="form-control"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="e.g. Ali"
                          />
                        </div>

                        <div className="col-12">
                          <label htmlFor="phone" className="form-label">
                            Phone Number
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            className="form-control"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+20 10 1234 5678"
                          />
                          <div className="form-text">
                            Use a number you can receive calls/WhatsApp on.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="startDate" className="form-label">
                            Start Date
                          </label>
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
                          <div className="form-text">
                            You can start on any day.
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="months" className="form-label">
                            Duration (months)
                          </label>
                          <select
                            id="months"
                            className="form-select"
                            value={months}
                            onChange={(e) => setMonths(Number(e.target.value))}
                          >
                            <option value={1}>1 month</option>
                            <option value={2}>2 months</option>
                            <option value={3}>3 months</option>
                          </select>
                          <div className="form-text">Choose 1–3 months.</div>
                        </div>

                        <div className="col-12">
                          <div className="form-check rh-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="isOngoing"
                              checked={isOngoing}
                              onChange={(e) => setIsOngoing(e.target.checked)}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="isOngoing"
                            >
                              Ongoing booking (auto-renew style)
                            </label>
                          </div>
                        </div>

                        {endDatePreview && (
                          <div className="col-12">
                            <div className="rh-hint">
                              End date preview:{" "}
                              <strong>
                                {endDatePreview.toLocaleDateString()}
                              </strong>
                            </div>
                          </div>
                        )}

                        {estimatedPrice != null && (
                          <div className="col-12">
                            <div className="rh-hint">
                              Estimated price for you:{" "}
                              <strong>
                                {formatMoney(estimatedPrice, currency)}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">Payment option</label>

                          <div className="rh-choice">
                            <label
                              className={`rh-choice-row ${
                                paymentType === "full" ? "rh-choice-active" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentType"
                                value="full"
                                checked={paymentType === "full"}
                                onChange={() => setPaymentType("full")}
                              />
                              <div className="rh-choice-main">
                                <div className="rh-choice-title">
                                  Pay full amount now
                                </div>
                                <div className="rh-choice-sub text-muted">
                                  Fastest confirmation.
                                </div>
                              </div>
                              <div className="rh-choice-price">
                                {estimatedPrice != null
                                  ? formatMoney(estimatedPrice, currency)
                                  : "—"}
                              </div>
                            </label>

                            <label
                              className={`rh-choice-row ${
                                paymentType === "deposit"
                                  ? "rh-choice-active"
                                  : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentType"
                                value="deposit"
                                checked={paymentType === "deposit"}
                                onChange={() => setPaymentType("deposit")}
                              />
                              <div className="rh-choice-main">
                                <div className="rh-choice-title">
                                  Pay deposit now
                                </div>
                                <div className="rh-choice-sub text-muted">
                                  Pay the remaining later.
                                </div>
                              </div>
                              <div className="rh-choice-price">
                                {depositPreview != null
                                  ? formatMoney(depositPreview, currency)
                                  : estimatedPrice != null
                                  ? formatMoney(
                                      Math.round(estimatedPrice * 0.2),
                                      currency
                                    )
                                  : "—"}
                              </div>
                            </label>

                            {paymentType === "deposit" &&
                              remainingPreview != null &&
                              depositPreview != null && (
                                <div className="rh-hint">
                                  Remaining later:{" "}
                                  <strong>
                                    {formatMoney(remainingPreview, currency)}
                                  </strong>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer buttons */}
                    <div className="d-flex justify-content-between align-items-center mt-4 gap-2">
                      {step === 1 ? (
                        <Link
                          href={`/room-details/${id}`}
                          className="btn btn-outline-secondary rounded-pill"
                        >
                          ← Back to Room Details
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-pill"
                          onClick={goBack}
                        >
                          ← Back
                        </button>
                      )}

                      <div className="d-flex gap-2">
                        {step < 3 && (
                          <button
                            type="button"
                            className="btn btn-primary rounded-pill"
                            onClick={goNext}
                          >
                            Next →
                          </button>
                        )}

                        {/* ✅ Pay button ONLY in step 3 (same submit) */}
                        {step === 3 && (
                          <button
                            type="submit"
                            className="btn btn-primary rounded-pill"
                            disabled={submitting}
                          >
                            {submitting
                              ? "Redirecting to payment..."
                              : "Pay with card"}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Mobile back (optional already covered in step 1) */}
        </div>
      </div>
    </div>
  );
}
