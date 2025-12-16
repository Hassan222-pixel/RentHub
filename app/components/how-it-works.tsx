import "./how-it-works.css";
import { FaSearch, FaHome, FaPhoneAlt } from "react-icons/fa";

const steps = [
  {
    icon: <FaSearch />,
    title: "Search",
    text: "Search for rooms by city or university that match your budget.",
  },
  {
    icon: <FaHome />,
    title: "Choose",
    text: "Browse available rooms and select the one that fits your needs.",
  },
  {
    icon: <FaPhoneAlt />,
    title: "Contact",
    text: "Contact the landlord directly and secure your new home.",
  },
];

const HowItWorks = () => {
  return (
    <section className="how-it-works">
      <h2>How RentHub Works</h2>
      <p className="subtitle">
        Find your student home in just three simple steps
      </p>

      <div className="steps-grid">
        {steps.map((step, index) => (
          <div className="step-card" key={index}>
            <div className="step-number">{index + 1}</div>
            <div className="icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
