import express from 'express';
import axios from 'axios';

const app = express();
const PORT = 3000;

const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ0OTU4ODA3LCJpYXQiOjE3NDQ5NTg1MDcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjVmNmYxODZiLTg5NGQtNDRhMy05MzlkLWY3ZTgyYTE5ZWFjOCIsInN1YiI6ImFiaGlzaGVrLnNoYXJtYV9jczIyQGdsYS5hYy5pbiJ9LCJlbWFpbCI6ImFiaGlzaGVrLnNoYXJtYV9jczIyQGdsYS5hYy5pbiIsIm5hbWUiOiJhYmhpc2hlayBzaGFybWEiLCJyb2xsTm8iOiIyMjE1MDAwMDYxIiwiYWNjZXNzQ29kZSI6IkNObmVHVCIsImNsaWVudElEIjoiNWY2ZjE4NmItODk0ZC00NGEzLTkzOWQtZjdlODJhMTllYWM4IiwiY2xpZW50U2VjcmV0IjoiTkV5VURFckFrdlZoV1ROeSJ9.QJkSX_hSDbmENWz3zZgu3eaofwT9DBxmjnrGZ5ZTjhQ";
const userApi = 'http://20.244.56.144/evaluation-service/users';
const postApi = (userId) => `http://20.244.56.144/evaluation-service/users/${userId}/posts`;
const commentApi = (postId) => `http://20.244.56.144/evaluation-service/posts/${postId}/comments`;

const axiosInstance = axios.create({
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

let allPosts = [];
let postCommentCounts = {};

const preloadData = async () => {
  try {
    const usersRes = await axiosInstance.get(userApi);
    const users = usersRes.data.users;
    const userIds = Object.keys(users);

    const postPromises = userIds.map(async (uid) => {
      try {
        const res = await axiosInstance.get(postApi(uid));
        const userPosts = res.data.posts || [];
        userPosts.forEach((p) => (p.userid = uid));
        return userPosts;
      } catch (err) {
        console.warn(`Failed to fetch posts for user ${uid}:`, err.message);
        return [];
      }
    });

    const allUserPosts = await Promise.all(postPromises);
    allPosts = allUserPosts.flat();

    const commentPromises = allPosts.map(async (post) => {
      try {
        const res = await axiosInstance.get(commentApi(post.id));
        const comments = res.data.comments || [];
        postCommentCounts[post.id] = comments.length;
      } catch (err) {
        console.warn(`Failed to fetch comments for post ${post.id}:`, err.message);
        postCommentCounts[post.id] = 0;
      }
    });

    await Promise.all(commentPromises);
    console.log("Data preloaded successfully!");
  } catch (err) {
    console.error(" Error preloading data:", err.message);
  }
};

app.get("/users", async (req, res) => {
  try {
    const usersRes = await axiosInstance.get(userApi);
    const users = usersRes.data.users;
    const userCommentCount = {};
    const userIds = Object.keys(users);

    for (const userId of userIds) {
      let totalComments = 0;

      try {
        const postsRes = await axiosInstance.get(postApi(userId));
        const posts = postsRes.data.posts || [];

        for (const post of posts) {
          totalComments += postCommentCounts[post.id] || 0;
        }
      } catch (postErr) {
        console.warn(`Failed to fetch posts for user ${userId}:`, postErr.message);
      }

      userCommentCount[userId] = totalComments;
    }

    const sortedTopUsers = Object.entries(userCommentCount)
      .map(([userId, commentCount]) => ({
        userId,
        name: users[userId] || 'Unknown',
        commentCount,
      }))
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 5);

    res.json({ topUsers: sortedTopUsers });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});

app.get("/posts", async (req, res) => {
  const type = req.query.type;
  if (!type || !['latest', 'popular'].includes(type)) {
    return res.status(400).json({ message: "Query param 'type' is required: 'latest' or 'popular'" });
  }

  if (type === 'latest') {
    const latestPosts = allPosts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    return res.json({ type: "latest", posts: latestPosts });
  }

  if (type === 'popular') {
    const maxCount = Math.max(...Object.values(postCommentCounts));
    const popularPosts = allPosts.filter(
      (post) => postCommentCounts[post.id] === maxCount
    );
    return res.json({ type: "popular", maxCommentCount: maxCount, posts: popularPosts });
  }
});

preloadData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
