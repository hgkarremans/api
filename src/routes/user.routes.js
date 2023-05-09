const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Hier werk je de routes uit.
// UC-201 Registreren als nieuwe user
router.post('/:register', userController.createUser);

// UC-202 Opvragen van overzicht van users
router.get('', userController.getAllUsers);

// UC-204 User opvragen met userId
router.get('/:userid', userController.getUserWithId);

// UC-205 User wijzigen
router.put('/:update', userController.updateUser);

// UC-206 User verwijderen
router.delete('/delete', userController.deleteUser);


module.exports = router;
