const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// UC-201 Registreren als nieuwe user
router.post('', userController.createUser);

// UC-202 Opvragen van overzicht van users
router.get('', authenticateJWT, userController.getAllUsers);

// UC-203 Opvragen van gebruikersprofiel
router.get('/profile/:id', authenticateJWT, userController.getUserProfile); 

// UC-204 User opvragen met userId
router.get('/:id', authenticateJWT, userController.getUserWithId);

// UC-205 User wijzigen
router.put('/:id', authenticateJWT, userController.updateUser);
  
// UC-206 User verwijderen
router.delete('/:id', authenticateJWT, userController.deleteUser);


module.exports = router;
