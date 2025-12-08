import "../news/news.css";
import HeroSearch from "../components/Herosearch";
import Newsletter from "../components/Newsletter";

const blogPosts = [
  {
    title: "How to invest in real estate?",
    date: "15 Apr '18",
    author: "James Morrison",
    category: "Real Estate",
    comments: 3,
    image: "https://preview.colorlib.com/theme/bluesky/img/blog/main-blog/m-blog-1.jpg",
    text:
      "Donec ullamcorper nulla non metus auctor fringilla. Curabitur blandit tempus porttitor. Sed lectus urna, ultricies sit amet risus eget, euismod imperdiet augue. Duis imperdiet.",
  },
  {
    title: "The best 10 cities to buy a house",
    date: "15 Apr '18",
    author: "James Morrison",
    category: "Real Estate",
    comments: 3,
    image: "https://preview.colorlib.com/theme/bluesky/img/blog/main-blog/m-blog-2.jpg",
    text:
      "Donec ullamcorper nulla non metus auctor fringilla. Curabitur blandit tempus porttitor. Sed lectus urna, ultricies sit amet risus eget, euismod imperdiet augue.",
  },
  {
    title: "5 Tips for a vacation home",
    date: "15 Apr '18",
    author: "James Morrison",
    category: "Real Estate",
    comments: 3,
    image: "https://preview.colorlib.com/theme/bluesky/img/blog/main-blog/m-blog-3.jpg",
    text:
      "Donec ullamcorper nulla non metus auctor fringilla. Curabitur blandit tempus porttitor. Sed lectus urna, ultricies sit amet risus eget, euismod imperdiet augue.",
  },
];

export default function NewsPage() {
  return (
    <main className="news-wrapper">

      {/* HERO SECTION */}
      <div className="news-hero">
        <div className="news-hero-overlay">
          <h1>News</h1>
          <p className="breadcrumb">Home / News</p>

          <div className="hero-search-container">
            <HeroSearch />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <section className="news-container">

        {/* LEFT COLUMN – BLOG ENTRIES */}
        <div className="news-left">
          {blogPosts.map((post, i) => (
            <div className="news-entry" key={i}>
              
              {/* DATE CIRCLE */}
              <div className="date-circle">
                <h3>15</h3>
                <p>Apr '18</p>
              </div>

              <div className="entry-content">

                <h2>{post.title}</h2>
                <div className="entry-meta">
                  <span>By {post.author}</span> |
                  <span> In {post.category}</span> |
                  <span> {post.comments} Comments</span>
                </div>

                <img src={post.image} alt={post.title} />

                <p className="entry-text">{post.text}</p>
              </div>

            </div>
          ))}

          {/* PAGINATION */}
          <div className="pagination">
            <span>01.</span>
            <span>02.</span>
            <span>03.</span>
            <span>04.</span>
          </div>
        </div>

        {/* RIGHT COLUMN – SIDEBAR */}
        <div className="news-right">

          {/* SEARCH BAR */}
          <div className="sidebar-box search-box">
            <input type="text" placeholder="Search" />
            <button>🔍</button>
          </div>

          {/* CATEGORIES */}
          <div className="sidebar-box">
            <h3>Categories</h3>
            <ul>
              <li>Real Estate <span>20</span></li>
              <li>Properties <span>33</span></li>
              <li>Selling Information <span>44</span></li>
              <li>Vacation homes <span>52</span></li>
              <li>Uncategorized <span>12</span></li>
            </ul>
          </div>

          {/* LATEST POSTS */}
          <div className="sidebar-box">
            <h3>Latest Posts</h3>

            <div className="latest-post">
              <img src="https://preview.colorlib.com/theme/bluesky/img/blog/popular-post/post1.jpg" />
              <div>
                <h4>How to choose a house?</h4>
                <p>By William Smith</p>
              </div>
            </div>

            <div className="latest-post">
              <img src="https://preview.colorlib.com/theme/bluesky/img/blog/popular-post/post2.jpg" />
              <div>
                <h4>How to spot bargains</h4>
                <p>By William Smith</p>
              </div>
            </div>

            <div className="latest-post">
              <img src="https://preview.colorlib.com/theme/bluesky/img/blog/popular-post/post3.jpg" />
              <div>
                <h4>3 Tips to get a bargain on a home</h4>
                <p>By William Smith</p>
              </div>
            </div>

            <div className="latest-post">
              <img src="https://preview.colorlib.com/theme/bluesky/img/blog/popular-post/post4.jpg" />
              <div>
                <h4>The best cities to own a house</h4>
                <p>By William Smith</p>
              </div>
            </div>
          </div>

          {/* SEARCH YOUR HOME WIDGET */}
          <div className="sidebar-box search-home-box">

            <h3>Search your home</h3>

            <select><option>Keywords</option></select>
            <select><option>Property ID</option></select>
            <select><option>Property Status</option></select>
            <select><option>City</option></select>
            <select><option>Property Type</option></select>
            <select><option>Bedrooms No</option></select>
            <select><option>Bathrooms No</option></select>

            {/* Price sliders (static) */}
            <div className="price-slider">
              <p>Min Price — Max Price</p>
              <input type="range" />
              <input type="range" />
            </div>

            <button className="sidebar-search-btn">SEARCH</button>
          </div>

        </div>
      </section>

      <Newsletter />
    </main>
  );
}
