// app/client/login/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ClientLoginPage() {
  const router = useRouter();

  // We read an optional "next" query parameter to know where to redirect after login
  // Example: /client/login?next=/room/request/123
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/room";

  // Local form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        // Include credentials to make sure cookies are sent/received correctly
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || "Login failed");
        return;
      }

      const data = await res.json();

      // Route based on the user role returned from the backend
      if (data.user.role === "client") {
        // Normal client → redirect to "next" or /room
        router.push(next);
      } else if (data.user.role === "super-admin") {
        router.push("/dashboard");
      } else if (data.user.role === "renter") {
        router.push("/renter");
      } else if (data.user.role === "managers-admin") {
        router.push("/dashboard/managers");
      } else if (data.user.role === "accounts-admin") {
        router.push("/dashboard/accounts");
      } else {
        setError("Unknown user role");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: 'url("/template/images/banner1.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255, 255, 255, 0.95)",
          padding: "35px",
          borderRadius: "12px",
          boxShadow: "0 0 25px rgba(0,0,0,0.2)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            fontWeight: 700,
            color: "#333",
          }}
        >
          Client Login
        </h2>

        {/* Error message if login fails */}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              className="form-control"
              type="email"
              value={email}
              style={{ height: "45px" }}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password field */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              className="form-control"
              type="password"
              value={password}
              style={{ height: "45px" }}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{
              marginTop: "10px",
              height: "45px",
              fontWeight: 600,
              borderRadius: "8px",
            }}
          >
            Login
          </button>
        </form>

        {/* Link to client registration page */}
        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "14px",
          }}
        >
          Don&apos;t have an account? <a href="/client/register">Register</a>
        </p>

        {/* Footer text */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          © {new Date().getFullYear()} RentHub
        </p>
      </div>
    </div>
  );
}
