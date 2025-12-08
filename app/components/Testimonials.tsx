import "./testimonials.css";

const testimonials = [
  {
    message: "Amazing home for me",
    author: "Diane Smith",
  },
  {
    message: "Friendly Realtors",
    author: "Michael Duncan",
  },
  {
    message: "Very good communication",
    author: "Shawn Gaines",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">

        <h2>What our clients say</h2>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <p className="testimonial-message">"{t.message}"</p>
              <p className="testimonial-author">— {t.author}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
