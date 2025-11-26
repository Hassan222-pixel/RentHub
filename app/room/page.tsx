"use client";

import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";

export default function RoomPage() {
  return (
    <div className="main-layout">
      <TemplateHeader />

      {/* PAGE TITLE */}
      <div className="back_re">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="title">
                <h2>Our Rooms</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROOM SECTION */}
      <div className="our_room">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="titlepage">
                <h2>Our Room</h2>
                <p>Lorem Ipsum available, but the majority have suffered</p>
              </div>
            </div>
          </div>

          <div className="row">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="col-md-4 col-sm-6">
                <div id="serv_hover" className="room">
                  <div className="room_img">
                    <figure>
                      <img
                        src={`/template/images/room${num}.jpg`}
                        alt={`Room ${num}`}
                      />
                    </figure>
                  </div>
                  <div className="bed_room">
                    <h3>Bed Room</h3>
                    <p>
                      If you are going to use a passage of Lorem Ipsum, you need
                      to be sure there
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
