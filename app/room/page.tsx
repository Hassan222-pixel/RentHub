/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
// app/room/page.tsx
import Link from "next/link";
import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";

export default async function RoomPage() {
  await connectToDatabase();

  // جيب كل الغرف الـ active
  const dorms = await Dorm.find({ isActive: true })
    .sort({ createdAt: -1 })
    .select("title description profileImg") // بس اللي بدنا ياه
    .lean();

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
          <div className="row">
            <div className="col-md-12">
              <div className="titlepage">
                <h2>Our Room</h2>
                <p>Find available rooms across Lebanon</p>
              </div>
            </div>
          </div>

          <div className="row">
            {dorms.length === 0 && (
              <div className="col-md-12">
                <p>No rooms available at the moment.</p>
              </div>
            )}

            {dorms.map((dorm: any) => (
              <div key={dorm._id.toString()} className="col-md-4 col-sm-6">
                <Link
                  href={`/room-details/${dorm._id.toString()}`}
                  className="text-decoration-none"
                >
                  <div id="serv_hover" className="room">
                    <div className="room_img">
                      <figure>
                        <img
                          src={
                            dorm.profileImg || "/template/images/room1.jpg" // fallback لو ما في صورة
                          }
                          alt={dorm.title}
                        />
                      </figure>
                    </div>
                    <div className="bed_room">
                      <h3>{dorm.title}</h3>
                      <p>
                        {dorm.description?.length > 120
                          ? dorm.description.slice(0, 120) + "..."
                          : dorm.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TemplateFooter />
    </div>
  );
}
