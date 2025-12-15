"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import "./header.css";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type NotificationItem = {
  id: string;
  dormTitle: string;
  startDate: string;
  endDate: string;
};

function initials(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (
    parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)
  ).toUpperCase();
}

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${s.toLocaleDateString(undefined, opts)} → ${e.toLocaleDateString(
    undefined,
    opts
  )}`;
}

export default function TemplateHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const notifRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);

  // ✅ Load / Refresh user whenever the route changes
  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          if (!cancelled) setUser(null);
          return;
        }

        const data = await res.json();
        if (!cancelled) setUser(data.user || null);
      } catch (err) {
        console.error("Failed to load user", err);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // ✅ Close dropdowns on outside click / ESC
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;

      if (notifRef.current && !notifRef.current.contains(t)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(t)) {
        setUserMenuOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const notifCount = useMemo(() => notifications.length, [notifications]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setNotifLoading(true);

      const res = await fetch("/api/bookings/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        setNotifications([]);
        return;
      }

      const data = await res.json();
      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : []
      );
    } catch (err) {
      console.error("Failed to load notifications", err);
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const toggleNotifications = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    setUserMenuOpen(false);

    if (next) {
      await loadNotifications();
    }
  };

  const toggleUserMenu = () => {
    setUserMenuOpen((v) => !v);
    setNotifOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setNotifications([]);
      setNotifOpen(false);
      setUserMenuOpen(false);

      router.refresh(); // stay same page, header updates
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

        {!loading && (
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
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
                {/* ✅ Notifications */}
                <div ref={notifRef} style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={toggleNotifications}
                    aria-label="Notifications"
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      position: "relative",
                      padding: 6,
                      borderRadius: 10,
                    }}
                  >
                    <span
                      style={{ fontSize: 18, color: "#fff" }}
                      aria-hidden="true"
                    >
                      🔔
                    </span>

                    {notifCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          minWidth: 16,
                          height: 16,
                          padding: "0 5px",
                          borderRadius: 999,
                          background: "#ef4444",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
                      >
                        {notifCount > 99 ? "99+" : notifCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 10px)",
                        width: 340,
                        background: "#ffffff",
                        borderRadius: 12,
                        boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
                        overflow: "hidden",
                        zIndex: 1000,
                      }}
                    >
                      <div
                        style={{
                          padding: "10px 12px",
                          borderBottom: "1px solid rgba(15,23,42,0.08)",
                          fontWeight: 900,
                          color: "#0f172a",
                        }}
                      >
                        Notifications
                      </div>

                      <div style={{ maxHeight: 320, overflowY: "auto" }}>
                        {notifLoading ? (
                          <div
                            style={{
                              padding: 12,
                              color: "#64748b",
                              fontSize: 13,
                            }}
                          >
                            Loading...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div
                            style={{
                              padding: 12,
                              color: "#64748b",
                              fontSize: 13,
                            }}
                          >
                            There is no notification for you yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              style={{
                                padding: 12,
                                borderBottom: "1px solid rgba(15,23,42,0.06)",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 800,
                                  color: "#0f172a",
                                  fontSize: 13,
                                }}
                              >
                                {n.dormTitle}
                              </div>
                              <div
                                style={{
                                  color: "#64748b",
                                  fontSize: 12,
                                  marginTop: 4,
                                }}
                              >
                                {formatRange(n.startDate, n.endDate)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ✅ User dropdown (avatar + name) */}
                <div ref={userRef} style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={toggleUserMenu}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      padding: "6px 8px",
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.18)",
                        border: "1px solid rgba(255,255,255,0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: 12,
                      }}
                      aria-hidden="true"
                    >
                      {initials(user.name)}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 13,
                          lineHeight: 1.1,
                        }}
                      >
                        {user.name}
                      </span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.85)",
                          fontSize: 11,
                          lineHeight: 1.1,
                        }}
                      >
                        Hello
                      </span>
                    </div>

                    <span
                      style={{ color: "#fff", opacity: 0.9, fontSize: 12 }}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 10px)",
                        width: 220,
                        background: "#ffffff",
                        borderRadius: 12,
                        boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
                        overflow: "hidden",
                        zIndex: 1000,
                      }}
                    >
                      <Link
                        href="/client/profile"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: "block",
                          padding: "10px 12px",
                          color: "#0f172a",
                          textDecoration: "none",
                          fontWeight: 700,
                          borderBottom: "1px solid rgba(15,23,42,0.06)",
                        }}
                      >
                        My Profile
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "#ef4444",
                          fontWeight: 800,
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
