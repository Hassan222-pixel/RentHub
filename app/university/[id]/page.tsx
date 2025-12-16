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
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ page?: string }>;
};

const PAGE_SIZE = 10;

export default async function UniversityPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const pageNumRaw = Number(sp.page ?? "1");
  const page = Number.isFinite(pageNumRaw) && pageNumRaw > 0 ? pageNumRaw : 1;

  await connectToDatabase();

  const uniDoc: any = await University.findById(id).lean();
  if (!uniDoc) notFound();

  const uniLat = uniDoc.latitude;
  const uniLng = uniDoc.longitude;

  // ✅ Fetch ALL active dorms (don’t require coordinates)
  const dormDocs: any[] = await Dorm.find({
    isActive: true,
    // ✅ remove adminAvailability filter so you see everything
    // adminAvailability: "available",
  })
    .select(
      "title city university latitude longitude profileImg images description adminAvailability"
    )
    .lean();

  // If uni has no coordinates we can still show dorms, just without distance sorting
  const uniHasCoords = typeof uniLat === "number" && typeof uniLng === "number";

  const allDormsSorted: UniversityDormListItem[] = dormDocs
    .map((d: any) => {
      const hasDormCoords =
        typeof d.latitude === "number" && typeof d.longitude === "number";

      const distanceKm =
        uniHasCoords && hasDormCoords
          ? getDistanceKm(uniLat, uniLng, d.latitude, d.longitude)
          : null;

      return {
        dormId: String(d._id),
        universityId: String(uniDoc._id),
        title: d.title || "Untitled dorm",
        city: d.city || "",
        universityName: d.university || "",
        // ✅ allow null distance (we’ll push them to the end)
        distanceKm: distanceKm ?? Number.POSITIVE_INFINITY,
        image:
          d.profileImg ||
          (Array.isArray(d.images) && d.images.length > 0
            ? d.images[0]
            : "https://images.unsplash.com/photo-1523217582562-09d0def993a6"),
        description:
          d.description ||
          (!hasDormCoords ? "No location set for this dorm yet." : ""),
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const totalItems = allDormsSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageDorms = allDormsSorted.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="uni-page-wrapper">
      <div className="uni-hero-card">
        <div className="uni-hero-title">
          <h1>{uniDoc.name}</h1>
          {uniDoc.area && <p>{uniDoc.area}</p>}
        </div>

        <div className="uni-hero-stats">
          <span className="uni-pill">🏠 {totalItems} dorms found</span>
          <span className="uni-pill">
            {uniHasCoords ? "📍 Sorted by distance" : "📍 Distance unavailable"}
          </span>
        </div>
      </div>

      <UniversityDormList
        universityName={uniDoc.name}
        dorms={pageDorms}
        page={safePage}
        totalPages={totalPages}
      />
    </div>
  );
}
