"use client";
import Link from "next/link";

export default function TemplateHeader() {
  return (
    <header>
      <div className="header">
        <div className="container">
          <div className="row">

            {/* LOGO */}
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

            {/* NAVBAR */}
            <div className="col-xl-9 col-lg-9 col-md-9 col-sm-9">
              <nav className="navigation navbar navbar-expand-md navbar-dark">

                <button
                  className="navbar-toggler"
                  type="button"
                  data-toggle="collapse"
                  data-target="#navbarsExample04"
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse d-flex justify-content-between align-items-center"
                     id="navbarsExample04">

                  {/* LEFT NAV ITEMS */}
                  <ul className="navbar-nav mr-auto">
                    <li className="nav-item">
                      <Link className="nav-link" href="/">Home</Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" href="/about">About</Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" href="/room">Our Room</Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" href="/gallery">Gallery</Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" href="/blog">Blog</Link>
                    </li>

                    <li className="nav-item">
                      <Link className="nav-link" href="/contact">Contact Us</Link>
                    </li>
                  </ul>

                  {/* RIGHT SIDE BUTTONS */}
                  <div className="d-flex gap-2">

                    <Link href="/login" className="btn btn-danger header-btn">
                      Login
                    </Link>

                    <Link href="/register" className="btn btn-danger header-btn">
                      Register
                    </Link>

                  </div>

                </div>
              </nav>
            </div>

          </div>
        </div>
      </div>

      {/* Extra CSS for button matching "Book Now" style */}
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
