/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx

import Hero from "./components/Hero";
import RecentProperties from "./components/RecentProperties";
import UniversitiesGrid from "./components/UniversitiesGrid";
import Testimonials from "./components/Testimonials";
import Newsletter from "./components/Newsletter";

import { connectToDatabase } from "@/lib/mongodb";
import { Hero as HeroModel } from "@/models/Hero";
import { University } from "@/models/University";

export const dynamic = "force-dynamic";

export default async function Home() {
  await connectToDatabase();

  // HERO
  const heroData = await HeroModel.findOne().lean();
  const hero = heroData ?? {
    backgroundImage: "",
    highlightedH2: "",
    titleH1: "",
    subtitleH2: "",
  };

  // UNIVERSITIES – get all, sorted
  const universitiesData = await University.find({})
    .sort({ name: 1 })
    .lean()
    .exec();

  const universities = universitiesData.map((u: any) => ({
    _id: String(u._id),
    name: u.name,
    area: u.area || "",
    image: u.image || "/images/default-uni.jpg", // fallback image path
  }));

  return (
    <>
      <Hero data={hero} />
      <RecentProperties />

      {/* Universities with pagination (6 per page) */}
      <UniversitiesGrid universities={universities} />

      <Testimonials />
      <Newsletter />
    </>
  );
}
