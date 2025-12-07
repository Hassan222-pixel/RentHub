/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/renter/listings/[id]/edit/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState, useMemo } from "react";

type RoomType = "private" | "double" | "shared" | "";
type GenderPreference = "any" | "male" | "female" | "";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

interface Dorm {
  _id: string;
  title: string;
  description: string;
  city: string;
  address?: string;
  university?: string;

  // ROOM
  roomType?: RoomType;
  maxOccupants?: number;
  genderPreference?: GenderPreference;
  allowsSmoking?: boolean;
  allowsPets?: boolean;
  houseRules?: string[] | string;

  // PRICING
  pricePerNight?: number;
  pricePerMonth?: number;

  // AVAILABILITY
  minStayNights?: number;

  // DEPOSIT
  depositAmount?: number;

  // LOCATION
  latitude?: number;
  longitude?: number;

  // BOOLEAN AMENITIES
  hasWifi?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  hasParking?: boolean;
  hasLaundry?: boolean;
  isFurnished?: boolean;

  // EXTRAS
  amenities?: string[];
  images?: string[];
  profileImg?: string;
  tour3DUrl?: string;
}

interface MapboxFeature {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  context?: { id: string; text: string }[];
}

interface UniversityOption {
  _id: string;
  name: string;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // BASIC
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  // UNIVERSITY VALUE (selected)
  const [university, setUniversity] = useState("");

  // UNIVERSITY OPTIONS
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [uniError, setUniError] = useState("");

  // ROOM
  const [roomType, setRoomType] = useState<RoomType>("");
  const [maxOccupantsInput, setMaxOccupantsInput] = useState("");
  const [genderPreference, setGenderPreference] =
    useState<GenderPreference>("any");
  const [allowsSmoking, setAllowsSmoking] = useState(false);
  const [allowsPets, setAllowsPets] = useState(false);

  // HOUSE RULES
  const [houseRuleInput, setHouseRuleInput] = useState("");
  const [houseRules, setHouseRules] = useState<string[]>([]);

  // PRICING
  const [pricePerNight, setPricePerNight] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState("");

  // AVAILABILITY
  const [minStayNights, setMinStayNights] = useState("");

  // DEPOSIT
  const [depositAmount, setDepositAmount] = useState("");

  // BOOLEAN AMENITIES
  const [hasWifi, setHasWifi] = useState(false);
  const [hasAirConditioning, setHasAirConditioning] = useState(false);
  const [hasHeating, setHasHeating] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [hasLaundry, setHasLaundry] = useState(false);
  const [isFurnished, setIsFurnished] = useState(false);

  // EXTRAS
  const [amenities, setAmenities] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [tour3DUrl, setTour3DUrl] = useState("");

  const [profileImg, setProfileImg] = useState("");
  const [profileUploading, setProfileUploading] = useState(false);

  // DRAG & DROP
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // MAP + SEARCH
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  // =========================
  // IMAGE UPLOAD HANDLERS (NO BASE64)
  // =========================

  const uploadProfileImg = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    setProfileUploading(true);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setProfileUploading(false);

    if (!res.ok) {
      alert("Failed to upload profile image");
      return;
    }

