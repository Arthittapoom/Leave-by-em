const express = require('express');
const router = express.Router();
const { register, login, home, logout, getUserData } = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/me', authenticateToken, getUserData);
router.post('/register', register);
router.post('/login', login);
router.get('/', home);
router.post('/logout', logout);

module.exports = router;