/* eslint-disable @next/next/no-img-element */
// app/components/UniversityDormList.tsx
import Link from "next/link";
import "./university-dorm-list.css";

export type UniversityDormListItem = {
  dormId: string;
  universityId: string;
  title: string;
  city: string;
  universityName: string;
  distanceKm: number;
  image: string;
  description: string;
};

type Props = {
  universityName: string;
  dorms: UniversityDormListItem[];
  page: number;
  totalPages: number;
};

export default function UniversityDormList({
  universityName,
  dorms,
  page,
  totalPages,
}: Props) {
  if (!dorms || dorms.length === 0) {
    return (
      <p className="uni-page-empty">
        There are no dorms near this university yet.
      </p>
    );
  }

  return (
    <div className="uni-page-list-wrapper">
      <div className="uni-page-list-header">
        <h2>Dorms near {universityName}</h2>
        <p>Click any dorm to view the map & directions.</p>
      </div>

      <div className="uni-dorm-list">
        {dorms.map((d) => (
          <Link
            key={d.dormId}
            href={`/university/${d.universityId}/dorm/${d.dormId}`}
            className="uni-dorm-row-link"
          >
            <div className="uni-dorm-row">
              <div className="uni-dorm-thumb">
                <img src={d.image} alt={d.title} />
              </div>

              <div className="uni-dorm-main">
                <h3>{d.title}</h3>
                <div className="uni-dorm-sub">
                  <span>📍 {d.city}</span>
                  <span className="uni-dorm-distance-pill">
                    📏 {d.distanceKm.toFixed(1)} km
                  </span>
                </div>

                {d.description && (
                  <p className="uni-dorm-desc">
                    {d.description.length > 110
                      ? d.description.slice(0, 110) + "..."
                      : d.description}
                  </p>
                )}
              </div>

              <div className="uni-dorm-cta">View</div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="uni-pagination">
          <Link
            className={`uni-page-btn ${page === 1 ? "disabled" : ""}`}
            href={`/university/${dorms[0].universityId}?page=${Math.max(
              1,
              page - 1
            )}`}
            aria-disabled={page === 1}
          >
            Previous
          </Link>

          <span className="uni-page-indicator">
            Page {page} of {totalPages}
          </span>

          <Link
            className={`uni-page-btn ${page === totalPages ? "disabled" : ""}`}
            href={`/university/${dorms[0].universityId}?page=${Math.min(
              totalPages,
              page + 1
            )}`}
            aria-disabled={page === totalPages}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  );
}
