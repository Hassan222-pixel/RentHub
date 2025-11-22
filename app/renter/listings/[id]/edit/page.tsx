// app/renter/listings/[id]/edit/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface Dorm {
  _id: string;
  title: string;
  description: string;
  city: string;
  address?: string;
  university?: string;
  pricePerNight?: number;
  pricePerMonth?: number;
  amenities?: string[];
  images?: string[];
  tour3DUrl?: string;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/renter/listings/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to load listing");
          setLoading(false);
          return;
        }

        const dorm: Dorm = data.dorm;
        setTitle(dorm.title || "");
        setDescription(dorm.description || "");
        setCity(dorm.city || "");
        setAddress(dorm.address || "");
        setUniversity(dorm.university || "");
        setPricePerNight(dorm.pricePerNight ? String(dorm.pricePerNight) : "");
        setPricePerMonth(dorm.pricePerMonth ? String(dorm.pricePerMonth) : "");
        setAmenities(dorm.amenities?.join(", ") || "");
        setImages(dorm.images?.join(", ") || "");
        setTour3DUrl(dorm.tour3DUrl || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

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
          pricePerNight: pricePerNight ? Number(pricePerNight) : undefined,
          pricePerMonth: pricePerMonth ? Number(pricePerMonth) : undefined,
          amenities: amenities ? amenities.split(",").map((a) => a.trim()) : [],
          images: images ? images.split(",").map((i) => i.trim()) : [],
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
      <h2 className="mb-3">Edit Listing</h2>
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
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
