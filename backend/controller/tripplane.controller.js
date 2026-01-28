// const express=require('express')


// module.exports.tripplane=async()=>{
//     console.log("trip palne controller");
// }


const Trip = require("../models/tripplane.model");

module.exports.tripplane = async (req, res) => {
  try {
    const {
      tripName,
      tripType,
      startingFrom,
      mainDestination,
      startDate,
      endDate,
      travelMode,
      groupSize,
      budget,
      avgRating,
      members,
      places,
    } = req.body;

    const totalDays =
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      ) + 1;

    const trip = await Trip.create({
      tripName,
      tripType,
      startingFrom,
      mainDestination,
      startDate,
      endDate,
      totalDays,
      travelMode,
      groupSize,
      budget,
      avgRating,
      members,
      places,
      createdBy: req.user.userId, // from JWT middleware
    });

    res.status(201).json({
      message: "Trip created successfully ✅",
      trip,
    });
  } catch (error) {
    console.error("Create trip error:", error);
    res.status(500).json({ message: "Failed to create trip" });
  }
};
