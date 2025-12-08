"use client";

import Link from "next/link";
import "./header.css";

export default function TemplateHeader() {
  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="logo">
          <span>bluesky</span>
        </div>

        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/about">About us</Link>
          <Link href="/properties">Properties</Link>
          <Link href="/news">News</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <a href="tel:6523453222" className="call-btn">
          📞 652-345-3222
        </a>
      </div>
    </header>
  );
}
