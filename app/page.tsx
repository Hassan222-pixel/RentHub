import Hero from "./components/Hero";
import RecentProperties from "./components/RecentProperties";
import Cities from "./components/Cities";
import Universities from "./components/universities";
import Testimonials from "./components/Testimonials";
import Newsletter from "./components/Newsletter";
import CitiesUniversitiesSwitch from "./components/CitiesUniversitiesSwitch";


import { connectToDatabase } from "@/lib/mongodb";
import { Hero as HeroModel } from "@/models/Hero";

export default async function Home() {
  await connectToDatabase();

  // Fetch hero document
  const heroData = await HeroModel.findOne().lean();

  // If no hero exists yet, fallback to default values
  const hero = heroData ?? {
    backgroundImage: "",
    highlightedH2: "",
    titleH1: "",
    subtitleH2: "",
  };

  return (
    <>
      <Hero data={hero} />
      <RecentProperties />
      {/* <Cities />
      <Universities /> */}
      <CitiesUniversitiesSwitch />
      <Testimonials />
      <Newsletter />
      

    </>
  );
}
