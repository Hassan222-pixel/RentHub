"use client";

import { useEffect, useState } from "react";
import "./footer.css";

type FooterProperty = {
  city: string;
  title: string;
  price: string;
  image: string;
};

type FooterData = {
  description: string;
  properties: FooterProperty[];
};

export default function TemplateFooter() {
  const [footer, setFooter] = useState<FooterData | null>(null);

  useEffect(() => {
    fetch("/api/footer", { cache: "no-store" })
      .then((res) => res.json())
      .then(setFooter)
      .catch(console.error);
  }, []);

  if (!footer) return null;

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* LEFT */}
        <div className="footer-left">
          <div className="footer-logo">
            <span className="logo-icon"></span>
            <span className="logo-text">------RentHub------</span>
          </div>

          <p>{footer.description}</p>
        </div>

        {/* RIGHT */}
        <div className="footer-right">
          <h3>Latest Properties</h3>

          <div className="footer-properties">
            {footer.properties.map((p, i) => (
              <div key={i} className="footer-property">
                <img src={p.image} alt={p.title} />
                <div>
                  <span>{p.city}</span>
                  <strong>{p.title}</strong>
                  <span className="price">{p.price}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}
