"use client";

import "../contact/contact.css";
import dynamic from "next/dynamic";
import Newsletter from "../components/Newsletter";

// 🚫 Prevent hydration issues from HeroSearch
const HeroSearch = dynamic(
  () => import("../components/Herosearch"),
  { ssr: false }
);

export default function ContactPage() {
  return (
    <main className="contact-wrapper">

      {/* HERO */}
      <div className="contact-hero">
        <div className="contact-hero-overlay">
          <h1>Contact</h1>
          <p className="breadcrumb">Home / Contact</p>

          <div className="hero-search-container">
            <HeroSearch />
          </div>
        </div>
      </div>

      {/* CONTACT SECTION */}
      <section className="contact-section">

        {/* LEFT */}
        <div className="contact-left">
          <h2>Get in touch with us</h2>
          <p className="subtitle">Say hello</p>

          <p>
            We are happy to answer any questions you may have about our
            dormitory, rooms, or availability.
          </p>

          <p><strong>Address:</strong> Beirut</p>
          <p><strong>Phone:</strong> 78860266</p>
          <p><strong>Email:</strong> 123@gmail.com</p>
        </div>

        {/* RIGHT — IMAGE BACKGROUND */}
        <div className="contact-right">
          <form className="contact-form">
            <div className="row">
              <input type="text" placeholder="Name" required />
              <input type="email" placeholder="E-mail" required />
            </div>

            <input
              className="subject-input"
              type="text"
              placeholder="Subject"
              required
            />

            <textarea placeholder="Message" required />

            <button type="submit" className="send-btn">
              SEND
            </button>
          </form>
        </div>

      </section>

      <Newsletter />
    </main>
  );
}
