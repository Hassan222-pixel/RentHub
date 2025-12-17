/* eslint-disable @typescript-eslint/no-unused-vars */
// app/components/DirectionsButtons.tsx
"use client";

import { useState } from "react";
import {
  FaLocationArrow,
  FaUniversity,
  FaExternalLinkAlt,
} from "react-icons/fa";

type Coords = { lat: number; lng: number };

type Props = {
  universityName: string;
  universityCoords: Coords;
  dormTitle: string;
  dormCoords: Coords;
};

function googleDirectionsUrl(origin: string, destination: string) {
  // ✅ Uses Google Maps directions
  // origin/destination can be "lat,lng" or plain text
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

export default function DirectionsButtons({
  universityName,
  universityCoords,
  dormTitle,
  dormCoords,
}: Props) {
  const [locating, setLocating] = useState(false);

  const universityOrigin = `${universityCoords.lat},${universityCoords.lng}`;
  const dormDestination = `${dormCoords.lat},${dormCoords.lng}`;

  const openUniToDorm = () => {
    const url = googleDirectionsUrl(universityOrigin, dormDestination);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openMyToDorm = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser.");
      return;
    }

    try {
      setLocating(true);

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          })
      );

      const me = `${position.coords.latitude},${position.coords.longitude}`;
      const url = googleDirectionsUrl(me, dormDestination);

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      alert("Could not get your location. Please allow location permission.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="udm-actions">
      <button
        className="udm-btn udm-btn-primary"
        onClick={openMyToDorm}
        disabled={locating}
      >
        <FaLocationArrow />
        {locating ? "Getting location..." : "From my location"}
        <FaExternalLinkAlt className="udm-btn-icon-right" />
      </button>

      <button className="udm-btn udm-btn-secondary" onClick={openUniToDorm}>
        <FaUniversity />
        University → Dorm
        <FaExternalLinkAlt className="udm-btn-icon-right" />
      </button>

      <small className="udm-actions-hint">
        Opens Google Maps directions in a new tab.
      </small>
    </div>
  );
}
