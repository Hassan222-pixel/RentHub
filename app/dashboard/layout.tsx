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

  const [collapsed, setCollapsed] = useState(false); // sidebar collapsed (desktop)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // sidebar visible (mobile)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>("system");

  const router = useRouter();
  const pathname = usePathname();

  // Load user
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

  // Theme load
  useEffect(() => {
    const stored = (localStorage.getItem("renthub-theme") as ThemeOption) || "system";
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const applyTheme = (value: ThemeOption) => {
    if (value === "light") document.documentElement.setAttribute("data-theme", "light");
    else if (value === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
  };

  const changeTheme = (value: ThemeOption) => {
    setTheme(value);
    localStorage.setItem("renthub-theme", value);
    applyTheme(value);
    setThemeMenuOpen(false);
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

  const isActive = (t: string) => pathname?.startsWith(t);

  const avatarInitial = user.name?.[0]?.toUpperCase() || "S";

  // Close mobile sidebar whenever a nav link is clicked
  const handleNavClick = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="renthub-app d-flex flex-column">
      {/* Top bar */}
      <header className="renthub-topbar px-3 px-md-4">
        <div className="d-flex align-items-center gap-2">
          {/* Mobile burger button */}
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

          <button
            className="renthub-theme-btn"
            onClick={() => setThemeMenuOpen((o) => !o)}
          >
            {theme === "light" ? <FiSun /> : theme === "dark" ? <FiMoon /> : <FiMonitor />}
          </button>

          {themeMenuOpen && (
            <div className="renthub-theme-dropdown">
              <button onClick={() => changeTheme("system")}>System</button>
              <button onClick={() => changeTheme("light")}>Light</button>
              <button onClick={() => changeTheme("dark")}>Dark</button>
            </div>
          )}

          <span className="d-none d-md-inline">{user.email}</span>

          <div className="renthub-avatar-circle">{avatarInitial}</div>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <div className="renthub-main-shell d-flex flex-grow-1">
        {/* Sidebar */}
        <aside
          className={
            "renthub-sidebar d-flex flex-column" +
            (collapsed ? " renthub-sidebar-collapsed" : "") +
            (mobileSidebarOpen ? " renthub-sidebar-mobile-open" : "")
          }
        >
          {/* Floating toggle (desktop only, hidden on mobile via CSS) */}
          <button
            className="renthub-sidebar-toggle"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>

          <div className="renthub-sidebar-header">
            <div className="renthub-sidebar-avatar">{avatarInitial}</div>
            <div>
              <div className="renthub-sidebar-name">{user.name}</div>
              <div className="renthub-sidebar-role text-uppercase">{user.role}</div>
            </div>
          </div>

          <nav className="renthub-nav flex-grow-1 mt-3">
            <p className="renthub-nav-section-label">Navigation</p>

            <ul className="list-unstyled">

              {/* HOME */}
              <li>
                <Link
                  href="/dashboard"
                  className={
                    "renthub-nav-link" +
                    (isActive("/dashboard") ? " renthub-nav-link-active" : "")
                  }
                  onClick={handleNavClick}
                >
                  <FiHome /><span>Home</span>
                </Link>
              </li>

              {/* ACCOUNTS */}
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
                    <FiDollarSign /><span>Accounts</span>
                  </Link>
                </li>
              )}

              {/* MANAGERS */}
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
                    <FiUsers /><span>Managers</span>
                  </Link>
                </li>
              )}

              {/* ADMIN USERS */}
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
                    <FiUser /><span>Admin Users</span>
                  </Link>
                </li>
              )}

            </ul>
          </nav>

          {/* LOGOUT */}
          <div className="renthub-sidebar-footer">
            <button
              type="button"
              className="btn btn-sm btn-outline-light w-100 renthub-logout-btn"
              onClick={() => {
                handleLogout();
                setMobileSidebarOpen(false);
              }}
            >
              <FiLogOut className="renthub-logout-icon" size={16} />
              <span className="renthub-logout-label">Logout</span>
            </button>
          </div>

        </aside>

        {/* Backdrop for mobile sidebar */}
        {mobileSidebarOpen && (
          <div
            className="renthub-sidebar-backdrop d-md-none"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <main className="renthub-main">
          <div className="renthub-content-card">{children}</div>
        </main>
      </div>
    </div>
  );
}
