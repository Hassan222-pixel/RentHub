import "./stats.css";
import {
  FaUserGraduate,
  FaHome,
  FaUniversity,
  FaStar,
} from "react-icons/fa";

const stats = [
  {
    icon: <FaUserGraduate />,
    value: "800+",
    label: "Students Helped",
  },
  {
    icon: <FaHome />,
    value: "450+",
    label: "Available Rooms",
  },
  {
    icon: <FaUniversity />,
    value: "6",
    label: "Major Universities",
  },
  {
    icon: <FaStar />,
    value: "4.8",
    label: "Student Rating",
  },
];

const Stats = () => {
  return (
    <section className="stats-section">
      <div className="stats-container">
        {stats.map((stat, index) => (
          <div className="stat-box" key={index}>
            <div className="stat-icon">{stat.icon}</div>
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
