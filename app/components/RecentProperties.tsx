import Link from "next/link";
import "./recent-properties.css";

export type PropertyCard = {
  id?: string;
  title: string;
  city: string;
  price: string;
  badge?: string;
  image: string;
  href?: string; // optional link to details page
};

const defaultProperties: PropertyCard[] = [
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

type Props = {
  properties?: PropertyCard[];
  title?: string;
  subtitle?: string;
  showButton?: boolean;
};

export default function RecentProperties({
  properties,
  title,
  subtitle,
  showButton = true,
}: Props) {
  const list = properties && properties.length > 0 ? properties : defaultProperties;

  return (
    <section className="recent-section">
      <div className="recent-container">
        <div className="recent-header">
          <h2>{title ?? "Recent Properties"}</h2>
          <p>
            {subtitle ??
              "Find your dream home from our recently added listings."}
          </p>
        </div>

        <div className="recent-grid">
          {list.map((p, index) => {
            const card = (
              <div className="property-card">
                <div
                  className="property-image"
                  style={{ backgroundImage: `url(${p.image})` }}
                >
                  {p.badge && (
                    <span className="property-badge">{p.badge}</span>
                  )}
                </div>

                <div className="property-info">
                  <h3>{p.title}</h3>
                  <p className="property-city">{p.city}</p>
                  <p className="property-price">{p.price}</p>
                </div>
              </div>
            );

            const key = p.id ?? index;

            return p.href ? (
              <Link
                key={key}
                href={p.href}
                className="property-link-wrapper"
              >
                {card}
              </Link>
            ) : (
              <div key={key}>{card}</div>
            );
          })}
        </div>

        {showButton && (
          <div className="recent-footer">
            <button className="see-more-btn">SEE MORE</button>
          </div>
        )}
      </div>
    </section>
  );
}
