const jwt = require("jsonwebtoken");

module.exports.authmiddleware = (req, res, next) => {
  try {
    // 1️⃣ Get token from cookie
    const token = req.cookies.token;

    // 2️⃣ If no token
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    // 5️⃣ Continue
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
