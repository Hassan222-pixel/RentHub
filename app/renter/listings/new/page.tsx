// app/renter/listings/new/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function NewListingPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [university, setUniversity] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [pricePerMonth, setPricePerMonth] = useState("");
  const [amenities, setAmenities] = useState("");
  const [images, setImages] = useState("");
  const [tour3DUrl, setTour3DUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
          pricePerNight: pricePerNight ? Number(pricePerNight) : undefined,
          pricePerMonth: pricePerMonth ? Number(pricePerMonth) : undefined,
          amenities: amenities ? amenities.split(",").map((a) => a.trim()) : [],
          images: images ? images.split(",").map((i) => i.trim()) : [],
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

  return (
    <div>
      <h2 className="mb-3">Add New Listing</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}

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

        <div className="row">
          <div className="mb-3 col-md-4">
            <label className="form-label">City *</label>
            <input
              className="form-control"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 col-md-4">
            <label className="form-label">Address</label>
            <input
              className="form-control"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="mb-3 col-md-4">
            <label className="form-label">University</label>
            <input
              className="form-control"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
            />
          </div>
        </div>

        <div className="row">
          <div className="mb-3 col-md-6">
            <label className="form-label">Price per Night</label>
            <input
              type="number"
              className="form-control"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(e.target.value)}
            />
          </div>
          <div className="mb-3 col-md-6">
            <label className="form-label">Price per Month</label>
            <input
              type="number"
              className="form-control"
              value={pricePerMonth}
              onChange={(e) => setPricePerMonth(e.target.value)}
            />
          </div>
        </div>

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

        <div className="mb-3">
          <label className="form-label">
            Image URLs (comma separated for now)
          </label>
          <input
            className="form-control"
            value={images}
            onChange={(e) => setImages(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">3D Tour URL (optional)</label>
          <input
            className="form-control"
            value={tour3DUrl}
            onChange={(e) => setTour3DUrl(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
