const express = require('express');
const router = express.Router();

// นำเข้าเส้นทางต่าง ๆ
const authRoutes = require('./authRoutes');
const protectedRoutes = require('./protectedRoutes');
const masterRoutes = require('./masterRoutes');

// ใช้เส้นทางต่าง ๆ
router.use('/auth', authRoutes);
router.use('/protected', protectedRoutes);
router.use('/master', masterRoutes);

module.exports = router;
