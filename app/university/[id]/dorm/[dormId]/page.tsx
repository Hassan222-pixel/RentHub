/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/university/[id]/dorm/[dormId]/page.tsx

import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { University } from "@/models/University";
import { Dorm } from "@/models/Dorm";
import { getDistanceKm } from "@/lib/distance";
import UniversityDormMap from "@/app/components/UniversityDormMap";
import DirectionsButtons from "@/app/components/DirectionsButtons";

import "../../../university-dorm-map.css";

type Props = {
  params: Promise<{ id: string; dormId: string }>;
};

export default async function UniversityDormMapPage({ params }: Props) {
  const { id, dormId } = await params;

  await connectToDatabase();

  const [uniDoc, dormDoc]: any[] = await Promise.all([
    University.findById(id).lean(),
    Dorm.findById(dormId).lean(),
  ]);

  if (!uniDoc || !dormDoc) notFound();

  if (
    typeof uniDoc.latitude !== "number" ||
    typeof uniDoc.longitude !== "number" ||
    typeof dormDoc.latitude !== "number" ||
    typeof dormDoc.longitude !== "number"
  ) {
    return (
      <div className="uni-dorm-map-page">
        <h1>Location not available</h1>
        <p>
          Either the university or this dorm doesn&apos;t have coordinates set
          yet.
        </p>
      </div>
    );
  }

  const distanceKm = getDistanceKm(
    uniDoc.latitude,
    uniDoc.longitude,
    dormDoc.latitude,
    dormDoc.longitude
  );

  const universityCoords = {
    lat: uniDoc.latitude as number,
    lng: uniDoc.longitude as number,
  };

  const dormCoords = {
    lat: dormDoc.latitude as number,
    lng: dormDoc.longitude as number,
  };

  const profileImage =
    dormDoc.profileImg ||
    (Array.isArray(dormDoc.images) && dormDoc.images.length > 0
      ? dormDoc.images[0]
      : "https://images.unsplash.com/photo-1523217582562-09d0def993a6");

  return (
    <div className="uni-dorm-map-page">
      {/* Modern header card */}
      <div className="udm-header-card">
        <div className="udm-left">
          <div className="udm-thumb">
            <img src={profileImage} alt={dormDoc.title} />
          </div>

          <div className="udm-info">
            <h1 className="udm-title">{dormDoc.title}</h1>

            <p className="udm-subtitle">
              Near <strong>{uniDoc.name}</strong>
            </p>

            <div className="udm-meta">
              {dormDoc.city && (
                <span className="udm-pill">📍 {dormDoc.city}</span>
              )}
              <span className="udm-pill">
                📏 {distanceKm.toFixed(1)} km away
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <DirectionsButtons
          universityName={uniDoc.name}
          universityCoords={universityCoords}
          dormTitle={dormDoc.title}
          dormCoords={dormCoords}
        />
      </div>

      {/* Map */}
      <div className="udm-map-card">
        <UniversityDormMap
          universityName={uniDoc.name}
          dormTitle={dormDoc.title}
          universityCoords={universityCoords}
          dormCoords={dormCoords}
        />
      </div>
    </div>
  );
}
