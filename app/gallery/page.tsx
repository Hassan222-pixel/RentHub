"use client";

import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";

export default function GalleryPage() {
  return (
    <div className="main-layout">
      <TemplateHeader />

      {/* PAGE TITLE */}
      <div className="back_re">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2>Gallery</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GALLERY SECTION */}
      <div className="gallery">
        <div className="container">

          <div className="row">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div key={num} className="col-md-3 col-sm-6">
                <div className="gallery_img">
                  <figure>
                    <img
                      src={`/template/images/gallery${num}.jpg`}
                      alt={`Gallery ${num}`}
                    />
                  </figure>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      <TemplateFooter />
    </div>
  );
}
