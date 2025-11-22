// app/renter/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  FiHome,
  FiBookOpen,
  FiFileText,
  FiMessageSquare,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiMoon,
  FiSun,
  FiMonitor,
  FiLogOut,
} from "react-icons/fi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type ThemeOption = "system" | "light" | "dark";

export default function RenterLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>("system");

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        if (data.user.role !== "renter") {
          // if logged-in but not renter, send to admin dashboard
          router.replace("/dashboard");
          return;
        }
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching current user:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored =
      (localStorage.getItem("renthub-theme") as ThemeOption) || "system";
    setTheme(stored);
    applyTheme(stored);
  }, []);

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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  if (loading) return <div className="p-4 text-light">Loading...</div>;
  if (!user) return null;

  const avatarInitial = user.name?.[0]?.toUpperCase() || "R";

  const isActive = (target: string) => {
    if (!pathname) return false;
    if (target === "/renter") {
      return pathname === "/renter";
    }
    return pathname.startsWith(target);
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
      {/* Top bar */}
      <header className="renthub-topbar px-4">
        <Link href="/renter" className="renthub-brand-link">
          <div className="d-flex align-items-center gap-2">
            <div className="renthub-logo-mark">
              <FiHome className="renthub-logo-icon" size={18} />
            </div>
            <span className="fw-semibold text-white">RentHub</span>
            <span className="renthub-topbar-subtitle d-none d-sm-inline">
              Renter Dashboard
            </span>
          </div>
        </Link>

        <div className="d-flex align-items-center gap-3">
          {/* Theme switcher */}
          <div className="renthub-theme-switcher">
            <button
              type="button"
              className="renthub-theme-btn"
              onClick={() => setThemeMenuOpen((o) => !o)}
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

          <span className="renthub-topbar-email d-none d-md-inline">
            {user.email}
          </span>
          <div className="renthub-avatar-circle">{avatarInitial}</div>
        </div>
      </header>

      {/* Main area */}
      <div className="renthub-main-shell d-flex flex-grow-1">
        {/* Sidebar */}
        <aside
          className={
            "renthub-sidebar d-flex flex-column" +
            (collapsed ? " renthub-sidebar-collapsed" : "")
          }
        >
          <button
            type="button"
            className="renthub-sidebar-toggle"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <FiChevronRight size={16} />
            ) : (
              <FiChevronLeft size={16} />
            )}
          </button>

          <div className="renthub-sidebar-header">
            <div className="renthub-sidebar-avatar">{avatarInitial}</div>
            <div className="renthub-sidebar-user">
              <div className="renthub-sidebar-name">{user.name}</div>
              <div className="renthub-sidebar-role text-uppercase">Renter</div>
            </div>
          </div>

          <nav className="renthub-nav flex-grow-1 mt-3">
            <p className="renthub-nav-section-label">Renter</p>
            <ul className="list-unstyled m-0">
              <li>
                <Link
                  href="/renter"
                  className={
                    "renthub-nav-link" +
                    (isActive("/renter") ? " renthub-nav-link-active" : "")
                  }
                >
                  <span className="renthub-nav-icon">
                    <FiHome size={18} />
                  </span>
                  <span className="renthub-nav-label">Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/renter/listings"
                  className={
                    "renthub-nav-link" +
                    (isActive("/renter/listings")
                      ? " renthub-nav-link-active"
                      : "")
                  }
                >
                  <span className="renthub-nav-icon">
                    <FiBookOpen size={18} />
                  </span>
                  <span className="renthub-nav-label">Listings</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/renter/bookings"
                  className={
                    "renthub-nav-link" +
                    (isActive("/renter/bookings")
                      ? " renthub-nav-link-active"
                      : "")
                  }
                >
                  <span className="renthub-nav-icon">
                    <FiFileText size={18} />
                  </span>
                  <span className="renthub-nav-label">Bookings</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/renter/requests"
                  className={
                    "renthub-nav-link" +
                    (isActive("/renter/requests")
                      ? " renthub-nav-link-active"
                      : "")
                  }
                >
                  <span className="renthub-nav-icon">
                    <FiFileText size={18} />
                  </span>
                  <span className="renthub-nav-label">Requests</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/renter/messages"
                  className={
                    "renthub-nav-link" +
                    (isActive("/renter/messages")
                      ? " renthub-nav-link-active"
                      : "")
                  }
                >
                  <span className="renthub-nav-icon">
                    <FiMessageSquare size={18} />
                  </span>
                  <span className="renthub-nav-label">Messages</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/renter/analytics"
                  className={
                    "renthub-nav-link" +
                    (isActive("/renter/analytics")
                      ? " renthub-nav-link-active"
                      : "")
                  }
                >
                  <span className="renthub-nav-icon">
                    <FiBarChart2 size={18} />
                  </span>
                  <span className="renthub-nav-label">Analytics</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="renthub-sidebar-footer">
            <button
              type="button"
              className="btn btn-sm btn-outline-light w-100 renthub-logout-btn"
              onClick={handleLogout}
            >
              <FiLogOut className="renthub-logout-icon" size={16} />
              <span className="renthub-logout-label">Logout</span>
            </button>
          </div>
        </aside>

        <main className="renthub-main">
          <div className="renthub-content-card">{children}</div>
        </main>
      </div>
    </div>
  );
}
