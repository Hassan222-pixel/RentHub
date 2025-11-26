"use client";

import { useState } from "react";

export default function GalleryManagerPage() {
  const [images, setImages] = useState([""]);

  const addImage = () => {
    setImages([...images, ""]);
  };

  const updateImage = (value: string, index: number) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const handleSave = () => {
    alert("Gallery Saved (DB later)");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gallery Manager</h1>

      {images.map((img, index) => (
        <div key={index} className="mb-3">
          <label className="fw-semibold">Image URL #{index + 1}</label>
          <input
            className="form-control"
            value={img}
            onChange={(e) => updateImage(e.target.value, index)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      ))}

      <button className="btn btn-secondary me-3" onClick={addImage}>
        + Add More Images
      </button>

      <button className="btn btn-primary" onClick={handleSave}>
        Save Gallery
      </button>
    </div>
  );
}
