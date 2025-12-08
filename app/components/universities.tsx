import "./universities.css";

export default function Universities() {
  return (
    <section className="home-cities">
      <h2>Universities</h2>
      <p>Find rooms near these universities</p>

      <div className="cities-grid">

        <div className="city-card">
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/LIU_campus.jpg" />
          <span className="city-label">LIU</span>
        </div>

        <div className="city-card">
          <img src="https://www.aub.edu.lb/Style%20Library/aub_website/images/aub-campus.jpg" />
          <span className="city-label">AUB</span>
        </div>

        <div className="city-card">
          <img src="https://bau.edu.lb/BAU/media/Images/BAU-CAMPUS.jpg" />
          <span className="city-label">BAU</span>
        </div>

        <div className="city-card">
          <img src="https://www.lau.edu.lb/images/campuses/beirut/1.jpg" />
          <span className="city-label">LAU</span>
        </div>

      </div>
    </section>
  );
}
