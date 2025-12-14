/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session_id.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const confirmPayment = async () => {
      try {
        const res = await fetch(
          `/api/payments/confirm?session_id=${encodeURIComponent(sessionId)}`,
          { method: "GET" }
        );

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const msg = data?.message || "Failed to confirm payment.";
          throw new Error(msg);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error(err);
          setError(err.message || "Payment confirmation failed.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    confirmPayment();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="main-layout">
        <div className="our_room">
          <div className="container">
            <p>Confirming your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-layout">
        <div className="our_room">
          <div className="container">
            <h2>Payment issue</h2>
            <p style={{ color: "red" }}>{error}</p>
            <Link href="/room" className="btn btn-secondary mt-3">
              Back to rooms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-layout">
      <div className="our_room">
        <div className="container">
          <h2>Payment successful 🎉</h2>
          <p>
            Your booking has been saved. Check your room details or bookings.
          </p>
          <div className="mt-3 d-flex gap-2">
            <Link href="/room" className="btn btn-primary">
              Back to rooms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
