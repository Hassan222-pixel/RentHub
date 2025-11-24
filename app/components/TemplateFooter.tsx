"use client";

export default function TemplateFooter() {
  return (
    <footer>
      <div className="footer">
        <div className="container">
          <div className="row">

            {/* Contact */}
            <div className="col-md-4">
              <h3>Contact US</h3>
              <ul className="conta">
                <li><i className="fa fa-map-marker"></i> Address</li>
                <li><i className="fa fa-mobile"></i> +01 1234569540</li>
                <li>
                  <i className="fa fa-envelope"></i>
                  <a href="#"> demo@gmail.com</a>
                </li>
              </ul>
            </div>

            {/* Menu */}
            <div className="col-md-4">
              <h3>Menu Link</h3>
              <ul className="link_menu">
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/room">Our Room</a></li>
                <li><a href="/gallery">Gallery</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/contact">Contact Us</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="col-md-4">
              <h3>Newsletter</h3>
              <form className="bottom_form">
                <input
                  className="enter"
                  placeholder="Enter your email"
                  type="text"
                />
                <button className="sub_btn">subscribe</button>
              </form>
              <ul className="social_icon">
                <li><a href="#"><i className="fa fa-facebook"></i></a></li>
                <li><a href="#"><i className="fa fa-twitter"></i></a></li>
                <li><a href="#"><i className="fa fa-linkedin"></i></a></li>
                <li><a href="#"><i className="fa fa-youtube-play"></i></a></li>
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
  );
}
