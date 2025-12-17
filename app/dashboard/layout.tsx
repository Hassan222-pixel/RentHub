// app/dashboard/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import {
  FiHome,
  FiDollarSign,
  FiUsers,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
  FiMoon,
  FiSun,
  FiMonitor,
  FiLogOut,
  FiMenu,
  FiMapPin,
  FiClipboard,
  // ✅ NEW
  FiBell,
} from "react-icons/fi";

interface User {
  id: string;
  name: string;
  email: string;
  role: "super-admin" | "accounts-admin" | "managers-admin" | string;
}

type ThemeOption = "system" | "light" | "dark";

type AdminNotif = {
  _id: string;
  type: "add" | "edit" | "delete";
  message: string;
  createdAt: string;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>("system");

  // ✅ NEW: admin notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminNotifs, setAdminNotifs] = useState<AdminNotif[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored =
      (localStorage.getItem("renthub-theme") as ThemeOption) || "system";
    setTheme(stored);
    applyTheme(stored);
  }, []);

  // ✅ NEW: load admin notifications for super-admin only
  useEffect(() => {
    if (!user || user.role !== "super-admin") return;

    const load = async () => {
      try {
        const res = await fetch("/api/admin-notifications", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        setAdminNotifs(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };

    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [user]);

  const applyTheme = (value: ThemeOption) => {
    if (typeof document === "undefined") return;

    if (value === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else if (value === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const changeTheme = (value: ThemeOption) => {
    setTheme(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("renthub-theme", value);
    }
    applyTheme(value);
    setThemeMenuOpen(false);
  };

  // ✅ NEW: mark read + refresh
  const refreshAdminNotifs = async () => {
    if (!user || user.role !== "super-admin") return;
    try {
      const res = await fetch("/api/admin-notifications", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setAdminNotifs(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  };

  const markAdminRead = async (id?: string) => {
    try {
      await fetch("/api/admin-notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : {}),
      });
    } catch {}
    await refreshAdminNotifs();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return null;

  const isSuperAdmin = user.role === "super-admin";
  const isAccountsAdmin = user.role === "accounts-admin";
  const isManagersAdmin = user.role === "managers-admin";

  // ✅ Fix: Home active should be only exact "/dashboard"
  const isActive = (target: string) => {
    if (!pathname) return false;
    if (target === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(target);
  };

  const avatarInitial = user.name?.[0]?.toUpperCase() || "S";

  const handleNavClick = () => {
    setMobileSidebarOpen(false);
    setThemeMenuOpen(false);
    setNotifOpen(false); // ✅ NEW
  };

  const themeIcon =
    theme === "light" ? (
      <FiSun size={18} />
    ) : theme === "dark" ? (
      <FiMoon size={18} />
    ) : (
      <FiMonitor size={18} />
    );

  return (
    <div className="renthub-app d-flex flex-column">
      <header className="renthub-topbar px-3 px-md-4">
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="renthub-burger-btn d-inline d-md-none me-1"
            onClick={() => setMobileSidebarOpen((open) => !open)}
          >
            <FiMenu size={20} />
          </button>

          <Link href="/dashboard" className="renthub-brand-link">
            <div className="d-flex align-items-center gap-2">
              <div className="renthub-logo-mark">
                <FiHome className="renthub-logo-icon" size={18} />
              </div>
              <span className="fw-semibold text-white">RentHub</span>
            </div>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* ✅ Theme switcher */}
          <div className="renthub-theme-switcher">
            <button
              type="button"
              className="renthub-theme-btn"
              onClick={() => {
                setThemeMenuOpen((o) => !o);
                setNotifOpen(false); // ✅ NEW
              }}
            >
              {themeIcon}
            </button>

            {themeMenuOpen && (
              <div className="renthub-theme-dropdown">
                <button
                  type="button"
                  className={
                    "renthub-theme-item" +
                    (theme === "system" ? " renthub-theme-item-active" : "")
                  }
                  onClick={() => changeTheme("system")}
                >
                  <FiMonitor />
                  <span>System theme</span>
                </button>

                <button
                  type="button"
                  className={
                    "renthub-theme-item" +
                    (theme === "light" ? " renthub-theme-item-active" : "")
                  }
                  onClick={() => changeTheme("light")}
                >
                  <FiSun />
                  <span>Light theme</span>
                </button>

                <button
                  type="button"
                  className={
                    "renthub-theme-item" +
                    (theme === "dark" ? " renthub-theme-item-active" : "")
                  }
                  onClick={() => changeTheme("dark")}
                >
                  <FiMoon />
                  <span>Dark theme</span>
                </button>
              </div>
            )}
          </div>

          {/* ✅ NEW: Bell icon (super-admin only) */}
          {user.role === "super-admin" && (
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="renthub-theme-btn"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setThemeMenuOpen(false);
                }}
                style={{ position: "relative" }}
              >
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="renthub-notif-badge">{unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="renthub-notif-dropdown">
                  <div className="renthub-notif-head">
                    <span style={{ fontWeight: 800 }}>Notifications</span>
                    <button
                      type="button"
                      className="renthub-notif-clear"
                      onClick={() => markAdminRead()}
                    >
                      Mark all read
                    </button>
                  </div>

                  {adminNotifs.length === 0 ? (
                    <div className="renthub-notif-empty">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="renthub-notif-list">
                      {adminNotifs.map((n) => (
                        <button
                          key={n._id}
                          type="button"
                          className={
                            "renthub-notif-item " + `renthub-notif-${n.type}`
                          }
                          onClick={() => markAdminRead(n._id)}
                        >
                          <div className="renthub-notif-msg">{n.message}</div>
                          <div className="renthub-notif-date">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <span className="d-none d-md-inline">{user.email}</span>
          <div className="renthub-avatar-circle">{avatarInitial}</div>
        </div>
      </header>

      <div className="renthub-main-shell d-flex flex-grow-1">
        <aside
          className={
            "renthub-sidebar d-flex flex-column" +
            (collapsed ? " renthub-sidebar-collapsed" : "") +
            (mobileSidebarOpen ? " renthub-sidebar-mobile-open" : "")
          }
        >
          <button
            type="button"
            className="renthub-sidebar-toggle"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>

          <div className="renthub-sidebar-header">
            <div className="renthub-sidebar-avatar">{avatarInitial}</div>
            <div className="renthub-sidebar-user">
              <div className="renthub-sidebar-name">{user.name}</div>
              <div className="renthub-sidebar-role text-uppercase">
                {user.role}
              </div>
            </div>
          </div>

          <nav className="renthub-nav flex-grow-1 mt-3">
            <p className="renthub-nav-section-label">Navigation</p>

            <ul className="list-unstyled m-0">
              <li>
                <Link
                  href="/dashboard"
                  className={
                    "renthub-nav-link" +
                    (isActive("/dashboard") ? " renthub-nav-link-active" : "")
                  }
                  onClick={handleNavClick}
                >
                  <span className="renthub-nav-icon">
                    <FiHome size={18} />
                  </span>
                  <span className="renthub-nav-label">Home</span>
                </Link>
              </li>

              {(isSuperAdmin || isAccountsAdmin) && (
                <li>
                  <Link
                    href="/dashboard/accounts"
                    className={
                      "renthub-nav-link" +
                      (isActive("/dashboard/accounts")
                        ? " renthub-nav-link-active"
                        : "")
                    }
                    onClick={handleNavClick}
                  >
                    <span className="renthub-nav-icon">
                      <FiDollarSign size={18} />
                    </span>
                    <span className="renthub-nav-label">Accounts</span>
                  </Link>
                </li>
              )}

              {(isSuperAdmin || isManagersAdmin) && (
                <li>
                  <Link
                    href="/dashboard/managers"
                    className={
                      "renthub-nav-link" +
                      (isActive("/dashboard/managers")
                        ? " renthub-nav-link-active"
                        : "")
                    }
                    onClick={handleNavClick}
                  >
                    <span className="renthub-nav-icon">
                      <FiUsers size={18} />
                    </span>
                    <span className="renthub-nav-label">Managers</span>
                  </Link>
                </li>
              )}

              {isSuperAdmin && (
                <li>
                  <Link
                    href="/dashboard/admins"
                    className={
                      "renthub-nav-link" +
                      (isActive("/dashboard/admins")
                        ? " renthub-nav-link-active"
                        : "")
                    }
                    onClick={handleNavClick}
                  >
                    <span className="renthub-nav-icon">
                      <FiUser size={18} />
                    </span>
                    <span className="renthub-nav-label">Admin Users</span>
                  </Link>
                </li>
              )}

              {(isSuperAdmin || isAccountsAdmin || isManagersAdmin) && (
                <li>
                  <Link
                    href="/dashboard/universities"
                    className={
                      "renthub-nav-link" +
                      (isActive("/dashboard/universities")
                        ? " renthub-nav-link-active"
                        : "")
                    }
                    onClick={handleNavClick}
                  >
                    <span className="renthub-nav-icon">
                      <FiMapPin size={18} />
                    </span>
                    <span className="renthub-nav-label">Universities</span>
                  </Link>
                </li>
              )}

              {(isSuperAdmin || isAccountsAdmin || isManagersAdmin) && (
                <li>
                  <Link
                    href="/dashboard/bookings"
                    className={
                      "renthub-nav-link" +
                      (isActive("/dashboard/bookings")
                        ? " renthub-nav-link-active"
                        : "")
                    }
                    onClick={handleNavClick}
                  >
                    <span className="renthub-nav-icon">
                      <FiClipboard size={18} />
                    </span>
                    <span className="renthub-nav-label">Booking Dorms</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div className="renthub-sidebar-footer">
            <button
              type="button"
              className="btn btn-sm btn-outline-light w-100 renthub-logout-btn"
              onClick={() => {
                handleLogout();
                setMobileSidebarOpen(false);
                setNotifOpen(false);
                setThemeMenuOpen(false);
              }}
            >
              <FiLogOut className="renthub-logout-icon" size={16} />
              <span className="renthub-logout-label">Logout</span>
            </button>
          </div>
        </aside>

        {mobileSidebarOpen && (
          <div
            className="renthub-sidebar-backdrop d-md-none"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <main
          className="renthub-main"
          onClick={() => {
            setThemeMenuOpen(false);
            setNotifOpen(false);
          }}
        >
          <div className="renthub-content-card">{children}</div>
        </main>
      </div>
    </div>
  );
}
