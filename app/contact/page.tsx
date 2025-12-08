import "../contact/contact.css";
import HeroSearch from "../components/Herosearch";
import Newsletter from "../components/Newsletter";

export default function ContactPage() {
  return (
    <main className="contact-wrapper">

      {/* HERO SECTION */}
      <div className="contact-hero">
        <div className="contact-hero-overlay">

          <h1>Contact</h1>
          <p className="breadcrumb">Home / Contact</p>

          <div className="hero-search-container">
            <HeroSearch />
          </div>

        </div>
      </div>

      {/* CONTACT CONTENT */}
      <section className="contact-section">
        
        {/* LEFT COLUMN */}
        <div className="contact-left">
          <h2>Get in touch with us</h2>
          <p className="subtitle">Say hello</p>

          <p className="contact-text">
            Donec ullamcorper nulla non metus auctor fringilla. Curabitur blandit tempus porttitor.
            Sed lectus urna, ultricies sit amet risus eget, euismod imperdiet augue.
          </p>

          <p className="contact-text">
            <strong>Address:</strong><br />
            1481 Creekside Lane Avila Beach, CA 93424
          </p>

          <p className="contact-text">
            <strong>Phone:</strong><br />
            +53 345 7953 32453
          </p>

          <p className="contact-text">
            <strong>Email:</strong><br />
            yourmail@gmail.com
          </p>
        </div>

        {/* RIGHT COLUMN — FORM */}
        <form className="contact-form">
          
          <div className="row">
            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="E-mail" required />
          </div>

          <input className="subject-input" type="text" placeholder="Subject" required />

          <textarea placeholder="Message" required></textarea>

          <button type="submit" className="send-btn">SEND</button>
        </form>

      </section>

      {/* GOOGLE MAPS */}
      <section className="map-section">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d423287.7558192953!2d-118.69192043476312!3d34.0201613063695!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c0bf83b6a5f9%3A0x94e558577d975da2!2sLos%20Angeles%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000"
          width="100%"
          height="450"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>

      <Newsletter />

    </main>
  );
}
