/* eslint-disable @next/next/no-img-element */
// app/components/UniversityDormList.tsx
import Link from "next/link";

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
};

export default function UniversityDormList({ universityName, dorms }: Props) {
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
        <p>
          Select a dorm to see its exact location and route from the university.
        </p>
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
                <p className="uni-dorm-city">{d.city}</p>
                <p className="uni-dorm-desc">
                  {d.description.length > 110
                    ? d.description.slice(0, 110) + "..."
                    : d.description}
                </p>
              </div>

              <div className="uni-dorm-distance">
                <span className="uni-dorm-distance-label">Distance</span>
                <span className="uni-dorm-distance-value">
                  {d.distanceKm.toFixed(1)} km
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
