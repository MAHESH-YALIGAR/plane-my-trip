const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("../models/authentication.model");

// Middleware setup
const app = express();
app.use(cookieParser());
app.use(express.json());

// ---------------- REGISTER ----------------
module.exports.userRegister = async (req, res) => {
  console.log("it call the regester now ")
  try {
    const {firstName,lastName,email,password } = req.body;
console.log("you data is the ",firstName,lastName,email,password )
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 5);
    const user = new User({ firstName,lastName,email,password: hashed });
    await user.save();

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch (error) {
    console.error("❌ Error in userRegister:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// ---------------- LOGIN ----------------
module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // ✅ Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Set secure httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,       // ⛔ must be false on localhost
      sameSite: "lax",     // works on localhost
      maxAge: 24 * 60 * 60 * 1000
    });

    // ✅ Send response once with user data
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports.logout = (req,res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // Set true if using HTTPS
      sameSite: "lax",
    });

    res.status(200).json({ message: "Logged out successfully ✅" });
  } catch (error) {
    console.log("you are n still login not logout", error)
    return res.status(500).json({ message: "error in logout" })
  }
}




module.exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};