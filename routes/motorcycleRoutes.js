const express = require("express");
const router = express.Router();
const motorcycleController = require("../controllers/motorcycleController");

// GET active motorcycles
router.get("/", motorcycleController.getAllMotorcycles);

// (Optional) GET all motorcycles including deleted
// router.get("/all", motorcycleController.getAllIncludingDeleted); 

// POST new motorcycle
router.post("/", motorcycleController.createMotorcycle);

// PUT update motorcycle
router.put("/:id", motorcycleController.updateMotorcycle);

// DELETE (soft-delete) motorcycle
router.delete("/:id", motorcycleController.deleteMotorcycle);

// PUT restore soft-deleted motorcycle
router.put("/restore/:id", motorcycleController.restoreMotorcycle);



module.exports = router;
