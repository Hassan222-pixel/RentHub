// app/dashboard/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

// Icons
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
} from "react-icons/fi";

interface User {
  id: string;
  name: string;
  email: string;
  role: "super-admin" | "accounts-admin" | "managers-admin" | string;
}

type ThemeOption = "system" | "light" | "dark";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [collapsed, setCollapsed] = useState(false); // sidebar collapsed?
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>("system");

  const router = useRouter();
  const pathname = usePathname();

  // Auth check
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
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

  // Theme: load from localStorage / system
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
      document.documentElement.removeAttribute("data-theme"); // system
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

  if (loading) {
    return <div className="p-4 text-light">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const isSuperAdmin = user.role === "super-admin";
  const isAccountsAdmin = user.role === "accounts-admin";
  const isManagersAdmin = user.role === "managers-admin";

  const avatarInitial = (user.name && user.name[0]?.toUpperCase()) || "R";

  // theme icon for button
  const themeIcon =
    theme === "light" ? (
      <FiSun size={18} />
    ) : theme === "dark" ? (
      <FiMoon size={18} />
    ) : (
      <FiMonitor size={18} />
    );

  // Active link helper
  const isActive = (target: string) => {
    if (!pathname) return false;
    if (target === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(target);
  };

  return (
    <div className="renthub-app d-flex flex-column">
      {/* Top bar */}
      <header className="renthub-topbar px-4">
        <Link href="/dashboard" className="renthub-brand-link">
          <div className="d-flex align-items-center gap-2">
            <div className="renthub-logo-mark">
              <FiHome className="renthub-logo-icon" size={18} />
            </div>
            <span className="fw-semibold text-white">RentHub</span>
          
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
          {/* Floating toggle */}
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

          {/* Profile */}
          <div className="renthub-sidebar-header">
            <div className="renthub-sidebar-avatar">{avatarInitial}</div>
            <div className="renthub-sidebar-user">
              <div className="renthub-sidebar-name">{user.name}</div>
              <div className="renthub-sidebar-role text-uppercase">
                {user.role}
              </div>
            </div>
          </div>

          {/* Nav */}
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
                  >
                    <span className="renthub-nav-icon">
                      <FiUser size={18} />
                    </span>
                    <span className="renthub-nav-label">Admin Users</span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Logout */}
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

        {/* Content */}
        <main className="renthub-main">
          <div className="renthub-content-card">{children}</div>
        </main>
      </div>
    </div>
  );
}
