"use client";

import { useEffect, useState } from "react";
import "../about/about.css";
import HeroSearch from "../components/Herosearch";
import Newsletter from "../components/Newsletter";

interface Stat {
  label: string;
  value: number;
  icon: string;
}

interface Realtor {
  name: string;
  position: string;
  photo: string;
}

interface AboutData {
  bannerTitle: string;
  bannerBackgroundImage: string;

  aboutTitle: string;
  aboutSubtitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  aboutImage: string;

  stats: Stat[];
  realtors: Realtor[];
}

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/about");

        // Read raw response FIRST
        const raw = await res.text();
        console.log("🔍 RAW /api/about RESPONSE:", raw);

        if (!raw || raw.trim() === "") {
          console.error("❌ Empty response received from API.");
          return;
        }

        // Safe JSON parse
        let data: any;
        try {
          data = JSON.parse(raw);
        } catch (err) {
          console.error("❌ JSON parse failed:", err);
          return;
        }

        // Normalize object
        setAbout({
          bannerTitle: data.bannerTitle ?? "About",
          bannerBackgroundImage: data.bannerBackgroundImage ?? "/template/images/banner1.jpg",

          aboutTitle: data.aboutTitle ?? "",
          aboutSubtitle: data.aboutSubtitle ?? "",
          aboutParagraph1: data.aboutParagraph1 ?? "",
          aboutParagraph2: data.aboutParagraph2 ?? "",
          aboutImage: data.aboutImage ?? "/template/images/about.png",

          stats: Array.isArray(data.stats)
            ? data.stats.map((s: any) => ({
                label: s.label ?? "",
                value: Number(s.value ?? 0),
                icon: s.icon ?? "", // important
              }))
            : [],

          realtors: Array.isArray(data.realtors)
            ? data.realtors.map((r: any) => ({
                name: r.name ?? "",
                position: r.position ?? "",
                photo: r.photo ?? "",
              }))
            : [],
        });
      } catch (err) {
        console.error("❌ Fatal error loading About page:", err);
      }
    };

    load();
  }, []);

  if (!about) return <div className="p-6">Loading...</div>;

  return (
    <main className="about-wrapper">

      {/* HERO SECTION */}
      <div
        className="about-hero"
        style={{
          backgroundImage: `url(${about.bannerBackgroundImage})`,
        }}
      >
        <div className="about-hero-overlay">
          <h1>{about.bannerTitle}</h1>
          <p className="breadcrumb">Home / {about.bannerTitle}</p>
          <div className="hero-search-container">
            {/* <HeroSearch /> */}
          </div>
        </div>
      </div>

      {/* MAIN ABOUT SECTION */}
      <section className="about-section">
        <div className="about-left">
          <h2>{about.aboutTitle}</h2>
          <p className="subtitle">{about.aboutSubtitle}</p>
          <p className="about-text">{about.aboutParagraph1}</p>
          <p className="about-text">{about.aboutParagraph2}</p>
        </div>

        <div className="about-right">
          {about.aboutImage ? (
            <img src={about.aboutImage} alt="about section" />
          ) : null}
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="about-stats">
        {about.stats.map((stat, index) => (
          <div className="stat" key={index}>

            {/* only show icon if not empty */}
            {stat.icon ? (
              <img src={stat.icon} alt={stat.label} />
            ) : (
              <div style={{ width: 60, height: 60 }}></div> // placeholder to avoid errors
            )}

            <div>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* TEAM SECTION */}
      <section className="team-section">
        <h2>The Team</h2>
        <p className="subtitle">{about.aboutSubtitle}</p>

        <div className="team-grid">
          {about.realtors.map((r, i) => (
            <div className="team-card" key={i}>
              {r.photo ? <img src={r.photo} alt={r.name} /> : null}
              <h3>{r.name}</h3>
              <p>{r.position}</p>
              <div className="circle-btn">+</div>
            </div>
          ))}
        </div>
      </section>

      <Newsletter />
    </main>
  );
}
