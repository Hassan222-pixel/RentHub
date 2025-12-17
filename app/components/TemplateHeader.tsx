"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import "./header.css";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type NotifItem = {
  id: string;
  type: "deposit_reminder" | "booking_cancelled" | "booking_conflict";
  title: string;
  body: string;
  dayKey: string;
  dormTitle: string;
  bookingId: string | null;
  readAt: string | null;
  createdAt: string | null;
};

export default function TemplateHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [notifLoading, setNotifLoading] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);
  const [items, setItems] = useState<NotifItem[]>([]);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
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
  }, [pathname]);

  async function loadNotifications() {
    if (!user || user.role !== "client") return;
    try {
      setNotifLoading(true);
      const res = await fetch("/api/bookings/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({ items: [], badgeCount: 0 }));
      setItems(Array.isArray(data.items) ? data.items : []);
      setBadgeCount(Number(data.badgeCount || 0));
    } catch {
      setItems([]);
      setBadgeCount(0);
    } finally {
      setNotifLoading(false);
    }
  }

  // refresh badge on route change
  useEffect(() => {
    if (user?.role === "client") loadNotifications();
    else {
      setItems([]);
      setBadgeCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, pathname]);

  async function markVisibleUnreadAsRead() {
    const unreadIds = items.filter((x) => !x.readAt).map((x) => x.id);
    if (unreadIds.length === 0) return;

    // optimistic UI
    setItems((prev) =>
      prev.map((x) =>
        unreadIds.includes(x.id)
          ? { ...x, readAt: new Date().toISOString() }
          : x
      )
    );
    setBadgeCount(0);

    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids: unreadIds }),
    }).catch(() => {});
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setNotifOpen(false);
      setProfileOpen(false);
      setItems([]);
      setBadgeCount(0);
      router.refresh();
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
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
                {/* Notifications (client only) */}
                {user.role === "client" && (
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      className="call-btn"
                      style={{
                        cursor: "pointer",
                        border: "none",
                        position: "relative",
                      }}
                      onClick={async () => {
                        const next = !notifOpen;
                        setNotifOpen(next);
                        setProfileOpen(false);
                        if (next) {
                          await loadNotifications();
                          await markVisibleUnreadAsRead();
                        }
                      }}
                    >
                      🔔
                      {badgeCount > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            background: "#ff3b30",
                            color: "white",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                            padding: "2px 6px",
                            lineHeight: 1.2,
                          }}
                        >
                          {badgeCount > 99 ? "99+" : badgeCount}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "calc(100% + 10px)",
                          width: 380,
                          background: "white",
                          borderRadius: 12,
                          boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                          overflow: "hidden",
                          zIndex: 9999,
                        }}
                      >
                        <div
                          style={{
                            padding: 12,
                            borderBottom: "1px solid #eee",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ fontWeight: 900, color: "#111" }}>
                            Notifications
                          </div>
                          <button
                            type="button"
                            onClick={() => setNotifOpen(false)}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              fontSize: 18,
                              fontWeight: 900,
                            }}
                            aria-label="Close"
                          >
                            ×
                          </button>
                        </div>

                        <div style={{ maxHeight: 340, overflowY: "auto" }}>
                          {notifLoading ? (
                            <div style={{ padding: 12, color: "#666" }}>
                              Loading...
                            </div>
                          ) : items.length === 0 ? (
                            <div style={{ padding: 12, color: "#666" }}>
                              There is no notification for you yet.
                            </div>
                          ) : (
                            <div
                              style={{
                                padding: 12,
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                              }}
                            >
                              {items.map((n) => (
                                <div
                                  key={n.id}
                                  style={{
                                    borderRadius: 10,
                                    border: "1px solid #eee",
                                    padding: 10,
                                    background:
                                      n.type === "deposit_reminder"
                                        ? "#fff7ed"
                                        : n.type === "booking_cancelled"
                                        ? "#ffecec"
                                        : "#eef2ff",
                                  }}
                                >
                                  <div
                                    style={{ fontWeight: 900, color: "#111" }}
                                  >
                                    {n.title}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 13,
                                      color: "#333",
                                      marginTop: 4,
                                    }}
                                  >
                                    {n.body}
                                  </div>
                                  {n.bookingId && (
                                    <div style={{ marginTop: 8 }}>
                                      <Link
                                        href="/client/profile"
                                        className="btn btn-sm btn-primary"
                                        style={{ textDecoration: "none" }}
                                        onClick={() => setNotifOpen(false)}
                                      >
                                        Open My Profile
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Profile dropdown */}
                <div style={{ position: "relative" }}>
                  <button
                    type="button"
                    className="call-btn"
                    style={{ cursor: "pointer", border: "none" }}
                    onClick={() => {
                      setProfileOpen((v) => !v);
                      setNotifOpen(false);
                    }}
                  >
                    Hello, {user.name} ▾
                  </button>

                  {profileOpen && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 10px)",
                        width: 220,
                        background: "white",
                        borderRadius: 12,
                        boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                        overflow: "hidden",
                        zIndex: 9999,
                      }}
                    >
                      <Link
                        href="/client/profile"
                        style={{
                          display: "block",
                          padding: "10px 12px",
                          textDecoration: "none",
                          color: "#111",
                          fontWeight: 700,
                        }}
                        onClick={() => setProfileOpen(false)}
                      >
                        My profile
                      </Link>

                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          border: "none",
                          background: "white",
                          cursor: "pointer",
                          color: "#b00020",
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
