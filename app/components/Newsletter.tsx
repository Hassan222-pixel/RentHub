import "./newsletter.css";

export default function Newsletter() {
  return (
    <section className="newsletter-section">
      <div className="newsletter-container">

        <h2>Are you buying or selling?</h2>

        <div className="newsletter-box">
          <input type="email" placeholder="Your email address" />
          <button>SUBSCRIBE NOW</button>
        </div>

      </div>
    </section>
  );
}
