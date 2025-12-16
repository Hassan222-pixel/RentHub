/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx

import Hero from "./components/Hero";
import UniversitiesGrid from "./components/UniversitiesGrid";
import WhyChooseRentHub from "./components/why-choose-renthub";
import HowItWorks from "./components/how-it-works";
import Stats from "./components/stats";
import Testimonials from "./components/Testimonials";

import { connectToDatabase } from "@/lib/mongodb";
import { Hero as HeroModel } from "@/models/Hero";
import { University } from "@/models/University";

export const dynamic = "force-dynamic";

export default async function Home() {
  await connectToDatabase();

  const heroData = await HeroModel.findOne().lean();

  // ✅ ALWAYS return the FULL shape Hero expects
  const hero = {
    backgroundImage: heroData?.backgroundImage ?? "",
    highlightedH2: heroData?.highlightedH2 ?? "",
    titleH1: heroData?.titleH1 ?? "",
    subtitleH2: heroData?.subtitleH2 ?? "",
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
      <WhyChooseRentHub />
      <HowItWorks />
      <UniversitiesGrid universities={universities} />
      <Stats />
      <Testimonials />
    </>
  );
}
