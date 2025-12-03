"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("super@admin.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" },
    });

 if (!res.ok) {
  const data = await res.json();
  setError(data.message || "Login failed");
  return;
}

const data = await res.json();

if (data.user.role === "super-admin") {
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
          Admin Login
        </h2>

        {error && (
          <div className="alert alert-danger text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
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

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          © {new Date().getFullYear()} RentHub Admin
        </p>
      </div>
    </div>
  );
}
