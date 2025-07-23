const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

// Middleware factory that checks JWT and user role
module.exports = function authorize(allowedRoles) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check for presence and format of the Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Bearer token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, SECRET);

      // Check if the user's role is allowed
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // Attach user info to the request for downstream access
      req.user = decoded;
      next();
    } catch (err) {
      // Handle token verification errors (e.g. expired or malformed)
      return res.status(401).json({ error: "Invalid token" });
    }
  };
};
