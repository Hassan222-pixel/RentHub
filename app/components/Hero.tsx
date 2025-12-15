import "./hero.css";

interface HeroProps {
  data: {
    backgroundImage: string;
    highlightedH2: string;
    titleH1: string;
    subtitleH2: string;
  };
}

export default function Hero({ data }: HeroProps) {
  const { backgroundImage, highlightedH2, titleH1, subtitleH2 } = data;

  return (
    <section
      className="hero"
      style={{
        backgroundImage: `url("${backgroundImage}")`,
      }}
    >
      <div className="hero-overlay">
        <div className="hero-content">

          {/* Highlighted small H2 */}
          <span className="offer-tag">{highlightedH2}</span>

          {/* Main Title */}
          <h1 className="hero-title">{titleH1}</h1>

          {/* Subtitle */}
          <p className="hero-price">{subtitleH2}</p>

          {/* Search Section — UNCHANGED */}
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
