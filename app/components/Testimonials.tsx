import "./testimonials.css";

const testimonials = [
  {
    name: "Ahmad Khalil",
    university: "AUB Student",
    text: "I found a fully furnished room just 5 minutes from AUB in less than a week. RentHub made everything easy.",
  },
  {
    name: "Rita Saad",
    university: "LAU Student",
    text: "The listings were clear and affordable. I contacted the landlord directly and moved in quickly.",
  },
  {
    name: "Mohammad Ali",
    university: "LIU Student",
    text: "RentHub helped me find a clean and budget-friendly room near my university without any stress.",
  },
];

const Testimonials = () => {
  return (
    <section className="testimonials">
      <h2>What Students Say</h2>
      <p className="subtitle">
        Real experiences from students who found their home with RentHub
      </p>

      <div className="testimonials-grid">
        {testimonials.map((item, index) => (
          <div className="testimonial-card" key={index}>
            <p className="testimonial-text">“{item.text}”</p>
            <h4>{item.name}</h4>
            <span>{item.university}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
