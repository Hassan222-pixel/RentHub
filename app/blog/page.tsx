/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";

export default function BlogPage() {
  return (
    <div className="main-layout">
      <TemplateHeader />

      {/* PAGE TITLE */}
      <div className="back_re">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2>Blog</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOG SECTION */}
      <div className="blog">
        <div className="container">

          <div className="row">
            {[1, 2, 3].map((num) => (
              <div key={num} className="col-md-4">
                <div className="blog_box">
                  <div className="blog_img">
                    <figure>
                      <img
                        src={`/template/images/blog${num}.jpg`}
                        alt={`Blog ${num}`}
                      />
                    </figure>
                  </div>

                  <div className="blog_room">
                    <h3>Bed Room</h3>
                    <span>The standard chunk</span>
                    <p>
                      If you are going to use a passage of Lorem Ipsum, you need
                      to be sure there isn't anything embarrassing hidden in the
                      middle of text.
                    </p>
                  </div>
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
