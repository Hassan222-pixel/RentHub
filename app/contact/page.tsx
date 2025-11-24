"use client";

import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";

export default function ContactPage() {
  return (
    <div className="main-layout">
      <TemplateHeader />

      {/* PAGE TITLE */}
      <div className="back_re">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2>Contact Us</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTACT SECTION */}
      <div className="contact">
        <div className="container">
          <div className="row">

            {/* FORM */}
            <div className="col-md-6">
              <form className="main_form">
                <div className="row">
                  <div className="col-md-12">
                    <input className="contactus" placeholder="Name" type="text" />
                  </div>

                  <div className="col-md-12">
                    <input className="contactus" placeholder="Email" type="email" />
                  </div>

                  <div className="col-md-12">
                    <input className="contactus" placeholder="Phone Number" type="text" />
                  </div>

                  <div className="col-md-12">
                    <textarea className="textarea" placeholder="Message" defaultValue=""></textarea>
                  </div>

                  <div className="col-md-12">
                    <button className="send_btn" type="button">Send</button>
                  </div>
                </div>
              </form>
            </div>

            {/* MAP */}
            <div className="col-md-6">
              <div className="map_main">
                <div className="map-responsive">
                  <iframe
                    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyA0s1a7phLN0iaD6-UE7m4qP-z21pH0eSc&q=Eiffel+Tower+Paris+France"
                    width="600"
                    height="400"
                    style={{ border: 0, width: "100%" }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <TemplateFooter />
    </div>
  );
}
