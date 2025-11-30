/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";

type DormType = {
  _id: string;
  title: string;
  description: string;
  city?: string;
  university?: string;
  pricePerNight?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  depositCurrency?: string;
  profileImg?: string;
  images?: string[];
};

export default function RoomDetailsPage() {
  const params = useParams<{ id: string }>();

  // useParams ممكن ترجع string | string[] | undefined
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [dorm, setDorm] = useState<DormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return; // لسا ما توفر الـ id

    let cancelled = false;

    async function fetchDorm() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/dorms/${id}`);

        if (!res.ok) {
          // لو حابب تشوف التفاصيل:
          // const txt = await res.text();
          // console.log("Dorm API error:", res.status, txt);
          throw new Error("Failed to load dorm");
        }

        const data = await res.json();
        if (!cancelled) {
          setDorm(data.dorm);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Could not load this room.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDorm();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const currency = dorm?.depositCurrency || "USD";

  return (
    <div className="main-layout">
      <TemplateHeader />

      {/* PAGE TITLE */}
      <div className="back_re">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2>{dorm ? dorm.title : "Room details"}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="our_room">
        <div className="container">
          {loading && (
            <div className="row">
              <div className="col-md-12">
                <p>Loading room details...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="row">
              <div className="col-md-12">
                <p>{error}</p>
              </div>
            </div>
          )}

          {dorm && !loading && !error && (
            <div className="row">
              {/* صورة */}
              <div className="col-md-6">
                <div className="room_img">
                  <figure>
                    <img
                      src={
                        dorm.profileImg ||
                        dorm.images?.[0] ||
                        "/template/images/room1.jpg"
                      }
                      alt={dorm.title}
                    />
                  </figure>
                </div>
              </div>

              {/* معلومات */}
              <div className="col-md-6">
                <div className="bed_room">
                  <h3>{dorm.title}</h3>
                  <p>{dorm.description}</p>

                  <ul>
                    {dorm.city && (
                      <li>
                        <strong>City:</strong> {dorm.city}
                      </li>
                    )}
                    {dorm.university && (
                      <li>
                        <strong>Near University:</strong> {dorm.university}
                      </li>
                    )}
                    {dorm.pricePerMonth != null && (
                      <li>
                        <strong>Monthly Price:</strong> {dorm.pricePerMonth}{" "}
                        {currency}
                      </li>
                    )}
                    {dorm.pricePerWeek != null && (
                      <li>
                        <strong>Weekly Price:</strong> {dorm.pricePerWeek}{" "}
                        {currency}
                      </li>
                    )}
                    {dorm.pricePerNight != null && (
                      <li>
                        <strong>Daily Price:</strong> {dorm.pricePerNight}{" "}
                        {currency}
                      </li>
                    )}
                  </ul>

                  {/* زر الحجز → صفحة فاضية */}
                  <Link
                    href={`/room/request/${dorm._id}`}
                    className="btn btn-primary mt-3"
                  >
                    Book this room
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-md-12">
          <Link href="/room" className="btn btn-secondary">
            ← Back to Rooms
          </Link>
        </div>
      </div>

      <TemplateFooter />
    </div>
  );
}
