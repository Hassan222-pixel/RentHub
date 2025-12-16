"use client";

import "./hero.css";
import HeroSearch from "./Herosearch";

interface HeroProps {
  data: {
    backgroundImage: string;
    highlightedH2: string;
    titleH1: string;
    subtitleH2: string;
  };
}

export default function Hero({ data }: HeroProps) {
  return (
    <section
      className="hero"
      style={{ backgroundImage: `url("${data.backgroundImage}")` }}
    >
      <div className="hero-overlay">
        <div className="hero-content">
          <span className="offer-tag">{data.highlightedH2}</span>
          <h1 className="hero-title">{data.titleH1}</h1>
          <p className="hero-price">{data.subtitleH2}</p>

          {/* ✅ SAME SEARCH + SAME STYLE */}
          <div className="hero-search-wrapper">
            <HeroSearch />
          </div>
        </div>
      </div>
    </section>
  );
}
