"use client";

import Link from "next/link";

export default function PaymentCancelledPage() {
  return (
    <div className="main-layout">
      <div className="our_room">
        <div className="container">
          <h2>Payment cancelled</h2>
          <p>Your payment was cancelled. No booking has been created.</p>
          <Link href="/room" className="btn btn-secondary mt-3">
            Back to rooms
          </Link>
        </div>
      </div>
    </div>
  );
}
