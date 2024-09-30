const express = require('express');
const router = express.Router();

// นำเข้าเส้นทางต่าง ๆ
const authRoutes = require('./authRoutes');
const protectedRoutes = require('./protectedRoutes');
const masterRoutes = require('./masterRoutes');
const leaveRoutes = require('./leave');
const users = require('./users');
const lineApi = require('./lineapi');

// ใช้เส้นทางต่าง ๆ
router.use('/auth', authRoutes);
router.use('/protected', protectedRoutes);
router.use('/master', masterRoutes);
router.use('/users', users);
router.use('/leave', leaveRoutes);
router.use('/lineApi', lineApi);

module.exports = router;
