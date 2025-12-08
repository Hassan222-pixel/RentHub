import TemplateHeader from "@/app/components/TemplateHeader";
import TemplateFooter from "@/app/components/TemplateFooter";
import { connectToDatabase } from "@/lib/mongodb";
import { Dorm } from "@/models/Dorm";
import RoomFilterList from "@/app/room/RoomFilterList";

export default async function HomePage() {
  await connectToDatabase();

  // Load all active dorms
  const dormDocs = await Dorm.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  const dorms = dormDocs.map((d: any) => ({
    _id: d._id.toString(),
    title: d.title,
    description: d.description,
    profileImg: d.profileImg || null,
    roomType: d.roomType || null,
    city: d.city || "",
    university: d.university || "",
    pricePerNight: d.pricePerNight ?? null,
    pricePerWeek: d.pricePerWeek ?? null,
    pricePerMonth: d.pricePerMonth ?? null,
  }));

  // Get unique cities + universities
  const uniqueCities = [...new Set(dorms.map((d) => d.city).filter(Boolean))];
  const uniqueUniversities = [...new Set(dorms.map((d) => d.university).filter(Boolean))];

  return (
    <div className="main-layout">

      {/* ================= HEADER ================= */}
      <TemplateHeader />

      {/* ================= HERO SECTION ================= */}
      <section className="banner_main">
        <div id="myCarousel" className="carousel slide banner">
          <ol className="carousel-indicators">
            <li data-target="#myCarousel" data-slide-to="0" className="active"></li>
            <li data-target="#myCarousel" data-slide-to="1"></li>
            <li data-target="#myCarousel" data-slide-to="2"></li>
          </ol>

          <div className="carousel-inner">
            <div className="carousel-item active">
              <img className="first-slide" src="/template/images/banner1.jpg" alt="Banner 1" />
            </div>
            <div className="carousel-item">
              <img className="second-slide" src="/template/images/banner2.jpg" alt="Banner 2" />
            </div>
            <div className="carousel-item">
              <img className="third-slide" src="/template/images/banner3.jpg" alt="Banner 3" />
            </div>
          </div>
        </div>

        <div className="booking_ocline">
          <div className="container">
            <div className="row">
              <div className="col-md-5">
                <div className="book_room">
                  <h1>Book a Room Online</h1>

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
                        <button type="button" className="book_btn">Book Now</button>
                      </div>
                    </div>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <div className="about">
        <div className="container-fluid">
          <div className="row">

            <div className="col-md-5">
              <div className="titlepage">
                <h2>About Us</h2>
                <p>
                  The passage experienced a surge in popularity during the 1960s when Letraset used it
                  on their dry-transfer sheets, and again during the 90s as desktop publishers bundled
                  the text with their software.
                </p>
                <a className="read_more" href="/about">Read More</a>
              </div>
            </div>

            <div className="col-md-7">
              <div className="about_img">
                <figure>
                  <img src="/template/images/about.png" alt="About" />
                </figure>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= OUR ROOMS SECTION (REAL DATA) ================= */}
      <div className="our_room" style={{ marginTop: "40px" }}>
        <div className="container">

          <div className="row">
            <div className="col-md-12">
              <div className="titlepage">
                <h2>Our Rooms</h2>
                <p>Browse all available dormitories</p>
              </div>
            </div>
          </div>

          <RoomFilterList initialDorms={dorms} />
        </div>
      </div>

      {/* ================= OUR CITIES ================= */}
      <div className="our_room" style={{ marginTop: "70px" }}>
        <div className="container">

          <div className="titlepage text-center mb-4">
            <h2>Our Cities</h2>
            <p>Select a city to explore available dorms</p>
          </div>

          <div className="row">
            {uniqueCities.map((city) => (
              <div key={city} className="col-md-4 col-sm-6 mb-4">
                <div className="room city_card">
                  <div className="bed_room text-center p-4">
                    <h3>{city}</h3>
                    <p>View all dormitories located in {city}</p>
                    <a href={`/city/${city}`} className="read_more">View City</a>
                  </div>
                </div>
              </div>
            ))}

            {uniqueCities.length === 0 && (
              <p className="text-center w-100">No cities available yet.</p>
            )}
          </div>

        </div>
      </div>

      {/* ================= OUR UNIVERSITIES ================= */}
      <div className="our_room" style={{ marginTop: "70px" }}>
        <div className="container">

          <div className="titlepage text-center mb-4">
            <h2>Our Universities</h2>
            <p>Select a university to view nearby dormitories</p>
          </div>

          <div className="row">
            {uniqueUniversities.map((univ) => (
              <div key={univ} className="col-md-4 col-sm-6 mb-4">
                <div className="room city_card">
                  <div className="bed_room text-center p-4">
                    <h3>{univ}</h3>
                    <p>Dormitories near {univ}</p>
                    <a href={`/university/${univ}`} className="read_more">View University</a>
                  </div>
                </div>
              </div>
            ))}

            {uniqueUniversities.length === 0 && (
              <p className="text-center w-100">No universities available yet.</p>
            )}
          </div>

        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <TemplateFooter />

    </div>
  );
}
