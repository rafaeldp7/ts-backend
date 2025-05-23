const express = require("express");
const router = express.Router();
const controller = require("../controllers/savedDestinationController");

router.get("/:userId", controller.getUserDestinations);
router.post("/", controller.addDestination);
router.delete("/:id", controller.deleteDestination);
router.put("/:id", controller.updateDestination);

module.exports = router;
 