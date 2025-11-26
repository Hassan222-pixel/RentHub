"use client";

import Link from "next/link";

export default function ManagersHomePage() {
  return (
    <div className="p-4">
      <h2 className="h4 fw-bold">Managers Section</h2>
      <p className="text-muted">Manage all website editable sections here.</p>

      <div className="row g-3 mt-4">

        {/* HERO */}
        <div className="col-md-3">
          <Link href="/dashboard/managers/hero" className="text-decoration-none">
            <div className="card shadow-sm p-3">
              <h5>🖼 Hero</h5>
              <p>Edit homepage hero section</p>
            </div>
          </Link>
        </div>

        {/* ABOUT */}
        <div className="col-md-3">
          <Link href="/dashboard/managers/about">
            <div className="card shadow-sm p-3">
              <h5>📄 About</h5>
              <p>Edit About content</p>
            </div>
          </Link>
        </div>

        {/* NAVBAR */}
        <div className="col-md-3">
          <Link href="/dashboard/managers/navbar">
            <div className="card shadow-sm p-3">
              <h5>🧭 Navbar</h5>
              <p>Edit navigation labels</p>
            </div>
          </Link>
        </div>

        {/* ROOMS */}
        <div className="col-md-3">
          <Link href="/dashboard/managers/rooms">
            <div className="card shadow-sm p-3">
              <h5>🛏 Rooms</h5>
              <p>Edit rooms section</p>
            </div>
          </Link>
        </div>

        {/* GALLERY */}
        <div className="col-md-3">
          <Link href="/dashboard/managers/gallery">
            <div className="card shadow-sm p-3">
              <h5>🖼 Gallery</h5>
              <p>Edit gallery images</p>
            </div>
          </Link>
        </div>

        {/* BLOG */}
        <div className="col-md-3">
          <Link href="/dashboard/managers/blog">
            <div className="card shadow-sm p-3">
              <h5>📝 Blog</h5>
              <p>Edit blog posts</p>
            </div>
          </Link>
        </div>

        {/* CONTACT */}
        <div className="col-md-3">
          <Link href="/dashboard/managers/contact">
            <div className="card shadow-sm p-3">
              <h5>☎ Contact</h5>
              <p>Edit contact page</p>
            </div>
          </Link>
        </div>

        {/* FOOTER */}
        <div className="col-md-3">
          <Link href="/dashboard/managers/footer">
            <div className="card shadow-sm p-3">
              <h5>⬇ Footer</h5>
              <p>Edit footer content</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
