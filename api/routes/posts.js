const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const posts = require("../posts");

/**
 * DELETE /posts/:id
 * Allows an admin to delete a post by its ID.
 * Requires Bearer token with role = "admin"
 */
router.delete("/:id", authorize(["admin"]), (req, res) => {
  const postId = req.params.id;

  // Find the index of the post with the given ID
  const index = posts.findIndex((p) => p._id === postId);

  // If post not found, return 404
  if (index === -1) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Remove the post from the in-memory array
  posts.splice(index, 1);

  // Return success message
  res.json({ message: `Post ${postId} deleted.` });
});

module.exports = router;
