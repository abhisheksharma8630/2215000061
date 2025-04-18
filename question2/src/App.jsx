import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TopUsersPage from "./pages/TopUsersPage";
import TrendingPostsPage from "./pages/TrendingPostsPage";
import FeedPage from "./pages/FeedPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4 text-center text-xl font-bold">
          Social Media Analytics
        </header>
        <nav className="bg-white shadow p-4 flex justify-center gap-6">
          <Link to="/" className="hover:underline">Top Users</Link>
          <Link to="/trending" className="hover:underline">Trending Posts</Link>
          <Link to="/feed" className="hover:underline">Feed</Link>
        </nav>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<TopUsersPage />} />
            <Route path="/trending" element={<TrendingPostsPage />} />
            <Route path="/feed" element={<FeedPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}