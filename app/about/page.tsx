"use client";

import { useEffect, useState } from "react";
import "../about/about.css";
import HeroSearch from "../components/Herosearch";
import Newsletter from "../components/Newsletter";

interface Stat {
  label: string;
  value: number;
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
      const res = await fetch("/api/about");
      const data = await res.json();

      setAbout({
        bannerTitle: data.bannerTitle ?? "About",
        bannerBackgroundImage: data.bannerBackgroundImage ?? "",

        aboutTitle: data.aboutTitle ?? "",
        aboutSubtitle: data.aboutSubtitle ?? "",
        aboutParagraph1: data.aboutParagraph1 ?? "",
        aboutParagraph2: data.aboutParagraph2 ?? "",
        aboutImage: data.aboutImage ?? "",

        stats: Array.isArray(data.stats) ? data.stats : [],
        realtors: Array.isArray(data.realtors) ? data.realtors : [],
      });
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
            <HeroSearch />
          </div>

        </div>
      </div>

      {/* ABOUT MAIN SECTION */}
      <section className="about-section">

        {/* LEFT TEXT */}
        <div className="about-left">
          <h2>{about.aboutTitle}</h2>
          <p className="subtitle">{about.aboutSubtitle}</p>

          <p className="about-text">{about.aboutParagraph1}</p>
          <p className="about-text">{about.aboutParagraph2}</p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="about-right">
          <img src={about.aboutImage} alt="about image" />
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="about-stats">
        {about.stats.map((stat, index) => (
          <div className="stat" key={index}>
            {/* Keep your static icons OR make them dynamic later */}
            <img src="https://preview.colorlib.com/theme/bluesky/img/icons/ci-3.png" />

            <div>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* TEAM SECTION */}
      <section className="team-section">
        <h2>The Realtors</h2>
        <p className="subtitle">{about.aboutSubtitle}</p>

        <div className="team-grid">
          {about.realtors.map((r, i) => (
            <div className="team-card" key={i}>
              <img src={r.photo} alt={r.name} />
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
