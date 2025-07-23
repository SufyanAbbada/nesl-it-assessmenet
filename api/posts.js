// Generate an array of 25 mock posts for testing and frontend rendering
module.exports = Array.from({ length: 25 }, (_, i) => ({
  _id: `p${i + 1}`, // Unique post ID (e.g., p1, p2, ...)
  author: i % 2 === 0 ? "u2" : "u1", // Alternate between admin (u2) and user (u1)
  content: `This is post #${i + 1}`, // Post content
  created: new Date(Date.now() - i * 1000 * 60 * 60), // Created time, spaced 1 hour apart
}));
