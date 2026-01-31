const express=require("express")
const router=express();

const {nearest}=require("../controller/route.controller")
const {authmiddleware}=require("../middleware/auth.middleware")

router.post("/nearest",nearest)

module.exports=router;