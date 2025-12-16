import "./why-choose-renthub.css";
import {
  FaUniversity,
  FaMoneyBillWave,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaComments,
  FaClock,
  FaHome,
  FaShieldAlt,
} from "react-icons/fa";

const features = [
  {
    icon: <FaUniversity />,
    title: "Near Top Universities",
    text: "Find rooms close to AUB, LAU, LIU, NDU, USEK, and more.",
  },
  {
    icon: <FaMoneyBillWave />,
    title: "Student-Friendly Prices",
    text: "Affordable options designed for student budgets.",
  },
  {
    icon: <FaCheckCircle />,
    title: "Verified Listings",
    text: "Trusted landlords and carefully reviewed properties.",
  },
  {
    icon: <FaMapMarkerAlt />,
    title: "Prime Locations",
    text: "Live close to campuses, transport, and daily essentials.",
  },
  {
    icon: <FaComments />,
    title: "Easy Communication",
    text: "Contact landlords directly with no middlemen.",
  },
  {
    icon: <FaClock />,
    title: "Save Time",
    text: "Find the right room quickly without endless searching.",
  },
  {
    icon: <FaHome />,
    title: "Flexible Room Options",
    text: "Single, shared, and private rooms to fit your needs.",
  },
  {
    icon: <FaShieldAlt />,
    title: "Safe & Reliable",
    text: "We prioritize student safety and trusted housing.",
  },
];

const WhyChooseRentHub = () => {
  return (
    <section className="why-renthub">
      <h2>Why Choose RentHub?</h2>
      <p className="subtitle">
        Everything you need to find the perfect student home
      </p>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseRentHub;
