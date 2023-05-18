const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');

// UC-101 inloggen
router.post('/login', apiController.loginUser);

// UC-102 info
router.get('/info', apiController.getInfo);

module.exports = router;
