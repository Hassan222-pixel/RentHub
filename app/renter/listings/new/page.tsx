/* eslint-disable @typescript-eslint/no-explicit-any */
// app/renter/listings/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

type RoomType = "room" | "bed" | "studio" | "apartment" | "";
type RentalType = "daily" | "weekly" | "monthly" | "flexible" | "";
type GenderPreference = "any" | "male" | "female" | "";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  context?: { id: string; text: string }[];
}

export default function NewListingPage() {
  const router = useRouter();

  // BASIC FIELDS
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [university, setUniversity] = useState("");

  // ROOM DETAILS
  const [roomType, setRoomType] = useState<RoomType>("");
  const [maxOccupants, setMaxOccupants] = useState("");

  // PRICING
  const [pricePerNight, setPricePerNight] = useState("");
  const [pricePerWeek, setPricePerWeek] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState("");

  // AVAILABILITY
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [minStayNights, setMinStayNights] = useState("");
  const [maxStayNights, setMaxStayNights] = useState("");

  // TERMS
  const [rentalType, setRentalType] = useState<RentalType>("flexible");
  const [isRefundable, setIsRefundable] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositCurrency, setDepositCurrency] = useState("USD");

  // RULES
  const [genderPreference, setGenderPreference] =
    useState<GenderPreference>("any");
  const [allowsSmoking, setAllowsSmoking] = useState(false);
  const [allowsPets, setAllowsPets] = useState(false);

  // EXTRAS
  const [amenities, setAmenities] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [tour3DUrl, setTour3DUrl] = useState("");

  // DRAG & DROP STATE
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // MAP + LOCATION SEARCH
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================
  // IMAGE UPLOAD HANDLERS (NO BASE64)
  // =========================
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Upload failed");
    }

    setImages((prev) => [...prev, data.url as string]);
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadError("");
    setUploading(true);

    try {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        if (!file.type.startsWith("image/")) continue;
        await uploadImage(file);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files as FileList | null;
    await handleFilesSelected(files);
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addImageUrl = (url: string) => {
    if (!url.trim()) return;
    setImages((prev) => [...prev, url.trim()]);
  };

  // =========================
  // INIT MAPBOX MAP
  // =========================
  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.warn("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      return;
    }
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // already initialized

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default as any;
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const initialCenter: [number, number] = [35.8623, 33.8547]; // Lebanon center approx [lng, lat]

      const map = new mapboxgl.Map({
        container: mapContainerRef.current as HTMLDivElement,
        style: "mapbox://styles/mapbox/streets-v12",
        center: initialCenter,
        zoom: 7.5,
      });

      mapRef.current = map;

      // Add zoom controls
      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Click on map to set marker & reverse-set lat/lng (optional)
      map.on("click", (e: any) => {
        const { lng, lat } = e.lngLat;
        setLatitude(lat);
        setLongitude(lng);

        if (!markerRef.current) {
          markerRef.current = new mapboxgl.Marker({
            color: "#0b74de",
          })
            .setLngLat([lng, lat])
            .addTo(map);
        } else {
          markerRef.current.setLngLat([lng, lat]);
        }
      });
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // When coordinates change from search → move marker
  useEffect(() => {
    if (!mapRef.current || latitude === undefined || longitude === undefined)
      return;
    const map = mapRef.current;

    map.flyTo({
      center: [longitude, latitude],
      zoom: 14,
      essential: true,
    });

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default as any;
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({
          color: "#0b74de",
        })
          .setLngLat([longitude, latitude])
          .addTo(map);
      } else {
        markerRef.current.setLngLat([longitude, latitude]);
      }
    })();
  }, [latitude, longitude]);

  // =========================
  // MAPBOX GEOCODING SEARCH
  // =========================
  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    setShowSearchResults(false);

    const query = value.trim();
    if (!query || !MAPBOX_TOKEN) {
      setSearchResults([]);
      return;
    }

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${MAPBOX_TOKEN}&country=LB&autocomplete=true&limit=6`;

      const res = await fetch(url);
      const data = await res.json();

      const features: MapboxFeature[] = data.features || [];
      setSearchResults(features);
      setShowSearchResults(features.length > 0);
    } catch (err) {
      console.error("Mapbox search error", err);
    }
  };

  const selectSearchResult = (feature: MapboxFeature) => {
    setSearchQuery(feature.place_name);
    setShowSearchResults(false);

    const [lng, lat] = feature.center;
    setLatitude(lat);
    setLongitude(lng);

    // Extract city if available from context
    let cityName = "";
    if (feature.context && feature.context.length > 0) {
      const placeContext =
        feature.context.find((c) => c.id.startsWith("place")) ||
        feature.context[0];
      cityName = placeContext.text;
    }

    // If no context city, use main text
    if (!cityName) {
      cityName = feature.text;
    }

    setCity(cityName);
    setAddress(feature.text);
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/renter/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          city,
          address,
          university,

          roomType,
          maxOccupants: maxOccupants !== "" ? Number(maxOccupants) : null,

          pricePerNight: pricePerNight !== "" ? Number(pricePerNight) : null,
          pricePerWeek: pricePerWeek !== "" ? Number(pricePerWeek) : null,
          pricePerMonth: pricePerMonth !== "" ? Number(pricePerMonth) : null,

          availableFrom: availableFrom ? new Date(availableFrom) : null,
          availableTo: availableTo ? new Date(availableTo) : null,
          minStayNights: minStayNights !== "" ? Number(minStayNights) : null,
          maxStayNights: maxStayNights !== "" ? Number(maxStayNights) : null,

          rentalType,
          isRefundable,
          cancellationPolicy,

          depositAmount: depositAmount !== "" ? Number(depositAmount) : null,
          depositCurrency,

          genderPreference,
          allowsSmoking,
          allowsPets,

          latitude,
          longitude,

          amenities: amenities
            ? amenities
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
            : [],

          images,
          tour3DUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create listing");
        setSaving(false);
        return;
      }

      router.push("/renter/listings");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
      setSaving(false);
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Add New Listing</h2>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.push("/renter/listings")}
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        {uploadError && (
          <div className="alert alert-warning">{uploadError}</div>
        )}

        {/* BASIC INFO */}
        <div className="mb-3">
          <label className="form-label">Title *</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description *</label>
          <textarea
            className="form-control"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* LOCATION & MAP */}
        <div className="mb-4">
          <label className="form-label d-block">Location</label>

          {/* SEARCH INPUT */}
          <div className="position-relative mb-2">
            <input
              className="form-control"
              placeholder="Search location in Lebanon (e.g. Saida, Hlaliyeh...)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              autoComplete="off"
            />
            {showSearchResults && searchResults.length > 0 && (
              <div
                className="list-group position-absolute w-100 mt-1"
                style={{
                  zIndex: 60,
                  maxHeight: "260px",
                  overflowY: "auto",
                }}
              >
                {searchResults.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className="list-group-item list-group-item-action"
                    onMouseDown={() => selectSearchResult(f)}
                  >
                    {f.place_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MAP CONTAINER */}
          <div
            ref={mapContainerRef}
            style={{
              width: "100%",
              height: "300px",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid var(--rh-border)",
            }}
          />

          {/* City & address shown under map (editable) */}
          <div className="row mt-3">
            <div className="mb-3 col-md-6">
              <label className="form-label">City *</label>
              <input
                className="form-control"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 col-md-6">
              <label className="form-label">Address / Area</label>
              <input
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street / neighborhood"
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">University</label>
          <input
            className="form-control"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
          />
        </div>

        {/* ROOM DETAILS */}
        <div className="row">
          <div className="mb-3 col-md-6">
            <label className="form-label">Room Type</label>
            <select
              className="form-select"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
            >
              <option value="">Select type</option>
              <option value="room">Private room</option>
              <option value="bed">Bed in shared room</option>
              <option value="studio">Studio</option>
              <option value="apartment">Full apartment</option>
            </select>
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label">Max Occupants</label>
            <input
              type="number"
              className="form-control"
              value={maxOccupants}
              onChange={(e) => setMaxOccupants(e.target.value)}
              min={1}
            />
          </div>
        </div>

        {/* PRICING */}
        <div className="row">
          <div className="mb-3 col-md-4">
            <label className="form-label">Price per Night</label>
            <input
              type="number"
              className="form-control"
              value={pricePerNight}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || Number(v) >= 0) setPricePerNight(v);
              }}
              min={0}
            />
          </div>
          <div className="mb-3 col-md-4">
            <label className="form-label">Price per Week</label>
            <input
              type="number"
              className="form-control"
              value={pricePerWeek}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || Number(v) >= 0) setPricePerWeek(v);
              }}
              min={0}
            />
          </div>
          <div className="mb-3 col-md-4">
            <label className="form-label">Price per Month</label>
            <input
              type="number"
              className="form-control"
              value={pricePerMonth}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || Number(v) >= 0) setPricePerMonth(v);
              }}
              min={0}
            />
          </div>
        </div>

        {/* AVAILABILITY */}
        <div className="row">
          <div className="mb-3 col-md-3">
            <label className="form-label">Available From</label>
            <input
              type="date"
              className="form-control"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
            />
          </div>
          <div className="mb-3 col-md-3">
            <label className="form-label">Available To</label>
            <input
              type="date"
              className="form-control"
              value={availableTo}
              onChange={(e) => setAvailableTo(e.target.value)}
            />
          </div>
          <div className="mb-3 col-md-3">
            <label className="form-label">Min Stay (nights)</label>
            <input
              type="number"
              className="form-control"
              value={minStayNights}
              onChange={(e) => setMinStayNights(e.target.value)}
              min={1}
            />
          </div>
          <div className="mb-3 col-md-3">
            <label className="form-label">Max Stay (nights)</label>
            <input
              type="number"
              className="form-control"
              value={maxStayNights}
              onChange={(e) => setMaxStayNights(e.target.value)}
              min={1}
            />
          </div>
        </div>

        {/* RENTAL TERMS */}
        <div className="row">
          <div className="mb-3 col-md-4">
            <label className="form-label">Main Rental Type</label>
            <select
              className="form-select"
              value={rentalType}
              onChange={(e) => setRentalType(e.target.value as RentalType)}
            >
              <option value="flexible">Flexible</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="mb-3 col-md-4 d-flex align-items-center">
            <div className="form-check mt-3 mt-md-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="isRefundable"
                checked={isRefundable}
                onChange={(e) => setIsRefundable(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="isRefundable">
                Refundable booking
              </label>
            </div>
          </div>
          <div className="mb-3 col-md-4">
            <label className="form-label">Deposit Amount</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min={0}
              />
              <select
                className="form-select"
                style={{ maxWidth: "110px" }}
                value={depositCurrency}
                onChange={(e) => setDepositCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="LBP">LBP</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Cancellation Policy</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="E.g. Full refund up to 7 days before check-in..."
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
          />
        </div>

        {/* RULES */}
        <div className="row">
          <div className="mb-3 col-md-4">
            <label className="form-label">Gender Preference</label>
            <select
              className="form-select"
              value={genderPreference}
              onChange={(e) =>
                setGenderPreference(e.target.value as GenderPreference)
              }
            >
              <option value="any">Any</option>
              <option value="male">Male only</option>
              <option value="female">Female only</option>
            </select>
          </div>
          <div className="mb-3 col-md-4 d-flex align-items-center">
            <div className="form-check mt-3 mt-md-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="allowsSmoking"
                checked={allowsSmoking}
                onChange={(e) => setAllowsSmoking(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="allowsSmoking">
                Smoking allowed
              </label>
            </div>
          </div>
          <div className="mb-3 col-md-4 d-flex align-items-center">
            <div className="form-check mt-3 mt-md-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="allowsPets"
                checked={allowsPets}
                onChange={(e) => setAllowsPets(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="allowsPets">
                Pets allowed
              </label>
            </div>
          </div>
        </div>

        {/* AMENITIES / IMAGES / 3D */}
        <div className="mb-3">
          <label className="form-label">
            Amenities (comma separated, e.g. WiFi, AC, Laundry)
          </label>
          <input
            className="form-control"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
          />
        </div>

        {/* IMAGES - DRAG & DROP + PREVIEW */}
        <div className="mb-3">
          <label className="form-label">
            Images{" "}
            {uploading && (
              <span className="text-muted small ms-1">(uploading...)</span>
            )}
          </label>

          {/* Drag & drop area */}
          <div
            className={`border rounded p-3 text-center ${
              isDragging ? "bg-light border-primary" : "bg-white"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{ cursor: "pointer" }}
            onClick={() => {
              const input = document.getElementById(
                "image-file-input"
              ) as HTMLInputElement | null;
              input?.click();
            }}
          >
            <p className="mb-1 fw-semibold">Drag & drop images here</p>
            <p className="mb-2 text-muted small">or click to browse</p>
            <input
              id="image-file-input"
              type="file"
              accept="image/*"
              multiple
              className="d-none"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
          </div>

          {/* Optional: add URL manually */}
          <div className="input-group mt-2">
            <input
              type="text"
              className="form-control"
              placeholder="Or paste an image URL and press Add"
              id="image-url-input"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                const input = document.getElementById(
                  "image-url-input"
                ) as HTMLInputElement | null;
                if (!input) return;
                if (input.value.trim()) {
                  addImageUrl(input.value);
                  input.value = "";
                }
              }}
            >
              Add
            </button>
          </div>

          {/* Preview thumbnails */}
          {images.length > 0 && (
            <div className="mt-3 d-flex flex-wrap gap-3">
              {images.map((src, idx) => (
                <div
                  key={idx}
                  className="position-relative"
                  style={{ width: 100, height: 100 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Image ${idx + 1}`}
                    className="img-fluid rounded"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      border: "1px solid #dee2e6",
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle"
                    style={{ borderRadius: "50%", padding: "0.15rem 0.35rem" }}
                    onClick={() => removeImage(idx)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label">3D Tour URL (optional)</label>
          <input
            className="form-control"
            value={tour3DUrl}
            onChange={(e) => setTour3DUrl(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" disabled={saving || uploading}>
          {saving ? "Saving..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
