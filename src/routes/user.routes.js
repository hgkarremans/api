const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Hier werk je de routes uit.
// UC-201 Registreren als nieuwe user
router.post('', userController.createUser);

// UC-202 Opvragen van overzicht van users
router.get('', userController.getAllUsers);

// UC-203 Opvragen van gebruikersprofiel
router.get('/profile', userController.getUserProfile); 

// UC-204 User opvragen met userId
router.get('/:userId', userController.getUserWithId);

// UC-205 User wijzigen
router.put('/:userId', userController.updateUser);

// UC-206 User verwijderen
router.delete('/:userId', userController.deleteUser);


module.exports = router;
