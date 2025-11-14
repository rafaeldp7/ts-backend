const express = require("express");
const router = express.Router();
const {
  getAllUserMotors,
  getUserMotorsByUserId,
  createUserMotor,
  updateUserMotor,
  deleteUserMotor,
  getUserMotorCount,
  logOilChange,
  logTuneUp,
  getUserOverviewAnalytics,
  getMotorOverviewAnalytics,
  recalculateAllMotorAnalytics,
  getMotorFuelLevel,
  updateFuelLevel,
  updateFuelLevelByLiters,
  updateEfficiency,
} = require("../controllers/userMotorController");



// UPDATE DATA

router.put("/fix-motor-analytics", recalculateAllMotorAnalytics);


// 🚗 User-Motor CRUD
router.get("/", getAllUserMotors); // GET all
router.get("/count", getUserMotorCount); // GET total count
router.get("/user/:id", getUserMotorsByUserId); // GET by userId
router.get("/:id/fuel", getMotorFuelLevel); // GET motor fuel level
router.post("/", createUserMotor); // POST new motor
router.put("/:id", updateUserMotor); // PUT update motor
router.delete("/:id", deleteUserMotor); // DELETE motor
router.put("/:id/fuel", updateFuelLevel); // Update fuel level (by percentage)
router.put("/:id/fuel/liters", updateFuelLevelByLiters); // Update fuel level (by liters - converts to percentage)
router.put("/:id/updateEfficiency", updateEfficiency); // Update fuel efficiency


router.get("/user-overview/:userId", getUserOverviewAnalytics);
router.get("/motor-overview/:motorId", getMotorOverviewAnalytics);





// 🛠️ Maintenance Logs
router.post("/:id/oil-change", logOilChange); // Log oil change
router.post("/:id/tune-up", logTuneUp); // Log tune-up

module.exports = router;
