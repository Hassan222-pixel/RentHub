import "./hero-search.css";

export default function HeroSearch() {
  return (
    <div className="search-box-full">
      <select>
        <option>For rent</option>
        <option>For sale</option>
      </select>

      <select>
        <option>All types</option>
      </select>

      <select>
        <option>City</option>
      </select>

      <select>
        <option>Bedrooms</option>
      </select>

      <select>
        <option>Bathrooms</option>
      </select>

      <button className="search-btn">SEARCH</button>
    </div>
  );
}
