const express = require("express");
const router = express.Router();
const mealController = require("../controllers/meal.controller");
const { authenticateJWT } = require("../middleware/auth.middleware");

// UC-301 Maaltijd aanmaken
router.post("", authenticateJWT, mealController.createMeal);

// UC-302 Maaltijd wijzigen
router.put("/:mealId", authenticateJWT, mealController.updateMeal);

// UC-303 Opvragen van maaltijden
router.get("", mealController.getAllMeals);

// UC-304 Opvragen van maaltijd bij ID
router.get("/:mealId", mealController.getMealWithId);

// UC-305 Maaltijd verwijderen
router.delete("/:mealId", authenticateJWT, mealController.deleteMeal);

module.exports = router;
