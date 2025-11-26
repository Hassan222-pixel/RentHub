"use client";

import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";

export default function AboutPage() {
  return (
    <div className="main-layout">

      <TemplateHeader />

      <div className="back_re">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2>About Us</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="about">
        <div className="container-fluid">
          <div className="row">

            <div className="col-md-5">
              <div className="titlepage">
                <p className="margin_0">
                  The passage experienced a surge in popularity during the 1960s when Letraset
                  used it on their dry-transfer sheets, and again during the 90s as desktop
                  publishers bundled the text with their software.
                </p>
                <a className="read_more" href="#">Read More</a>
              </div>
            </div>

            <div className="col-md-7">
              <div className="about_img">
                <figure>
                  <img src="/template/images/about.png" alt="About Us" />
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
