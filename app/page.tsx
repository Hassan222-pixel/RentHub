"use client";

export default function HomePage() {
  return (
    <div>

      {/* ================= NAVBAR ================= */}
      <header>
        <div className="header">
          <div className="container">
            <div className="row">

              {/* Logo */}
              <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 logo_section">
                <div className="full">
                  <div className="center-desk">
                    <div className="logo">
                      <a href="/">
                        <img src="/template/images/logo.png" alt="Logo" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="col-xl-9 col-lg-9 col-md-9 col-sm-9">
                <nav className="navigation navbar navbar-expand-md navbar-dark">
                  <button
                    className="navbar-toggler"
                    type="button"
                    data-toggle="collapse"
                    data-target="#navbarsExample04"
                    aria-controls="navbarsExample04"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>

                  <div className="collapse navbar-collapse" id="navbarsExample04">
                    <ul className="navbar-nav mr-auto">
                      <li className="nav-item active">
                        <a className="nav-link" href="/">Home</a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="/about">About</a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="/room">Our Room</a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="/gallery">Gallery</a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="/blog">Blog</a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="/contact">Contact Us</a>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

            </div>
          </div>
        </div>
      </header>
      {/* ================= END NAVBAR ================= */}



      {/* ================= BANNER / HERO SECTION ================= */}
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

        {/* Booking Box */}
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
      {/* ================= END BANNER / HERO SECTION ================= */}



      {/* ================= ABOUT SECTION ================= */}
      <div className="about">
        <div className="container-fluid">
          <div className="row">

            {/* Text */}
            <div className="col-md-5">
              <div className="titlepage">
                <h2>About Us</h2>
                <p>
                  The passage experienced a surge in popularity during the 1960s when Letraset used it
                  on their dry-transfer sheets, and again during the 90s as desktop publishers bundled
                  the text with their software. Today it's seen all around the web; on templates,
                  websites, and stock designs.
                </p>
                <a className="read_more" href="#">Read More</a>
              </div>
            </div>

            {/* Image */}
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
      {/* ================= END ABOUT SECTION ================= */}



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
                      <img src={`/template/images/room${num}.jpg`} alt={`Room ${num}`} />
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
      {/* ================= END OUR ROOM SECTION ================= */}



      {/* ================= GALLERY SECTION ================= */}
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
      {/* ================= END GALLERY SECTION ================= */}

            {/* ================= BLOG SECTION ================= */}
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

      {/* Blog 1 */}
      <div className="col-md-4">
        <div className="blog_box">
          <div className="blog_img">
            <figure>
              <img src="/template/images/blog1.jpg" alt="Blog 1" />
            </figure>
          </div>
          <div className="blog_room">
            <h3>Bed Room</h3>
            <span>The standard chunk</span>
            <p>
              If you are going to use a passage of Lorem Ipsum, you need to be
              sure there isn't anything embarrassing hidden in the middle of text.
            </p>
          </div>
        </div>
      </div>

      {/* Blog 2 */}
      <div className="col-md-4">
        <div className="blog_box">
          <div className="blog_img">
            <figure>
              <img src="/template/images/blog2.jpg" alt="Blog 2" />
            </figure>
          </div>
          <div className="blog_room">
            <h3>Bed Room</h3>
            <span>The standard chunk</span>
            <p>
              If you are going to use a passage of Lorem Ipsum, you need to be
              sure there isn't anything embarrassing hidden in the middle of text.
            </p>
          </div>
        </div>
      </div>

      {/* Blog 3 */}
      <div className="col-md-4">
        <div className="blog_box">
          <div className="blog_img">
            <figure>
              <img src="/template/images/blog3.jpg" alt="Blog 3" />
            </figure>
          </div>
          <div className="blog_room">
            <h3>Bed Room</h3>
            <span>The standard chunk</span>
            <p>
              If you are going to use a passage of Lorem Ipsum, you need to be
              sure there isn't anything embarrassing hidden in the middle of text.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
{/* ================= END BLOG SECTION ================= */}

            {/* ================= CONTACT SECTION ================= */}
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

      {/* Contact Form */}
      <div className="col-md-6">
        <form id="request" className="main_form">
          <div className="row">

            <div className="col-md-12">
              <input
                className="contactus"
                placeholder="Name"
                type="text"
                name="Name"
              />
            </div>

            <div className="col-md-12">
              <input
                className="contactus"
                placeholder="Email"
                type="email"
                name="Email"
              />
            </div>

            <div className="col-md-12">
              <input
                className="contactus"
                placeholder="Phone Number"
                type="text"
                name="Phone"
              />
            </div>

            <div className="col-md-12">
              <textarea
                className="textarea"
                placeholder="Message"
                name="Message"
                defaultValue=""
              />
            </div>

            <div className="col-md-12">
              <button className="send_btn" type="button">
                Send
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* Google Map */}
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
{/* ================= END CONTACT SECTION ================= */}

      {/* ================= FOOTER SECTION ================= */}
<footer>
  <div className="footer">
    <div className="container">
      <div className="row">

        {/* Contact Us */}
        <div className="col-md-4">
          <h3>Contact US</h3>
          <ul className="conta">
            <li>
              <i className="fa fa-map-marker" aria-hidden="true"></i> Address
            </li>
            <li>
              <i className="fa fa-mobile" aria-hidden="true"></i> +01 1234569540
            </li>
            <li>
              <i className="fa fa-envelope" aria-hidden="true"></i>
              <a href="#"> demo@gmail.com</a>
            </li>
          </ul>
        </div>

        {/* Menu Links */}
        <div className="col-md-4">
          <h3>Menu Link</h3>
          <ul className="link_menu">
            <li className="active">
              <a href="#">Home</a>
            </li>
            <li>
              <a href="about.html">About</a>
            </li>
            <li>
              <a href="room.html">Our Room</a>
            </li>
            <li>
              <a href="gallery.html">Gallery</a>
            </li>
            <li>
              <a href="blog.html">Blog</a>
            </li>
            <li>
              <a href="contact.html">Contact Us</a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="col-md-4">
          <h3>News letter</h3>
          <form className="bottom_form">
            <input
              className="enter"
              placeholder="Enter your email"
              type="text"
              name="email"
            />
            <button className="sub_btn">Subscribe</button>
          </form>
          <ul className="social_icon">
            <li>
              <a href="#">
                <i className="fa fa-facebook" aria-hidden="true"></i>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fa fa-twitter" aria-hidden="true"></i>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fa fa-linkedin" aria-hidden="true"></i>
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fa fa-youtube-play" aria-hidden="true"></i>
              </a>
            </li>
          </ul>
        </div>

      </div>
    </div>

    {/* Copyright */}
    <div className="copyright">
      <div className="container">
        <div className="row">
          <div className="col-md-10 offset-md-1">
            <p>
              © 2019 All Rights Reserved. Design by{" "}
              <a href="https://html.design/">Free Html Templates</a>
              <br />
              <br />
              Distributed by{" "}
              <a href="https://themewagon.com/" target="_blank">
                ThemeWagon
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</footer>
{/* ================= END FOOTER SECTION ================= */}

    </div>
  );
}
