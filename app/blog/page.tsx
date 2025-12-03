"use client";

import { useEffect, useState } from "react";

interface BlogItem {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="blog-section text-center p-5">
        <h2>Loading blog...</h2>
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="blog-section text-center p-5">
        <h3>No blog posts available.</h3>
        <p>Ask admin to add some blog posts in Dashboard → Blog Manager.</p>
      </div>
    );
  }

  return (
    <div className="blog-section">
      <h1 className="text-center font-bold text-4xl mt-10">BLOG</h1>
      <p className="text-center mt-2">
        Lorem Ipsum available, but the majority have suffered
      </p>

      <div className="container mt-5">
        <div className="row">
          {blogs.map((item) => (
            <div key={item.id} className="col-md-4 mb-4">
              <div className="card">
                <img
                  src={item.image}
                  className="card-img-top"
                  style={{ height: "260px", objectFit: "cover" }}
                  alt="Blog Image"
                />
                <div className="card-body">
                  <h4>{item.title}</h4>
                  <h6 className="text-danger">{item.subtitle}</h6>
                  <p>{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
