import React, { useEffect, useState } from "react";
import axios from "axios";

function TrendingPostsPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/posts?type=popular").then(res => {
      setPosts(res.data.posts);
    });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Trending Posts</h2>
      <ul className="grid gap-4">
        {posts.map(post => (
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

export default TrendingPostsPage;