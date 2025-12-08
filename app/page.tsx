import Hero from "./components/Hero";
import RecentProperties from "./components/RecentProperties";
import Cities from "./components/Cities";
import Universities from "./components/universities";
import Testimonials from "./components/Testimonials";
import Newsletter from "./components/Newsletter";
import TemplateHeader from "./components/TemplateHeader";
import TemplateFooter from "./components/TemplateFooter";

export default function Home() {
  return (
    <>
      <TemplateHeader />
      <Hero />
      <RecentProperties />
      <Cities />
      <Universities />
      <Testimonials />
      <Newsletter />
      <TemplateFooter />
    </>
  );
}
