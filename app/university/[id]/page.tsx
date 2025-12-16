/* eslint-disable @typescript-eslint/no-explicit-any */
// app/university/[id]/page.tsx

import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { University } from "@/models/University";
import { Dorm } from "@/models/Dorm";
import { getDistanceKm } from "@/lib/distance";
import UniversityDormList, {
  type UniversityDormListItem,
} from "@/app/components/UniversityDormList";

import "../university-page.css";

type Props = {
  params: Promise<{ id: string }>; // ✅ params is a Promise in your Next 16 setup
};

export default async function UniversityPage({ params }: Props) {
  const { id } = await params; // ✅ unwrap params before using

  await connectToDatabase();

  const uniDoc: any = await University.findById(id).lean();

  if (!uniDoc) {
    notFound();
  }

  const uniLat = uniDoc.latitude;
  const uniLng = uniDoc.longitude;

  if (typeof uniLat !== "number" || typeof uniLng !== "number") {
    return (
      <div className="uni-page-wrapper">
        <div className="uni-page-header">
          <h1>{uniDoc.name}</h1>
          {uniDoc.area && <p>{uniDoc.area}</p>}
        </div>

        <p className="uni-page-no-coords">
          This university doesn&apos;t have a valid location set yet.
        </p>
      </div>
    );
  }

  const dormDocs: any[] = await Dorm.find({
    isActive: true,
    adminAvailability: "available",
    latitude: { $ne: null },
    longitude: { $ne: null },
  })
    .select(
      "title city university latitude longitude profileImg images description"
    )
    .lean();

  const dormsWithDistance: UniversityDormListItem[] = dormDocs
    .map((d: any) => {
      if (typeof d.latitude !== "number" || typeof d.longitude !== "number") {
        return null;
      }

      const distanceKm = getDistanceKm(uniLat, uniLng, d.latitude, d.longitude);

      return {
        dormId: String(d._id),
        universityId: String(uniDoc._id),
        title: d.title || "Untitled dorm",
        city: d.city || "",
        universityName: d.university || "",
        distanceKm,
        image:
          d.profileImg ||
          (Array.isArray(d.images) && d.images.length > 0
            ? d.images[0]
            : "https://images.unsplash.com/photo-1523217582562-09d0def993a6"),
        description: d.description || "",
      };
    })
    .filter((x): x is UniversityDormListItem => Boolean(x))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <div className="uni-page-wrapper">
      <div className="uni-page-header">
        <h1>{uniDoc.name}</h1>
        {uniDoc.area && <p>{uniDoc.area}</p>}
      </div>

      <UniversityDormList
        universityName={uniDoc.name}
        dorms={dormsWithDistance}
      />
    </div>
  );
}
