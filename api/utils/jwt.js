const jwt = require("jsonwebtoken");

// Secret key used for signing JWTs — should be moved to environment variables in production
const SECRET = "SOME_SECRET_KEY_123";

/**
 * Generates a JWT token for the provided user object.
 *
 * @param {Object} user - The user object to encode into the token (e.g., { id, role })
 * @returns {string} - A signed JWT token valid for 1 hour
 */
function generateToken(user) {
  return jwt.sign(user, SECRET, { expiresIn: "1h" });
}

module.exports = { generateToken };
