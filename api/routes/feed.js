const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const posts = require("../posts");

// GET /feed
// Protected route: accessible by users with role "user" or "admin"
// Supports pagination with optional query parameters: skip (offset), limit (page size)
router.get("/", authorize(["user", "admin"]), (req, res) => {
  // Extract pagination params from query with defaults
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;

  // Sort posts by created date (newest first)
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.created) - new Date(a.created)
  );

  // Slice the sorted posts based on skip and limit for pagination
  const paginated = sortedPosts.slice(skip, skip + limit);

  // Return the paginated posts as JSON
  res.json(paginated);
});

module.exports = router;
