// app/dashboard/universities/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";

interface University {
  _id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  image?: string;
}

type Mode = "create" | "edit";

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editingUni, setEditingUni] = useState<University | null>(null);

  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [image, setImage] = useState("");

  const [saving, setSaving] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const AREAS = useMemo(
    () => [
      "Beirut",
      "Tripoli",
      "Saida",
      "Tyre",
      "Jounieh",
      "Zahle",
      "Baabda",
      "Aley",
      "Byblos",
      "Batroun",
      "Nabatieh",
      "Baalbek",
    ],
    []
  );

  const resetForm = () => {
    setName("");
    setArea("");
    setLat("");
    setLng("");
    setImage("");
    setEditingUni(null);
    setMode("create");
    setUploadError("");
    setUploadingImage(false);
  };

  const openCreateModal = () => {
    resetForm();
    setMode("create");
    setModalOpen(true);
  };

  const openEditModal = (uni: University) => {
    setEditingUni(uni);
    setMode("edit");
    setName(uni.name);
    setArea(uni.area || "");
    setLat(String(uni.latitude));
    setLng(String(uni.longitude));
    setImage(uni.image || "");
    setUploadError("");
    setUploadingImage(false);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/dashboard/universities", {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to load universities");
        return;
      }
      setUniversities(data.universities || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load universities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file");
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.message || "Image upload failed");
        return;
      }

      setImage(data.url as string);
    } catch (err) {
      console.error(err);
      setUploadError("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (!name || !area || isNaN(latitude) || isNaN(longitude)) {
      setError("Please fill name, area, latitude and longitude correctly");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name,
        area,
        latitude,
        longitude,
        image: image || undefined,
      };

      const res =
        mode === "create"
          ? await fetch("/api/dashboard/universities", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/dashboard/universities/${editingUni?._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to save university");
        setSaving(false);
        return;
      }

      closeModal();
      resetForm();
      fetchUniversities();
    } catch (err) {
      console.error(err);
      setError("Failed to save university");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this university?"))
      return;

    try {
      const res = await fetch(`/api/dashboard/universities/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to delete university");
        return;
      }
      setUniversities((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete university");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Universities</h2>
          <p className="text-muted small mb-0">
            Manage universities used for dorm proximity & filters.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          + New University
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : universities.length === 0 ? (
        <p>No universities yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-sm align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Area</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Image</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {universities.map((uni) => (
                <tr key={uni._id}>
                  <td>{uni.name}</td>
                  <td>{uni.area || "—"}</td>
                  <td>{uni.latitude}</td>
                  <td>{uni.longitude}</td>
                  <td>
                    {uni.image ? (
                      <img
                        src={uni.image}
                        alt={uni.name}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      <span className="text-muted small">No image</span>
                    )}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => openEditModal(uni)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(uni._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {mode === "create" ? "New University" : "Edit University"}
                  </h5>
                  <button className="btn-close" onClick={closeModal} />
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Area</label>
                      <select
                        className="form-select"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        required
                      >
                        <option value="">Select area...</option>
                        {AREAS.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Latitude</label>
                        <input
                          className="form-control"
                          value={lat}
                          onChange={(e) => setLat(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Longitude</label>
                        <input
                          className="form-control"
                          value={lng}
                          onChange={(e) => setLng(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control mb-2"
                        onChange={handleImageFileChange}
                      />
                      <input
                        className="form-control"
                        placeholder="Or paste image URL"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving || uploadingImage}
                    >
                      {saving
                        ? "Saving..."
                        : mode === "create"
                        ? "Create"
                        : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
