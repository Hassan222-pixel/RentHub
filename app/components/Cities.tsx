import "./cities.css";

const cities = [
  {
    name: "New York",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
  },
  {
    name: "Los Angeles",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764b7a",
  },
  {
    name: "Miami",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
  },
  {
    name: "San Francisco",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
  },
  {
    name: "Chicago",
    image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8",
  },
  {
    name: "Florida",
    image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80",
  },
];

export default function Cities() {
  return (
    <section className="cities-section">
      <div className="cities-container">
        <h2>Find properties in these cities</h2>

        <div className="cities-grid">
          {cities.map((city, i) => (
            <div key={i} className="city-card">
              <div
                className="city-image"
                style={{ backgroundImage: `url(${city.image})` }}
              />
              <div className="city-name">{city.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
