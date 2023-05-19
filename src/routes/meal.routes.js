const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');

// UC-301 Maaltijd aanmaken
router.post('', mealController.createMeal);

// UC-302 Maaltijd wijzigen
router.put('/:mealId', mealController.updateMeal);

// UC-303 Opvragen van maaltijden
router.get('', mealController.getAllMeals);

// UC-304 Opvragen van maaltijd bij ID
router.get('/:mealId', mealController.getMealWithId);

// UC-305 Maaltijd verwijderen
router.delete('/:mealId', mealController.deleteMeal);

module.exports = router;
