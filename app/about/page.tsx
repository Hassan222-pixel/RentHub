import "../about/about.css";
import HeroSearch from "../components/Herosearch";
import Newsletter from "../components/Newsletter";

export default function AboutPage() {
  return (
    <main className="about-wrapper">

      {/* HERO SECTION */}
      <div className="about-hero">
        <div className="about-hero-overlay">

          <h1>About</h1>
          <p className="breadcrumb">Home / About us</p>

          <div className="hero-search-container">
            <HeroSearch />
          </div>

        </div>
      </div>

      {/* ABOUT MAIN SECTION */}
      <section className="about-section">

        {/* LEFT COLUMN TEXT */}
        <div className="about-left">
          <h2>A few words about us</h2>
          <p className="subtitle">Search your dream home</p>

          <p className="about-text">
            Etiam nec odio vestibulum est mattis effic iutur magna. Pellentesque sit amet tellus
            blandit. Etiam nec odio vestibulum est mattis effic iutur magna. Pellentesque sit amet
            tellus blandit. Etiam nec odio vestibulum est mattis effic iutur magna.
          </p>

          <p className="about-text">
            Cras ut vestibulum enim, in gravida nulla. Curabitur ornare nisl at sagittis cursus.
            Sed mattis, eros non vulputate luctus, erat dui dapibus augue, eu fringilla tortor
            ante id mi. Sed a enim libero. Vestibulum pharetra aliquam convallis.
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="about-right">
          <img
            src="https://preview.colorlib.com/theme/bluesky/img/about/about.jpg"
            alt="building"
          />
        </div>

      </section>

      {/* ICON STATS */}
      <section className="about-stats">
        <div className="stat">
          <img src="https://preview.colorlib.com/theme/bluesky/img/icons/ci-3.png" />
          <div>
            <h3>651</h3>
            <p>Properties Sold</p>
          </div>
        </div>

        <div className="stat">
          <img src="https://preview.colorlib.com/theme/bluesky/img/icons/ci-2.png" />
          <div>
            <h3>1256</h3>
            <p>Happy Clients</p>
          </div>
        </div>

        <div className="stat">
          <img src="https://preview.colorlib.com/theme/bluesky/img/icons/ci-4.png" />
          <div>
            <h3>124</h3>
            <p>Buildings Sold</p>
          </div>
        </div>

        <div className="stat">
          <img src="https://preview.colorlib.com/theme/bluesky/img/icons/ci-1.png" />
          <div>
            <h3>25</h3>
            <p>Awards Won</p>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="team-section">
        <h2>The Realtors</h2>
        <p className="subtitle">Search your dream home</p>

        <div className="team-grid">

          <div className="team-card">
            <img src="https://preview.colorlib.com/theme/bluesky/img/team/t1.jpg" />
            <h3>Maria Williams</h3>
            <p>Senior Realtor</p>
            <div className="circle-btn">+</div>
          </div>

          <div className="team-card">
            <img src="https://preview.colorlib.com/theme/bluesky/img/team/t2.jpg" />
            <h3>Christian Smith</h3>
            <p>Senior Realtor</p>
            <div className="circle-btn">+</div>
          </div>

          <div className="team-card">
            <img src="https://preview.colorlib.com/theme/bluesky/img/team/t3.jpg" />
            <h3>Steve G. Brown</h3>
            <p>Senior Realtor</p>
            <div className="circle-btn">+</div>
          </div>

          <div className="team-card">
            <img src="https://preview.colorlib.com/theme/bluesky/img/team/t4.jpg" />
            <h3>Jessica Walsh</h3>
            <p>Senior Realtor</p>
            <div className="circle-btn">+</div>
          </div>

        </div>
      </section>

      <Newsletter />
    </main>
  );
}
