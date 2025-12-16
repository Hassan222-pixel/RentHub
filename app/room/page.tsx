// "use client";
// import { redirect } from "next/navigation";

// import { useEffect, useMemo, useState } from "react";
// import HeroSearch from "../components/Herosearch";
// import RecentProperties, {
//   type PropertyCard,
// } from "../components/RecentProperties";

// export type DormListItem = {
//   _id: string;
//   title: string;
//   description: string;
//   profileImg?: string | null;
//   roomType?: "private" | "double" | "shared" | null;
//   city?: string;
//   university?: string;

//   pricePerNight?: number | null;
//   pricePerWeek?: number | null;
//   pricePerMonth?: number | null;
//   maxOccupants?: number | null;
//   genderPreference?: "any" | "male" | "female" | null;

//   isOccupiedNow?: boolean;

//   capacity?: number | null;
//   availableBeds?: number | null;

//   availableFrom?: string | null;

//   adminAvailability?: "available" | "not_available";
//   isAdminBlocked?: boolean;
// };

// type UniversityListItem = {
//   _id: string;
//   name: string;
//   area: string;
// };

// function formatPrice(d: DormListItem): string {
//   if (d.pricePerMonth != null)
//     return `$${d.pricePerMonth.toLocaleString()} / month`;
//   if (d.pricePerWeek != null)
//     return `$${d.pricePerWeek.toLocaleString()} / week`;
//   if (d.pricePerNight != null)
//     return `$${d.pricePerNight.toLocaleString()} / night`;
//   return "Contact for price";
// }

// function formatBeds(d: DormListItem): string {
//   if (typeof d.availableBeds === "number") {
//     if (d.availableBeds <= 0) return "🛏️ No beds available";
//     const label = d.availableBeds === 1 ? "bed available" : "beds available";
//     return `🛏️ ${d.availableBeds} ${label}`;
//   }

//   if (d.roomType === "private") return "🛏️ 1 bed";
//   if (d.roomType === "double") return "🛏️ 2 beds";
//   if (d.roomType === "shared") {
//     const count = d.maxOccupants ?? 1;
//     const label = count === 1 ? "bed" : "beds";
//     return `🛏️ ${count} ${label}`;
//   }
//   return "🛏️ N/A";
// }

// function formatGender(d: DormListItem): string {
//   const pref = d.genderPreference || "any";
//   if (pref === "male") return "👨 Only male";
//   if (pref === "female") return "👩 Only female";
//   return "👨👩 Any";
// }

// function formatFrom(d: DormListItem): string {
//   if (d.isAdminBlocked) return "";
//   if (!d.availableFrom) return "";
//   const dt = new Date(d.availableFrom);
//   if (Number.isNaN(dt.getTime())) return "";
//   const label = dt.toLocaleDateString(undefined, {
//     day: "numeric",
//     month: "short",
//   });
//   return `From ${label}`;
// }

// export default function RoomPage() {
//   const [dorms, setDorms] = useState<DormListItem[]>([]);
//   const [filteredDorms, setFilteredDorms] = useState<DormListItem[]>([]);

//   // ✅ بدل cities رح يصير areas
//   const [areas, setAreas] = useState<string[]>([]);
//   const [universities, setUniversities] = useState<string[]>([]);
//   const [universitiesWithAreas, setUniversitiesWithAreas] = useState<
//     { name: string; area: string }[]
//   >([]);

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const dormRes = await fetch("/api/dorms", { cache: "no-store" });
//         const dormData = await dormRes.json();
//         const dormList: DormListItem[] = dormData.dorms || [];

//         setDorms(dormList);
//         setFilteredDorms(dormList);

//         // ✅ Fetch universities with area (source of truth for areas)
//         const uniRes = await fetch("/api/universities", { cache: "no-store" });
//         if (uniRes.ok) {
//           const uniData = await uniRes.json();
//           const uniList: UniversityListItem[] = uniData.universities || [];

//           const uniNames = uniList.map((u) => u.name).filter(Boolean);
//           setUniversities(uniNames);

//           const uniWithAreas = uniList.map((u) => ({
//             name: u.name,
//             area: u.area || "",
//           }));
//           setUniversitiesWithAreas(uniWithAreas);

//           const uniqueAreas = Array.from(
//             new Set(uniList.map((u) => (u.area || "").trim()).filter(Boolean))
//           ).sort();

//           setAreas(uniqueAreas);
//         } else {
//           setUniversities([]);
//           setUniversitiesWithAreas([]);
//           setAreas([]);
//         }
//       } catch (err) {
//         console.error("Failed to load room data", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const cards: PropertyCard[] = useMemo(() => {
//     return filteredDorms.map((d) => {
//       const isFullyOccupied =
//         d.isAdminBlocked === true ||
//         (typeof d.availableBeds === "number"
//           ? d.availableBeds <= 0
//           : d.isOccupiedNow === true);

//       const statusBadge = isFullyOccupied ? "Not available" : "Available";

//       return {
//         id: d._id,
//         title: d.title,
//         city: d.city || "Unknown",
//         price: formatPrice(d),
//         badge: statusBadge,
//         image:
//           d.profileImg ||
//           "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
//         href: `/room-details/${d._id}`,
//         bedsLabel: formatBeds(d),
//         availableFromLabel: formatFrom(d),
//         genderLabel: formatGender(d),
//       };
//     });
//   }, [filteredDorms]);

//   return (
//     <div className="main-layout">
//       <section className="our_room">
//         <div className="container">
//           <div className="titlepage text-center mb-4">
//             <h2>Find a Room</h2>
//             <p>Search and browse available rooms near your university.</p>
//           </div>

//           <div className="d-flex justify-content-center mb-4">
//             {!loading && (
//               <HeroSearch
//                 // ✅ areas بدل cities
//                 cities={areas}
//                 universities={universities}
//                 universitiesWithAreas={universitiesWithAreas}
//                 initialDorms={dorms}
//                 onResults={(filtered) => setFilteredDorms(filtered)}
//               />
//             )}
//           </div>

//           {loading && (
//             <p className="text-center" style={{ marginTop: "10px" }}>
//               Loading rooms...
//             </p>
//           )}
//         </div>
//       </section>

//       <RecentProperties
//         properties={cards}
//         title="Available rooms"
//         subtitle="Browse all currently active rooms from our renters."
//         showButton={false}
//       />
//     </div>
//   );
// }
// app/room/page.tsx
import { redirect } from "next/navigation";

export default function RoomRedirectPage() {
  redirect("/properties");
}
