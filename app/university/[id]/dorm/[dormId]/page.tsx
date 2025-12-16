/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/university/[id]/dorm/[dormId]/page.tsx

import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { University } from "@/models/University";
import { Dorm } from "@/models/Dorm";
import { getDistanceKm } from "@/lib/distance";
import UniversityDormMap from "@/app/components/UniversityDormMap";

// ✅ CSS file is here: app/university/university-dorm-map.css
import "../../../university-dorm-map.css";

type Props = {
  params: Promise<{ id: string; dormId: string }>; // ✅ Next 16 fix
};

export default async function UniversityDormMapPage({ params }: Props) {
  const { id, dormId } = await params; // ✅ unwrap params

  await connectToDatabase();

  // ✅ Force any to avoid TS errors with lean()
  const [uniDoc, dormDoc]: any[] = await Promise.all([
    University.findById(id).lean(),
    Dorm.findById(dormId).lean(),
  ]);

  if (!uniDoc || !dormDoc) {
    notFound();
  }

  // ✅ validate coords
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
      <div className="uni-dorm-map-info">
        <h1>{dormDoc.title}</h1>

        <p className="uni-dorm-map-uni">
          Near <strong>{uniDoc.name}</strong>
        </p>

        <div className="uni-dorm-map-meta">
          <img src={profileImage} alt={dormDoc.title} />
          <div>
            {dormDoc.city && (
              <p className="uni-dorm-map-city">{dormDoc.city}</p>
            )}

            <p className="uni-dorm-map-distance">
              Distance: <strong>{distanceKm.toFixed(1)} km</strong>
            </p>
          </div>
        </div>
      </div>

      <UniversityDormMap
        universityName={uniDoc.name}
        dormTitle={dormDoc.title}
        universityCoords={universityCoords}
        dormCoords={dormCoords}
      />
    </div>
  );
}
