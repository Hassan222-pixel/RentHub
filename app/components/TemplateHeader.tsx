/* eslint-disable @next/next/no-img-element */
// app/components/TemplateHeader.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Shape of the user object returned from /api/auth/me
interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
}

export default function TemplateHeader() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // Fetch current user from /api/auth/me
  // This will check if the JWT cookie ("token") exists and is valid
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Include cookies on the request
        });

        if (!res.ok) {
          // If not ok, we assume user is not authenticated
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch /api/auth/me:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Run on first render and whenever the path changes
    // This helps keep the header in sync after login/logout/navigation
    fetchUser();
  }, [pathname]);

  // Logout function: calls /api/auth/logout to clear the JWT cookie
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear local user state so the header updates immediately
      setUser(null);

      // Redirect to home page after logout (you can change this if you want)
      router.push("/");
      // Optional: force refresh if you rely on server-side data
      // router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header>
      <div className="header">
        <div className="container">
          <div className="row">
            {/* LOGO SECTION */}
            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 logo_section">
              <div className="full">
                <div className="center-desk">
                  <div className="logo">
                    <Link href="/">
                      <img src="/template/images/logo.png" alt="Logo" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* NAVBAR SECTION */}
            <div className="col-xl-9 col-lg-9 col-md-9 col-sm-9">
              <nav className="navigation navbar navbar-expand-md navbar-dark">
                {/* Mobile hamburger button */}
                <button
                  className="navbar-toggler"
                  type="button"
                  data-toggle="collapse"
                  data-target="#navbarsExample04"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div
                  className="collapse navbar-collapse d-flex justify-content-between align-items-center"
                  id="navbarsExample04"
                >
                  {/* LEFT NAV ITEMS */}
                  <ul className="navbar-nav mr-auto">
                    <li className="nav-item">
                      <Link className="nav-link" href="/">
                        Home
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" href="/about">
                        About
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" href="/room">
                        Our Room
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" href="/gallery">
                        Gallery
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" href="/blog">
                        Blog
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" href="/contact">
                        Contact Us
                      </Link>
                    </li>
                  </ul>

                  {/* RIGHT SIDE: AUTH AREA (Login/Register or Username + Logout) */}
                  <div className="d-flex gap-2 align-items-center">
                    {/* While loading user state, we can show nothing or a small placeholder */}
                    {loading ? null : (
                      <>
                        {/* If user is NOT logged in → show Login + Register buttons */}
                        {!user && (
                          <>
                            {/* IMPORTANT: use /client/login and /client/register for client auth */}
                            <Link
                              href="/client/login"
                              className="btn btn-danger header-btn"
                            >
                              Login
                            </Link>

                            <Link
                              href="/client/register"
                              className="btn btn-danger header-btn"
                            >
                              Register
                            </Link>
                          </>
                        )}

                        {/* If user IS logged in → show username + Logout button */}
                        {user && (
                          <>
                            {/* Display a friendly greeting with the username */}
                            <span
                              style={{ color: "#fff", marginRight: "10px" }}
                            >
                              Hello, <strong>{user.name}</strong>
                            </span>

                            <button
                              type="button"
                              onClick={handleLogout}
                              className="btn btn-danger header-btn"
                            >
                              Logout
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Extra CSS to make header buttons match the template "Book Now" style */}
      <style jsx>{`
        .header-btn {
          background: #ff0000;
          color: #fff !important;
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 14px;
          display: inline-block;
          transition: 0.3s;
        }

        .header-btn:hover {
          opacity: 0.8;
          color: #fff !important;
        }
      `}</style>
    </header>
  );
}
