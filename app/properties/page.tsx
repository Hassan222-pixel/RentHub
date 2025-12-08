import "../properties/properties.css";
import HeroSearch from "../components/Herosearch";
import Newsletter from "../components/Newsletter";

const properties = [
  {
    title: "Sea view property",
    city: "Miami",
    price: "$ 1.234.981",
    badge: "Featured",
    image: "https://preview.colorlib.com/theme/bluesky/img/p-1.jpg",
  },
  {
    title: "2 Floor Town House",
    city: "Los Angeles",
    price: "$ 1.234.981",
    badge: "Offer",
    image: "https://preview.colorlib.com/theme/bluesky/img/p-2.jpg",
  },
  {
    title: "Vacation Home",
    city: "Florida",
    price: "$ 1.234.981",
    badge: "Featured",
    image: "https://preview.colorlib.com/theme/bluesky/img/p-3.jpg",
  },
  {
    title: "Sea view property",
    city: "Miami",
    price: "$ 1.234.981",
    badge: "New",
    image: "https://preview.colorlib.com/theme/bluesky/img/p-4.jpg",
  },
  {
    title: "Sea view property",
    city: "New York",
    price: "$ 1.234.981",
    image: "https://preview.colorlib.com/theme/bluesky/img/p-5.jpg",
  },
  {
    title: "Sea view property",
    city: "Miami",
    price: "$ 1.234.981",
    image: "https://preview.colorlib.com/theme/bluesky/img/p-6.jpg",
  },
  {
    title: "Sea view property",
    city: "Miami",
    price: "$ 1.234.981",
    badge: "New",
    image: "https://preview.colorlib.com/theme/bluesky/img/p-7.jpg",
  },
  {
    title: "Sea view property",
    city: "San Francisco",
    price: "$ 1.234.981",
    image: "https://preview.colorlib.com/theme/bluesky/img/p-8.jpg",
  },
  {
    title: "Sea view property",
    city: "Miami",
    price: "$ 1.234.981",
    image: "https://preview.colorlib.com/theme/bluesky/img/p-9.jpg",
  },
];

export default function PropertiesPage() {
  return (
    <main className="properties-wrapper">
      
      {/* HERO IMAGE */}
      <div className="search-hero">
        <div className="search-hero-overlay">

          <h1>Search results</h1>
          <p className="breadcrumb">Home / Search Results</p>

          {/* SEARCH BAR EXACTLY LIKE TEMPLATE */}
          <div className="hero-search-container">
            <HeroSearch />
          </div>

        </div>
      </div>

      {/* RESULTS TITLE */}
      <div className="results-title">
        <h2>25 Properties found</h2>
        <p>Search your dream home</p>
      </div>

      {/* PROPERTY GRID */}
      <div className="property-grid">
        {properties.map((p, i) => (
          <div className="property-card" key={i}>
            
            <div
              className="property-img"
              style={{ backgroundImage: `url(${p.image})` }}
            >
              {p.badge && (
                <span className={`badge badge-${p.badge.toLowerCase()}`}>
                  {p.badge}
                </span>
              )}
            </div>

            <div className="property-info">
              <p className="city">{p.city}</p>
              <h3>{p.title}</h3>
              <p className="price">{p.price}</p>
            </div>

            <div className="property-footer">
              <span>📐 650 Ft²</span>
              <span>🛏 3 Bedrooms</span>
              <span>🛁 3 Bathrooms</span>
            </div>

          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <span>01.</span>
        <span>02.</span>
        <span>03.</span>
        <span>04.</span>
      </div>

      <Newsletter />
    </main>
  );
}
