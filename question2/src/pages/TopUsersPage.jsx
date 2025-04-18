import React, { useEffect, useState } from "react";
import axios from "axios";

function TopUsersPage() {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/users").then(res => {
      setTopUsers(res.data.topUsers);
    });
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Top 5 Users</h2>
      <ul className="grid gap-4">
        {topUsers.map(user => (
          <li key={user.userId} className="bg-white p-4 rounded shadow">
            <div className="flex items-center gap-4">
              <img src={`https://i.pravatar.cc/150?u=${user.userId}`} alt="avatar" className="w-16 h-16 rounded-full" />
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p>{user.commentCount} Comments</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TopUsersPage;