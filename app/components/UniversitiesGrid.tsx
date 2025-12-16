/* eslint-disable @next/next/no-img-element */
// app/components/UniversitiesGrid.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { FaSearchLocation } from "react-icons/fa";
import "./universities-grid.css";

interface UniItem {
  _id: string;
  name: string;
  area: string;
  image: string;
}

const ITEMS_PER_PAGE = 6;

export default function UniversitiesGrid({
  universities,
}: {
  universities: UniItem[];
}) {
  const [page, setPage] = useState(1);

  const totalItems = universities.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const currentItems = universities.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePrev = () => {
    if (safePage > 1) setPage(safePage - 1);
  };

  const handleNext = () => {
    if (safePage < totalPages) setPage(safePage + 1);
  };

  return (
    <section className="uni-wrapper">
      <div className="uni-header">
        <h2>Find properties near these universities</h2>
      </div>

      <div className="uni-grid">
        {currentItems.map((uni) => (
          <Link
            key={uni._id}
            href={`/university/${uni._id}`}
            className="uni-card-link"
          >
            <div className="uni-card">
              <img src={uni.image} alt={uni.name} className="uni-image" />

              <span className="uni-name">{uni.name}</span>
              <span className="uni-area">{uni.area}</span>

              {/* Hover overlay */}
              <div className="uni-hover-overlay">
                <FaSearchLocation className="uni-hover-icon" />
                <p className="uni-hover-text">
                  Explore the dorms that are near from your university
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="uni-pagination">
          <button
            className="uni-page-btn"
            onClick={handlePrev}
            disabled={safePage === 1}
          >
            Previous
          </button>

          <span className="uni-page-indicator">
            Page {safePage} of {totalPages}
          </span>

          <button
            className="uni-page-btn"
            onClick={handleNext}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
