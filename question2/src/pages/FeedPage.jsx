import React, { useEffect, useState } from "react";
import axios from "axios";

function FeedPage() {
  const [feed, setFeed] = useState([]);

  const fetchFeed = () => {
    axios.get("http://localhost:3000/posts?type=latest").then(res => {
      setFeed(res.data.posts);
    });
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Real-time Feed</h2>
      <ul className="grid gap-4">
        {feed.map(post => (
          <li key={post.id} className="bg-white p-4 rounded shadow">
            <img src={`https://picsum.photos/seed/${post.id}/500/300`} alt="post" className="rounded mb-2" />
            <h3 className="font-bold">{post.title}</h3>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FeedPage;