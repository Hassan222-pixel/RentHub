"use client";

import { useEffect, useState } from "react";
import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";

/* ---------------- HERO TYPES ---------------- */
type HeroContent = {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  buttonText?: string;
};

const defaultHero: HeroContent = {
  title: "Book a Room Online",
  subtitle:
    "The passage experienced a surge in popularity when desktop publishers bundled it with their software.",
  backgroundImage: "/template/images/banner1.jpg",
  buttonText: "Book Now",
};

/* ---------------- ABOUT TYPES ---------------- */
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

export default function HomePage() {
  const [hero, setHero] = useState<HeroContent>(defaultHero);
  const [about, setAbout] = useState<AboutData>(defaultAbout);

  /* ---------------- LOAD HERO ---------------- */
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await fetch("/api/hero");
        if (!res.ok) return;
        const data = await res.json();
        setHero((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error("Failed to load hero content:", err);
      }
    };

    fetchHero();
  }, []);

  /* ---------------- LOAD ABOUT ---------------- */
  useEffect(() => {
    const fetchAbout = async () => {
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
        console.error("Failed to load about:", err);
      }
    };

    fetchAbout();
  }, []);

  return (
    <div className="main-layout">

      {/* ================= HEADER ================= */}
      <TemplateHeader />

      {/* ================= HERO ================= */}
      <section className="banner_main">
        <div id="myCarousel" className="carousel slide banner">
          <ol className="carousel-indicators">
            <li data-target="#myCarousel" data-slide-to="0" className="active"></li>
            <li data-target="#myCarousel" data-slide-to="1"></li>
            <li data-target="#myCarousel" data-slide-to="2"></li>
          </ol>

          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                className="first-slide"
                src={hero.backgroundImage || "/template/images/banner1.jpg"}
                alt="Banner 1"
              />
            </div>
            <div className="carousel-item">
              <img
                className="second-slide"
                src="/template/images/banner2.jpg"
                alt="Banner 2"
              />
            </div>
            <div className="carousel-item">
              <img
                className="third-slide"
                src="/template/images/banner3.jpg"
                alt="Banner 3"
              />
            </div>
          </div>
        </div>

        <div className="booking_ocline">
          <div className="container">
            <div className="row">
              <div className="col-md-5">

                <div className="book_room">
                  <h1>{hero.title}</h1>

                  <form className="book_now">
                    <div className="row">
                      <div className="col-md-12">
                        <span>Arrival</span>
                        <img className="date_cua" src="/template/images/date.png" alt="Date" />
                        <input className="online_book" type="date" />
                      </div>

                      <div className="col-md-12">
                        <span>Departure</span>
                        <img className="date_cua" src="/template/images/date.png" alt="Date" />
                        <input className="online_book" type="date" />
                      </div>

                      <div className="col-md-12">
                        <button type="button" className="book_btn">
                          {hero.subtitle || "Book Now"}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT (DYNAMIC) ================= */}
      <div className="about">
        <div className="container-fluid">
          <div className="row">

            <div className="col-md-5">
              <div className="titlepage">
                <h2>{about.title}</h2>
                <p>{about.content}</p>
                <a className="read_more" href="/about">{about.buttonText}</a>
              </div>
            </div>

            <div className="col-md-7">
              <div className="about_img">
                <figure>
                  <img
                    src={about.imageUrl || "/template/images/about.png"}
                    alt="About"
                  />
                </figure>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= OUR ROOM SECTION ================= */}
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
                    <p>If you are going to use a passage of Lorem Ipsum, you need to be sure there</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ================= GALLERY ================= */}
      <div className="gallery">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="titlepage">
                <h2>Gallery</h2>
              </div>
            </div>
          </div>

          <div className="row">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div key={num} className="col-md-3 col-sm-6">
                <div className="gallery_img">
                  <figure>
                    <img src={`/template/images/gallery${num}.jpg`} alt={`Gallery ${num}`} />
                  </figure>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= BLOG ================= */}
      <div className="blog">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="titlepage">
                <h2>Blog</h2>
                <p>Lorem Ipsum available, but the majority have suffered</p>
              </div>
            </div>
          </div>

          <div className="row">
            {[1, 2, 3].map((num) => (
              <div key={num} className="col-md-4">
                <div className="blog_box">
                  <div className="blog_img">
                    <figure>
                      <img src={`/template/images/blog${num}.jpg`} alt={`Blog ${num}`} />
                    </figure>
                  </div>
                  <div className="blog_room">
                    <h3>Bed Room</h3>
                    <span>The standard chunk</span>
                    <p>
                      If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't
                      anything embarrassing hidden in the middle of text.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ================= CONTACT ================= */}
      <div className="contact">
        <div className="container">

          <div className="row">
            <div className="col-md-12">
              <div className="titlepage">
                <h2>Contact Us</h2>
              </div>
            </div>
          </div>

          <div className="row">

            <div className="col-md-6">
              <form className="main_form">
                <div className="row">
                  <div className="col-md-12"><input className="contactus" placeholder="Name" type="text" /></div>
                  <div className="col-md-12"><input className="contactus" placeholder="Email" type="email" /></div>
                  <div className="col-md-12"><input className="contactus" placeholder="Phone Number" type="text" /></div>
                  <div className="col-md-12"><textarea className="textarea" placeholder="Message"></textarea></div>
                  <div className="col-md-12"><button className="send_btn" type="button">Send</button></div>
                </div>
              </form>
            </div>

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

      {/* ================= FOOTER ================= */}
      <TemplateFooter />

    </div>
  );
}
