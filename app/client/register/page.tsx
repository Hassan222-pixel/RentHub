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
          background: "rgba(255,255,255,0.95)",
          padding: "35px",
          borderRadius: "12px",
          boxShadow: "0 0 25px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Client Register
        </h2>

        {error && <div style={{ color: "red", textAlign: "center" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input className="form-control mb-2" placeholder="Full Name" required
            value={name} onChange={(e) => setName(e.target.value)} />

          <input className="form-control mb-2" placeholder="Email" type="email" required
            value={email} onChange={(e) => setEmail(e.target.value)} />

          <input className="form-control mb-2" placeholder="Password" type="password" required
            value={password} onChange={(e) => setPassword(e.target.value)} />

          <input className="form-control mb-3" placeholder="Confirm Password" type="password" required
            value={confirm} onChange={(e) => setConfirm(e.target.value)} />

          <button className="btn btn-primary w-100 mb-3">Register</button>
        </form>

        {/* SOCIAL LOGIN */}
        <div style={{ textAlign: "center", marginBottom: 15 }}>
          <div style={{ marginBottom: 10, color: "#777" }}>OR</div>

          <button className="btn w-100 mb-2"
            style={{ border: "1px solid #ddd" }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg"
              width={18} style={{ marginRight: 8 }} />
            Continue with Google
          </button>

          <button className="btn w-100"
            style={{ border: "1px solid #0A66C2", color: "#0A66C2" }}>
            <img src="https://www.svgrepo.com/show/448234/linkedin.svg"
              width={18} style={{ marginRight: 8 }} />
            Continue with LinkedIn
          </button>
        </div>

        <p style={{ textAlign: "center" }}>
          Already have an account? <a href="/client/login">Login</a>
        </p>
      </div>
    </div>
  );
}
