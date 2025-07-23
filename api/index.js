// Import core modules
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require('dotenv');
dotenv.config();

// Import custom modules
const postsRouter = require("./routes/posts");
const feedRouter = require("./routes/feed");
const users = require("./users");
const { generateToken } = require("./utils/jwt");

const app = express();

app.set("trust proxy", 1);

// Apply middleware
app.use(express.json({ limit: "20kb" })); // Limit JSON body size to prevent abuse
app.use(cors()); // Allow requests from frontend which we are using, for testing as of now
app.use(helmet()); // Set secure HTTP headers

// Rate limiter to prevent brute-force attacks on login
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // Limit to 5 login requests per IP per minute
  message: { error: "Too many login attempts. Try again later." },
});

// Public login route - issues JWT on valid user ID
app.post("/login", loginLimiter, (req, res) => {
  const { id } = req.body;
  const user = users.find((u) => u.id === id);
  if (!user) return res.status(401).json({ error: "Invalid user ID" });

  const token = generateToken(user);
  res.json({ token });
});

// Protected routes
app.use("/posts", postsRouter); // Routes for post deletion (admin only)
app.use("/feed", feedRouter); // Routes for paginated post feed (user/admin)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export app for testing
module.exports = app;
