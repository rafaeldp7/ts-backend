const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization"); // Kunin ang token sa header

  if (!token) {
    return res.status(401).json({ msg: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next(); // Proceed sa next middleware/controller
  } catch (error) {
    res.status(400).json({ msg: "Invalid token" });
  }
};
