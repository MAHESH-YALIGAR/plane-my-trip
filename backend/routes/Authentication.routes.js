const express=require("express")
const router=express();
const User=require("../models/authentication.model")
const {userRegister,login,logout}=require("../controller/authetication.controller")
const {verifyToken} =require("../middleware/cookie.middleware")
router.post("/register",userRegister);
router.post("/login",login);
router.post("/logout",logout)

//this is for the get cookie in  context
router.get("/me", verifyToken, async (req, res) => {
  try{
    console.log("🔍 /me endpoint called");
    console.log("req.user:", req.user);
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }

    const user = await User.findById(req.user.userId).select("-password");
    console.log("✅ User found:", user);
    
    if(!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  }
  catch(error){
    console.error("❌ /me endpoint error:", error.message);
    res.status(500).json({ message: "Error fetching user data", error: error.message });
  }
});

module.exports=router;