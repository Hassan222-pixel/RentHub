import "./footer.css";
import Image from "next/image";
import Link from "next/link";

export default function TemplateFooter() {
  return (
    <footer className="footer">

      {/* Main Blue Section */}
      <div className="footer-top">
        <div className="footer-top-content">

          {/* Left: Logo + Description */}
          <div className="footer-left">
            <h2 className="footer-logo">bluesky</h2>
            <p>
              Donec in tempus leo. Aenean ultricies mauris sed quam lacinia 
              lobortis. Cras ut vestibulum enim, in gravida nulla. Curabitur 
              ornare nisl at sagittis cursus.
            </p>
          </div>

          {/* Right: Latest Properties */}
          <div className="footer-right">
            <h3>Latest Properties</h3>

            <div className="footer-properties">
              <div className="property-item">
                <p>Miami</p>
                <span>Sea view property</span>
                <strong>$ 1.234.981</strong>
              </div>

              <div className="property-item">
                <p>Miami</p>
                <span>Town House</span>
                <strong>$ 1.234.981</strong>
              </div>

              <div className="property-item">
                <p>Miami</p>
                <span>Modern House</span>
                <strong>$ 1.234.981</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

     

    </footer>
  );
}
