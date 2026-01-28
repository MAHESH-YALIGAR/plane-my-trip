const express=require("express")
const router=express();
const {tripplane}=require("../controller/tripplane.controller") 
const {authmiddleware}=require("../middleware/auth.middleware")

router.post("/create",authmiddleware,tripplane)

module.exports=router;