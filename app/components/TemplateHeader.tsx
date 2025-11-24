"use client";

export default function TemplateHeader() {
  return (
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
                >
                  <span className="navbar-toggler-icon"></span>
                </button>

                <div
                  className="collapse navbar-collapse"
                  id="navbarsExample04"
                >
                  <ul className="navbar-nav mr-auto">

                    <li className="nav-item">
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
  );
}
