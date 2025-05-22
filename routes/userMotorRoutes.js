const express = require("express");
const router = express.Router();
const controller = require("../controllers/userMotorController");

router.get("/user-motors/:id", controller.getUserMotorsByUserId);
router.get("/user-motors", controller.getAllUserMotors);
router.post("/user-motors", controller.createUserMotor);
router.put("/user-motors/:id", controller.updateUserMotor);
router.delete("/user-motors/:id", controller.deleteUserMotor);

module.exports = router;
