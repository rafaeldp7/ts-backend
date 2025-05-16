const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "Access denied. No token provided." });
  }

  // Expected format: "Bearer <token>"
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();

  if (!token) {
    return res.status(401).json({ msg: "Access denied. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded should contain user id or userId as per your token sign
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({ msg: "Invalid token" });
  }
};
