// app/client/register/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ClientRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/room";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/auth/register-client", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.message || "Registration failed");
      return;
    }

    // بعد التسجيل نوجّه المستخدم مباشرة
    router.push(next);
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
          Client Register
        </h2>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              type="text"
              value={name}
              style={{ height: "45px" }}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

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

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              className="form-control"
              type="password"
              value={confirm}
              style={{ height: "45px" }}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

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
            Register
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "14px",
          }}
        >
          Already have an account? <a href="/client/login">Login</a>
        </p>

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
