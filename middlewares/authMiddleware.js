const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "Access denied. No Authorization header." });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({ msg: "Access denied. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optionally ensure required properties exist
    if (!decoded?.id) {
      return res.status(403).json({ msg: "Token payload incomplete. Access denied." });
    }

    req.user = decoded; // Attach user info (e.g., id, role) to request
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};
