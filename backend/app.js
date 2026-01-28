const express = require("express");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
// const cron = require("node-cron");
const tripplanerouter=require("./routes/tripplane.routes")
const authentication=require("./routes/Authentication.routes")


dotenv.config();

const app=express();
app.use(cookieParser())

// ✅ JSON parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));



// ✅ Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // ✅ allow cookies from frontend
}));

//✔️✅‼️ routing hear ..........
app.use("/api/auth",authentication)
app.use("/api/plane",tripplanerouter)
// ✅ Server listening
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🌍 Server running at http://localhost:${PORT}`));
