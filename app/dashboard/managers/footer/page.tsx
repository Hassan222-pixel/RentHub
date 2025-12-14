"use client";

import { useEffect, useState } from "react";

export default function FooterManager() {
  const [description, setDescription] = useState("");
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/footer")
      .then((res) => res.json())
      .then((data) => {
        setDescription(data.description);
        setProperties(data.properties || []);
      });
  }, []);

  const save = async () => {
    await fetch("/api/footer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, properties }),
    });

    alert("Footer updated");
  };

  const updateProperty = (i: number, key: string, value: string) => {
    const copy = [...properties];
    copy[i][key] = value;
    setProperties(copy);
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Footer Settings</h2>

      <label>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ width: "100%", height: 100 }}
      />

      <h3 style={{ marginTop: 30 }}>Latest Properties</h3>

      {properties.map((p, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <input
            placeholder="City"
            value={p.city}
            onChange={(e) => updateProperty(i, "city", e.target.value)}
          />
          <input
            placeholder="Title"
            value={p.title}
            onChange={(e) => updateProperty(i, "title", e.target.value)}
          />
          <input
            placeholder="Price"
            value={p.price}
            onChange={(e) => updateProperty(i, "price", e.target.value)}
          />
          <input
            placeholder="Image URL"
            value={p.image}
            onChange={(e) => updateProperty(i, "image", e.target.value)}
          />
        </div>
      ))}

      <button
        onClick={() =>
          setProperties([
            ...properties,
            { city: "", title: "", price: "", image: "" },
          ])
        }
      >
        + Add Property
      </button>

      <br /><br />
      <button onClick={save}>Save Footer</button>
    </div>
  );
}
