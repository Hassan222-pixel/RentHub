"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import "./header.css";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function TemplateHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname(); // ✅ detect route change
  const router = useRouter();

  // ✅ Load / Refresh user whenever the route changes
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store", // ✅ VERY IMPORTANT: avoid cached auth state
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        console.error("Failed to load user", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [pathname]); // ✅ re-run on every navigation

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null); // instantly update header
      router.refresh(); // ✅ stay on same page, no redirect
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="logo">
          <span>RentHub</span>
        </div>

        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/about">About us</Link>
          <Link href="/room">Rooms</Link>
          <Link href="/news">News</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        {/* ✅ AUTH BUTTONS (REAL-TIME) */}
        {!loading && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {!user ? (
              <>
                <Link href="/client/login" className="call-btn">
                  Login
                </Link>

                <Link href="/client/register" className="call-btn">
                  Register
                </Link>
              </>
            ) : (
              <>
                <span style={{ color: "#fff", fontWeight: 600 }}>
                  Hello, {user.name}
                </span>

                <button
                  onClick={handleLogout}
                  className="call-btn"
                  style={{ cursor: "pointer", border: "none" }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
