/* eslint-disable @typescript-eslint/no-explicit-any */

import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import RoomFilterList from "./RoomFilterList";

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

  // ⭐ Extract unique cities
  const uniqueCities = [...new Set(dorms.map((d) => d.city).filter(Boolean))];

  // ⭐ Extract unique universities
  const uniqueUniversities = [...new Set(dorms.map((d) => d.university).filter(Boolean))];

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
          <RoomFilterList initialDorms={dorms} />
        </div>
      </div>

      {/* ============================= */}
      {/* ⭐ OUR CITIES SECTION */}
      {/* ============================= */}
      <div className="our_room" style={{ marginTop: "70px" }}>
        <div className="container">
          <div className="titlepage text-center mb-4">
            <h2>Our Cities</h2>
            <p>Select a city to explore available dorms</p>
          </div>

          <div className="row">
            {uniqueCities.map((city) => (
              <div key={city} className="col-md-4 col-sm-6 mb-4">
                <div className="room city_card">
                  <div className="bed_room text-center p-4">
                    <h3>{city}</h3>
                    <p>View all dormitories located in {city}</p>
                    <a href={`/city/${city}`} className="read_more">
                      View City
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {uniqueCities.length === 0 && (
              <p className="text-center w-100">No cities available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ============================= */}
      {/* ⭐ OUR UNIVERSITIES SECTION */}
      {/* ============================= */}
      <div className="our_room" style={{ marginTop: "70px" }}>
        <div className="container">
          <div className="titlepage text-center mb-4">
            <h2>Our Universities</h2>
            <p>Select a university to view nearby dormitories</p>
          </div>

          <div className="row">
            {uniqueUniversities.map((univ) => (
              <div key={univ} className="col-md-4 col-sm-6 mb-4">
                <div className="room city_card">
                  <div className="bed_room text-center p-4">
                    <h3>{univ}</h3>
                    <p>Dormitories near {univ}</p>
                    <a href={`/university/${univ}`} className="read_more">
                      View University
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {uniqueUniversities.length === 0 && (
              <p className="text-center w-100">No universities available yet.</p>
            )}
          </div>
        </div>
      </div>

      <TemplateFooter />
    </div>
  );
}
