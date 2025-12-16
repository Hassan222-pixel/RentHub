"use client";

import "../contact/contact.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Newsletter from "../components/Newsletter";

// HeroSearch = client only
const HeroSearch = dynamic(
  () => import("../components/Herosearch"),
  { ssr: false }
);

type ContactData = {
  bannerTitle: string;
  bannerBackgroundImage: string;

  heading: string;
  subtitle: string;
  description: string;

  address: string;
  phone: string;
  email: string;

  mapEmbedUrl?: string;
};

export default function ContactPage() {
  const [contact, setContact] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD CONTACT DATA FROM API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/contact", { cache: "no-store" });
        const data = await res.json();

        setContact({
          bannerTitle: data.bannerTitle ?? "Contact",
          bannerBackgroundImage: data.bannerBackgroundImage ?? "",

          heading: data.heading ?? "Get in touch with us",
          subtitle: data.subtitle ?? "",
          description: data.description ?? "",

          address: data.address ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",

          mapEmbedUrl: data.mapEmbedUrl ?? "",
        });
      } catch (err) {
        console.error("Failed to load contact data", err);
        setContact(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading contact...</div>;
  }

  if (!contact) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load contact page.
      </div>
    );
  }

  return (
    <main className="contact-wrapper">

      {/* HERO */}
      <div
        className="contact-hero"
        style={{
          backgroundImage: `url(${contact.bannerBackgroundImage})`,
        }}
      >
        <div className="contact-hero-overlay">
          <h1>{contact.bannerTitle}</h1>
          <p className="breadcrumb">Home / {contact.bannerTitle}</p>

          <div className="hero-search-container">
            {/* <HeroSearch /> */}
          </div>
        </div>
      </div>

      {/* CONTACT SECTION */}
      <section className="contact-section">

        {/* LEFT */}
        <div className="contact-left">
          <h2>{contact.heading}</h2>
          <p className="subtitle">{contact.subtitle}</p>

          <p>{contact.description}</p>

          <p><strong>Address:</strong> {contact.address}</p>
          <p><strong>Phone:</strong> {contact.phone}</p>
          <p><strong>Email:</strong> {contact.email}</p>
        </div>

        {/* RIGHT */}
        <div className="contact-right">
          <form
            className="contact-form"
            suppressHydrationWarning
          >
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

      {/* MAP SECTION */}
      {contact.mapEmbedUrl && (
        <section className="contact-map">
          <iframe
            src={contact.mapEmbedUrl}
            width="100%"
            height="400"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      )}

      <Newsletter />
    </main>
  );
}
