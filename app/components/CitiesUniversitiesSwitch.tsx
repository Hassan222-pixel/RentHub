"use client";

import { useEffect, useState } from "react";
import Cities from "./Cities";
import Universities from "./universities";
import "./cities-universities.css";

export default function CitiesUniversitiesSwitch() {
  const [active, setActive] = useState<"cities" | "universities">("cities");

  // OPTIONAL auto switch every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) =>
        prev === "cities" ? "universities" : "cities"
      );
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="location-wrapper">
      {/* TITLE */}
      <div className="location-header">
        <h2>
          {active === "cities"
            ? "Find properties in these cities"
            : "Find properties near these universities"}
        </h2>
      </div>

      {/* CONTENT */}
      <div className="location-content">
        {active === "cities" ? <Cities /> : <Universities />}
      </div>

      {/* DOT NAVIGATION */}
      <div className="location-dots">
        <span
          className={`dot ${active === "cities" ? "active" : ""}`}
          onClick={() => setActive("cities")}
        />
        <span
          className={`dot ${active === "universities" ? "active" : ""}`}
          onClick={() => setActive("universities")}
        />
      </div>
    </section>
  );
}
