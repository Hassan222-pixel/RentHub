"use client";

import { useEffect, useState } from "react";
import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";

type AboutData = {
  title: string;
  content: string;
  imageUrl: string;
  buttonText: string;
};

const defaultAbout: AboutData = {
  title: "About Us",
  content:
    "The passage experienced a surge in popularity during the 1960s when Letraset used it on their dry-transfer sheets, and again during the 90s as desktop publishers bundled the text with their software.",
  imageUrl: "/template/images/about.png",
  buttonText: "Read More",
};

export default function AboutPage() {
  const [about, setAbout] = useState<AboutData>(defaultAbout);

  useEffect(() => {
    const loadAbout = async () => {
      try {
        const res = await fetch("/api/about");
        if (!res.ok) return;
        const data = await res.json();
        if (!data) return;

        setAbout({
          title: data.title || defaultAbout.title,
          content: data.content || defaultAbout.content,
          imageUrl: data.imageUrl || defaultAbout.imageUrl,
          buttonText: data.buttonText || defaultAbout.buttonText,
        });
      } catch (err) {
        console.error("Error loading about section:", err);
      }
    };

    loadAbout();
  }, []);

  return (
    <div className="main-layout">

      <TemplateHeader />

      {/* Banner Header */}
      <div className="back_re">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2>{about.title}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="about">
        <div className="container-fluid">
          <div className="row">

            <div className="col-md-5">
              <div className="titlepage">
                <p className="margin_0">{about.content}</p>
                <a className="read_more" href="#">
                  {about.buttonText}
                </a>
              </div>
            </div>

            <div className="col-md-7">
              <div className="about_img">
                <figure>
                  <img
                    src={about.imageUrl || "/template/images/about.png"}
                    alt="About Us"
                  />
                </figure>
              </div>
            </div>

          </div>
        </div>
      </div>

      <TemplateFooter />

    </div>
  );
}