    setProfileImg(data.url);
  };

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
  // HOUSE RULES HELPERS
  // =========================

  const addHouseRule = () => {
    const value = houseRuleInput.trim();
    if (!value) return;
    setHouseRules((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setHouseRuleInput("");
  };

  const removeHouseRule = (rule: string) => {
    setHouseRules((prev) => prev.filter((r) => r !== rule));
  };

  // =========================
  // LOAD UNIVERSITIES FOR DROPDOWN
  // =========================
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        setUniError("");
        const res = await fetch("/api/universities");
        const data = await res.json();

        if (!res.ok) {
          setUniError(data.message || "Failed to load universities");
          return;
        }

        setUniversities(data.universities || []);
      } catch (err) {
        console.error("Error loading universities:", err);
        setUniError("Failed to load universities");
      }
    };

    loadUniversities();
  }, []);

  // =========================
  // LOAD EXISTING DORM
  // =========================
  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError("Missing listing id");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/renter/listings/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load listing");
          setLoading(false);
          return;
        }

        const dorm: Dorm | undefined = data.dorm;

        if (!dorm) {
          setError("Listing not found");
          setLoading(false);
          return;
        }

        // BASIC
        setTitle(dorm.title || "");
        setDescription(dorm.description || "");
        setCity(dorm.city || "");
        setAddress(dorm.address || "");
        setUniversity(dorm.university || "");

        // ROOM
        setRoomType((dorm.roomType as RoomType) || "");
        setMaxOccupantsInput(
          dorm.maxOccupants !== undefined ? String(dorm.maxOccupants) : ""
        );
        setGenderPreference(
          (dorm.genderPreference as GenderPreference) || "any"
        );
        setAllowsSmoking(dorm.allowsSmoking ?? false);
        setAllowsPets(dorm.allowsPets ?? false);

        // HOUSE RULES: normalize from old string or new array
        const rawHouseRules = dorm.houseRules as unknown;
        let normalizedRules: string[] = [];
        if (Array.isArray(rawHouseRules)) {
          normalizedRules = rawHouseRules
            .map((r) => (typeof r === "string" ? r.trim() : ""))
            .filter(Boolean);
        } else if (typeof rawHouseRules === "string") {
          normalizedRules = rawHouseRules
            .split(/\r?\n|,/)
            .map((r) => r.trim())
            .filter(Boolean);
        }
        setHouseRules(normalizedRules);

        // PRICING
        setPricePerNight(
          dorm.pricePerNight !== undefined ? String(dorm.pricePerNight) : ""
        );
        setPricePerMonth(
          dorm.pricePerMonth !== undefined ? String(dorm.pricePerMonth) : ""
        );

        // AVAILABILITY
        setMinStayNights(
          dorm.minStayNights !== undefined ? String(dorm.minStayNights) : ""
        );

        // DEPOSIT
        setDepositAmount(
          dorm.depositAmount !== undefined ? String(dorm.depositAmount) : ""
        );

        // BOOLEAN AMENITIES
        setHasWifi(dorm.hasWifi ?? false);
        setHasAirConditioning(dorm.hasAirConditioning ?? false);
        setHasHeating(dorm.hasHeating ?? false);
        setHasParking(dorm.hasParking ?? false);
        setHasLaundry(dorm.hasLaundry ?? false);
        setIsFurnished(dorm.isFurnished ?? false);

        // AMENITIES / MEDIA
        setAmenities(dorm.amenities?.join(", ") || "");
        setImages(dorm.images || []);
        setTour3DUrl(dorm.tour3DUrl || "");
        setProfileImg(dorm.profileImg || "");

        // LOCATION
        if (typeof dorm.latitude === "number") {
          setLatitude(dorm.latitude);
        }
        if (typeof dorm.longitude === "number") {
          setLongitude(dorm.longitude);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  // =========================
  // MERGED UNIVERSITY OPTIONS (ensure current value is present)
  // =========================
  const universityOptions = useMemo(() => {
    if (!university) return universities;
    if (universities.some((u) => u.name === university)) return universities;
    return [{ _id: "current", name: university }, ...universities];
  }, [universities, university]);

  // =========================
  // INIT MAP (after data is loaded)
  // =========================
  useEffect(() => {
    if (loading) return;
    if (!MAPBOX_TOKEN) {
      console.warn("Missing NEXT_PUBLIC_MAPBOX_TOKEN");
      return;
    }
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    (async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default as any;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const center: [number, number] = [
          longitude ?? 35.8623,
          latitude ?? 33.8547,
        ];

        const map = new mapboxgl.Map({
          container: mapContainerRef.current as HTMLDivElement,
          style: "mapbox://styles/mapbox/streets-v12",
          center,
          zoom: longitude && latitude ? 14 : 7.5,
        });

        mapRef.current = map;
        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        if (longitude !== undefined && latitude !== undefined) {
          markerRef.current = new mapboxgl.Marker({ color: "#0b74de" })
            .setLngLat([longitude, latitude])
            .addTo(map);
        }

        map.on("click", (e: any) => {
          const { lng, lat } = e.lngLat;
          setLatitude(lat);
          setLongitude(lng);

          if (!markerRef.current) {
            markerRef.current = new mapboxgl.Marker({ color: "#0b74de" })
              .setLngLat([lng, lat])
              .addTo(map);
          } else {
            markerRef.current.setLngLat([lng, lat]);
          }
        });
      } catch (err) {
        console.error("Error initializing Mapbox map in edit page:", err);
      }
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [loading, MAPBOX_TOKEN, latitude, longitude]);

  // =========================
  // FLY MAP WHEN COORDS CHANGE (from search)
  // =========================
  useEffect(() => {
    if (!mapRef.current || latitude === undefined || longitude === undefined)
      return;

    const map = mapRef.current as any;
    map.flyTo({
      center: [longitude, latitude],
      zoom: 14,
      essential: true,
    });

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default as any;
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ color: "#0b74de" })
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

    let cityName = "";
    if (feature.context && feature.context.length > 0) {
      const placeContext =
        feature.context.find((c) => c.id.startsWith("place")) ||
        feature.context[0];
      cityName = placeContext.text;
    }
    if (!cityName) cityName = feature.text;

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

    if (!title || !description || !city) {
      setError("Title, description and city are required");
      setSaving(false);
      return;
    }

    if (!pricePerNight && !pricePerMonth) {
      setError("Please provide at least one price (night or month)");
      setSaving(false);
      return;
    }

    let maxOccupants: number | null = null;
    if (roomType === "private") {
      maxOccupants = 1;
    } else if (roomType === "double") {
      maxOccupants = 2;
    } else if (roomType === "shared") {
      if (!maxOccupantsInput) {
        setError("Please set max occupants for shared rooms");
        setSaving(false);
        return;
      }
      const parsed = Number(maxOccupantsInput);
      if (!Number.isFinite(parsed) || parsed < 1) {
        setError("Max occupants for shared rooms must be at least 1");
        setSaving(false);
        return;
      }
      maxOccupants = parsed;
    }

    try {
      const res = await fetch(`/api/renter/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          city,
          address,
          university,

          roomType,
          maxOccupants,

          pricePerNight: pricePerNight !== "" ? Number(pricePerNight) : null,
          pricePerMonth: pricePerMonth !== "" ? Number(pricePerMonth) : null,

          minStayNights: minStayNights !== "" ? Number(minStayNights) : null,

          depositAmount: depositAmount !== "" ? Number(depositAmount) : null,

          genderPreference,
          allowsSmoking,
          allowsPets,
          houseRules,

          hasWifi,
          hasAirConditioning,
          hasHeating,
          hasParking,
          hasLaundry,
          isFurnished,

          latitude,
          longitude,

          amenities: amenities
            ? amenities
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
            : [],

          images,
          profileImg,
          tour3DUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to update listing");
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

  if (loading) {
    return <p>Loading listing...</p>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Edit Listing</h2>
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

        {/* BASIC */}
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

        {/* LOCATION + MAP */}
        <div className="mb-4">
          <label className="form-label d-block">Location</label>

          <div className="position-relative mb-2">
            <input
              className="form-control"
              placeholder="Search location in Lebanon (e.g. Saida, Hlaliyeh...)"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
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

        {/* UNIVERSITY */}
        <div className="mb-3">
          <label className="form-label">University</label>
          <select
            className="form-select"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
          >
            <option value="">Select university</option>
            {universityOptions.map((u) => (
              <option key={u._id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
          {uniError && (
            <small className="text-danger d-block mt-1">{uniError}</small>
          )}
        </div>

        {/* ROOM DETAILS */}
        <div className="row">
          <div className="mb-3 col-md-4">
            <label className="form-label">Room Type</label>
            <select
              className="form-select"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
            >
              <option value="">Select type</option>
              <option value="private">Private room</option>
              <option value="double">Double room</option>
              <option value="shared">Shared room</option>
            </select>
          </div>

          {roomType === "shared" && (
            <div className="mb-3 col-md-4">
              <label className="form-label">Max Occupants</label>
              <input
                type="number"
                className="form-control"
                value={maxOccupantsInput}
                onChange={(e) => setMaxOccupantsInput(e.target.value)}
                min={1}
                placeholder="Number of beds / people"
              />
            </div>
          )}

          {roomType === "private" && (
            <div className="mb-3 col-md-4 d-flex align-items-end">
              <small className="text-muted">
                Max occupants will be <strong>1</strong>.
              </small>
            </div>
          )}

          {roomType === "double" && (
            <div className="mb-3 col-md-4 d-flex align-items-end">
              <small className="text-muted">
                Max occupants will be <strong>2</strong>.
              </small>
            </div>
          )}

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
        </div>

        {/* RULES TOGGLES */}
        <div className="row">
          <div className="mb-3 col-md-6 d-flex align-items-center">
            <div className="d-flex flex-column gap-2 mt-3 mt-md-0">
              <div className="form-check">
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
              <div className="form-check">
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
        </div>

        {/* HOUSE RULES */}
        <div className="mb-3">
          <label className="form-label">House Rules</label>
          <div className="input-group mb-2">
            <input
              className="form-control"
              placeholder="e.g. No visitors after midnight"
              value={houseRuleInput}
              onChange={(e) => setHouseRuleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addHouseRule();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={addHouseRule}
            >
              Add
            </button>
          </div>
          {Array.isArray(houseRules) && houseRules.length > 0 && (
            <div className="d-flex flex-wrap gap-2">
              {houseRules.map((rule) => (
                <span
                  key={rule}
                  className="badge bg-light text-dark d-flex align-items-center gap-2"
                  style={{ border: "1px solid #dee2e6" }}
                >
                  {rule}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary p-0 px-1"
                    onClick={() => removeHouseRule(rule)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* PRICING */}
        <div className="row">
          <div className="mb-3 col-md-6">
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
          <div className="mb-3 col-md-6">
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
          <div className="mb-3 col-md-6">
            <label className="form-label">Min Stay (nights)</label>
            <input
              type="number"
              className="form-control"
              value={minStayNights}
              onChange={(e) => setMinStayNights(e.target.value)}
              min={1}
            />
          </div>
        </div>

        {/* DEPOSIT */}
        <div className="mb-3">
          <label className="form-label">Deposit (optional, USD)</label>
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min={0}
            />
            <span className="input-group-text">USD</span>
          </div>
        </div>

        {/* BOOLEAN AMENITIES */}
        <div className="mb-3">
          <label className="form-label">Amenities</label>
          <div className="row">
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="hasWifi"
                  checked={hasWifi}
                  onChange={(e) => setHasWifi(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="hasWifi">
                  Wi-Fi
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="hasAirConditioning"
                  checked={hasAirConditioning}
                  onChange={(e) => setHasAirConditioning(e.target.checked)}
                />
                <label
                  className="form-check-label"
                  htmlFor="hasAirConditioning"
                >
                  Air Conditioning
                </label>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="hasHeating"
                  checked={hasHeating}
                  onChange={(e) => setHasHeating(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="hasHeating">
                  Heating
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="hasParking"
                  checked={hasParking}
                  onChange={(e) => setHasParking(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="hasParking">
                  Parking
                </label>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="hasLaundry"
                  checked={hasLaundry}
                  onChange={(e) => setHasLaundry(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="hasLaundry">
                  Laundry
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isFurnished"
                  checked={isFurnished}
                  onChange={(e) => setIsFurnished(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isFurnished">
                  Furnished
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* AMENITIES / IMAGES / 3D */}
        <div className="mb-3">
          <label className="form-label">
            Extra amenities (comma separated, e.g. Sea view, Near supermarket)
          </label>
          <input
            className="form-control"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadProfileImg(file);
            }}
          />

          {profileUploading && <p className="text-muted">Uploading...</p>}

          {profileImg && (
            <img
              src={profileImg}
              alt="Profile"
              style={{
                width: 120,
                height: 120,
                marginTop: 10,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
          )}
        </div>

        {/* IMAGES - DRAG & DROP + PREVIEW */}
        <div className="mb-3">
          <label className="form-label">
            Images{" "}
            {uploading && (
              <span className="text-muted small ms-1">(uploading...)</span>
            )}
          </label>

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
                "edit-image-file-input"
              ) as HTMLInputElement | null;
              input?.click();
            }}
          >
            <p className="mb-1 fw-semibold">Drag & drop images here</p>
            <p className="mb-2 text-muted small">or click to browse</p>
            <input
              id="edit-image-file-input"
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
              id="edit-image-url-input"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                const input = document.getElementById(
                  "edit-image-url-input"
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

          {images.length > 0 && (
            <div className="mt-3 d-flex flex-wrap gap-3">
              {images.map((src, idx) => (
                <div
                  key={idx}
                  className="position-relative"
                  style={{ width: 100, height: 100 }}
                >
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
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
