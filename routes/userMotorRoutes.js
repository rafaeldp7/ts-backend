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
} = require("../controllers/userMotorController");

// 🚗 User-Motor CRUD
router.get("/", getAllUserMotors); // GET all
router.get("/count", getUserMotorCount); // GET total count
router.get("/user/:id", getUserMotorsByUserId); // GET by userId
router.post("/", createUserMotor); // POST new motor
router.put("/:id", updateUserMotor); // PUT update motor
router.delete("/:id", deleteUserMotor); // DELETE motor

router.get("/user-overview/:userId", getUserOverviewAnalytics);
router.get("/motor-overview/:motorId", getMotorOverviewAnalytics);

// 🛠️ Maintenance Logs
router.post("/:id/oil-change", logOilChange); // Log oil change
router.post("/:id/tune-up", logTuneUp); // Log tune-up

module.exports = router;
