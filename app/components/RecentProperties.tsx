import "./recent-properties.css";

type Property = {
  title: string;
  city: string;
  price: string;
  badge?: string;
  image: string;
};

const properties: Property[] = [
  {
    title: "Modern apartment",
    city: "Los Angeles, CA",
    price: "$1,200 / month",
    badge: "FOR RENT",
    image: "https://images.unsplash.com/photo-1523217582562-09d0def993a6",
  },
  {
    title: "Family house",
    city: "Miami, FL",
    price: "$320,000",
    badge: "FOR SALE",
    image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6",
  },
  {
    title: "Luxury villa",
    city: "Florida, FL",
    price: "$1,245,999",
    badge: "OFFER",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227",
  },
];

export default function RecentProperties() {
  return (
    <section className="recent-section">
      <div className="recent-container">
        <div className="recent-header">
          <h2>Recent Properties</h2>
          <p>Find your dream home from our recently added listings.</p>
        </div>

        <div className="recent-grid">
          {properties.map((p, index) => (
            <div key={index} className="property-card">
              <div
                className="property-image"
                style={{ backgroundImage: `url(${p.image})` }}
              >
                {p.badge && <span className="property-badge">{p.badge}</span>}
              </div>

              <div className="property-info">
                <h3>{p.title}</h3>
                <p className="property-city">{p.city}</p>
                <p className="property-price">{p.price}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="recent-footer">
          <button className="see-more-btn">SEE MORE</button>
        </div>
      </div>
    </section>
  );
}
