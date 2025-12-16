"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "../news/news.css";
import Newsletter from "../components/Newsletter";

// HeroSearch = client only
const HeroSearch = dynamic(
  () => import("../components/Herosearch"),
  { ssr: false }
);

interface Post {
  title: string;
  day: string;
  monthYear: string;
  author: string;
  category: string;
  commentsCount: number;
  image: string;
  excerpt: string;
}

interface Category {
  name: string;
  count: number;
}

interface LatestPost {
  title: string;
  image: string;
  author: string;
}

interface NewsData {
  bannerTitle: string;
  bannerBackgroundImage: string;
  posts: Post[];
  categories: Category[];
  latestPosts: LatestPost[];
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        const data = await res.json();

        setNews({
          bannerTitle: data.bannerTitle ?? "News",
          bannerBackgroundImage: data.bannerBackgroundImage ?? "",
          posts: data.posts ?? [],
          categories: data.categories ?? [],
          latestPosts: data.latestPosts ?? [],
        });
      } catch (err) {
        console.error("Failed to load news:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ✅ SAFE LOADING STATES */
  if (loading) {
    return <div className="p-6 text-center">Loading news...</div>;
  }

  if (!news) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load news.
      </div>
    );
  }

  return (
    <main className="news-wrapper">
      {/* HERO */}
      <div
        className="news-hero"
        style={{ backgroundImage: `url(${news.bannerBackgroundImage})` }}
      >
        <div className="news-hero-overlay">
          <h1>{news.bannerTitle}</h1>
          <p className="breadcrumb">Home / {news.bannerTitle}</p>
          <div className="hero-search-container">
            {/* <HeroSearch /> */}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <section className="news-container">
        <div className="news-left">
          {news.posts.map((post, i) => (
            <div className="news-entry" key={i}>
              <div className="date-circle">
                <h3>{post.day}</h3>
                <p>{post.monthYear}</p>
              </div>

              <div className="entry-content">
                <h2>{post.title}</h2>
                <div className="entry-meta">
                  <span>By {post.author}</span> |
                  <span> In {post.category}</span> |
                  <span> {post.commentsCount} Comments</span>
                </div>

                {post.image && (
                  <img src={post.image} alt={post.title} />
                )}
                <p className="entry-text">{post.excerpt}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="news-right">
          <div className="sidebar-box">
            <h3>Categories</h3>
            <ul>
              {news.categories.map((c, i) => (
                <li key={i}>
                  {c.name} <span>{c.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-box">
            <h3>Latest Posts</h3>
            {news.latestPosts.map((p, i) => (
              <div className="latest-post" key={i}>
                {p.image && (
                  <img src={p.image} alt={p.title} />
                )}
                <div>
                  <h4>{p.title}</h4>
                  <p>By {p.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </main>
  );
}
  