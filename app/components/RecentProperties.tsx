import Link from "next/link";
import type { CSSProperties } from "react";
import "./recent-properties.css";

export type PropertyCard = {
  id?: string;
  title: string;
  city: string;
  price: string;
  badge?: string;
  image: string;
  href?: string;

  bedsLabel?: string;

  // ✅ NEW
  availableFromLabel?: string;

  genderLabel?: string;
};

type Props = {
  properties?: PropertyCard[];
  title?: string;
  subtitle?: string;
  showButton?: boolean;
};

export default function RecentProperties({
  properties,
  title,
  subtitle,
  showButton = true,
}: Props) {
  const list = properties && properties.length > 0 ? properties : [];

  // return (
  //   <section className="recent-section">
  //     <div className="recent-container">
  //       <div className="recent-header">
  //         <h2>{title ?? "Recent Properties"}</h2>
  //         <p>
  //           {subtitle ??
  //             "Find your dream home from our recently added listings."}
  //         </p>
  //       </div>

  //       <div className="recent-grid">
  //         {list.map((p, index) => {
  //           const key = p.id ?? index;

  //           const isNotAvailable = p.badge === "Not available";
  //           const isAvailable = p.badge === "Available";

  //           const badgeStyle: CSSProperties = {};
  //           if (isNotAvailable) {
  //             badgeStyle.backgroundColor = "#dc3545";
  //             badgeStyle.color = "#ffffff";
  //           } else if (isAvailable) {
  //             badgeStyle.backgroundColor = "#198754";
  //             badgeStyle.color = "#ffffff";
  //           }

  //           const showFooter =
  //             !!p.bedsLabel || !!p.availableFromLabel || !!p.genderLabel;

  //           const card = (
  //             <div className="property-card">
  //               <div
  //                 className="property-image"
  //                 style={{ backgroundImage: `url(${p.image})` }}
  //               >
  //                 {p.badge && (
  //                   <span className="property-badge" style={badgeStyle}>
  //                     {p.badge}
  //                   </span>
  //                 )}
  //               </div>

  //               <div className="property-info">
  //                 <div className="title-price-row">
  //                   <h3>{p.title}</h3>
  //                   <span className="property-price-inline">{p.price}</span>
  //                 </div>
  //                 <p className="property-city">{p.city}</p>
  //               </div>

  //               {showFooter && (
  //                 <div className="property-footer">
  //                   <span>{p.bedsLabel ?? ""}</span>

  //                   <span
  //                     style={{
  //                       flex: 1,
  //                       textAlign: "center",
  //                       fontSize: 12,
  //                       fontWeight: 700,
  //                       opacity: 0.9,
  //                     }}
  //                   >
  //                     {p.availableFromLabel ?? ""}
  //                   </span>

  //                   <span style={{ textAlign: "right" }}>
  //                     {p.genderLabel ?? ""}
  //                   </span>
  //                 </div>
  //               )}
  //             </div>
  //           );

  //           return p.href ? (
  //             <Link key={key} href={p.href} className="property-link-wrapper">
  //               {card}
  //             </Link>
  //           ) : (
  //             <div key={key}>{card}</div>
  //           );
  //         })}
  //       </div>

  //       {showButton && (
  //         <div className="recent-footer">
  //           <button className="see-more-btn">SEE MORE</button>
  //         </div>
  //       )}
  //     </div>
  //   </section>
  // );
}
