import "./hero.css";

export default function Hero() {
  return (
    <section
      className="hero"
      style={{
        backgroundImage:
          `url("https://images.unsplash.com/photo-1507089947368-19c1da9775ae")`,
      }}
    >
      <div className="hero-overlay">
        <div className="hero-content">

          <span className="offer-tag">SUPER OFFER</span>

          <h1 className="hero-title">Villa with sea view</h1>

          <p className="hero-price">$1,245,999</p>

          {/* Search Section */}
          <div className="search-box">

            <select>
              <option>For rent</option>
              <option>For sale</option>
            </select>

            <select>
              <option>All types</option>
              <option>Apartment</option>
              <option>House</option>
              <option>Studio</option>
            </select>

            <select>
              <option>City</option>
              <option>Miami</option>
              <option>Los Angeles</option>
              <option>Florida</option>
            </select>

            <button className="search-btn">SEARCH</button>
          </div>

        </div>
      </div>
    </section>
  );
}
