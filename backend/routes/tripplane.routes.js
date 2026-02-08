const express=require("express")
const router=express();
const {tripplane,getalltrip,saveRoutePlaces,getRoutePlaces}=require("../controller/tripplane.controller") 
const {authmiddleware}=require("../middleware/auth.middleware")

router.post("/create",authmiddleware,tripplane)
router.get("/getalltrip",authmiddleware,getalltrip)
router.post("/:Id/addnearplace",authmiddleware,saveRoutePlaces)
router.post("/:id/fullroute",authmiddleware,getRoutePlaces)

module.exports=router;