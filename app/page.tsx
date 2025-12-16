import Hero from "./components/Hero";
import CitiesUniversitiesSwitch from "./components/CitiesUniversitiesSwitch";
import WhyChooseRentHub from "./components/why-choose-renthub";
import HowItWorks from "./components/how-it-works";
import Stats from "./components/stats";
import Testimonials from "./components/Testimonials";

import { connectToDatabase } from "@/lib/mongodb";
import { Hero as HeroModel } from "@/models/Hero";

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

  return (
    <>
      <Hero data={hero} />
      <WhyChooseRentHub />
      <HowItWorks />
      <CitiesUniversitiesSwitch />
      <Stats />
      <Testimonials />
    </>
  );
}
