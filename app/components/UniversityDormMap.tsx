// app/components/UniversityDormMap.tsx
"use client";

import { useEffect, useRef } from "react";
import type mapboxglType from "mapbox-gl";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

type Coords = { lat: number; lng: number };

type Props = {
  universityName: string;
  dormTitle: string;
  universityCoords: Coords;
  dormCoords: Coords;
};

export default function UniversityDormMap({
  universityName,
  dormTitle,
  universityCoords,
  dormCoords,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.warn("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      return;
    }
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    (async () => {
      const mapboxgl = (await import("mapbox-gl"))
        .default as typeof mapboxglType;

      mapboxgl.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current as HTMLDivElement,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [universityCoords.lng, universityCoords.lat],
        zoom: 12,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.on("load", () => {
        // Markers
        new mapboxgl.Marker({ color: "#0b74de" })
          .setLngLat([universityCoords.lng, universityCoords.lat])
          .setPopup(new mapboxgl.Popup().setText(universityName))
          .addTo(map);

        new mapboxgl.Marker({ color: "#24a148" })
          .setLngLat([dormCoords.lng, dormCoords.lat])
          .setPopup(new mapboxgl.Popup().setText(dormTitle))
          .addTo(map);

        // ✅ Properly typed GeoJSON Feature (must include properties)
        const lineFeature: GeoJSON.Feature<GeoJSON.LineString> = {
          type: "Feature",
          properties: {}, // ✅ required by types
          geometry: {
            type: "LineString",
            coordinates: [
              [universityCoords.lng, universityCoords.lat],
              [dormCoords.lng, dormCoords.lat],
            ] as [number, number][],
          },
        };

        map.addSource("uni-dorm-line", {
          type: "geojson",
          data: lineFeature,
        });

        map.addLayer({
          id: "uni-dorm-line-layer",
          type: "line",
          source: "uni-dorm-line",
          paint: {
            "line-width": 4,
            "line-color": "#1f74ff",
          },
        });

        // Fit bounds
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([universityCoords.lng, universityCoords.lat]);
        bounds.extend([dormCoords.lng, dormCoords.lat]);
        map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
      });

      mapRef.current = map;
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [universityName, dormTitle, universityCoords, dormCoords]);

  return <div ref={mapContainerRef} className="uni-dorm-map-container" />;
}
