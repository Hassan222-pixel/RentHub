/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// app/room/page.tsx
import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import RoomFilterList from "./RoomFilterList";

// Type for the dorms we send to the client component
export type DormListItem = {
  _id: string;
  title: string;
  description: string;
  profileImg?: string | null;
  roomType?: "private" | "double" | "shared" | null;
  city?: string;
  university?: string;
  pricePerNight?: number | null;
  pricePerWeek?: number | null;
  pricePerMonth?: number | null;
};

export default async function RoomPage() {
  await connectToDatabase();

  // Load all active dorms (initial state before filters)
  const dormDocs = await Dorm.find({ isActive: true })
    .sort({ createdAt: -1 })
    .select(
      "title description profileImg roomType city university pricePerNight pricePerWeek pricePerMonth"
    )
    .lean();

  const dorms: DormListItem[] = dormDocs.map((d: any) => ({
    _id: d._id.toString(),
    title: d.title,
    description: d.description,
    profileImg: d.profileImg || null,
    roomType: d.roomType || null,
    city: d.city || "",
    university: d.university || "",
    pricePerNight: d.pricePerNight ?? null,
    pricePerWeek: d.pricePerWeek ?? null,
    pricePerMonth: d.pricePerMonth ?? null,
  }));

  return (
    <div className="main-layout">
      <TemplateHeader />

      {/* PAGE TITLE */}
      <div className="back_re">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2>Our Rooms</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROOM SECTION */}
      <div className="our_room">
        <div className="container">
          {/* Client-side filter bar + list */}
          <RoomFilterList initialDorms={dorms} />
        </div>
      </div>

      <TemplateFooter />
    </div>
  );
}
