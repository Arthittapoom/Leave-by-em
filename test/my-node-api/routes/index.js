const express = require('express');
const router = express.Router();

// นำเข้าเส้นทางต่าง ๆ
const authRoutes = require('./authRoutes');
const protectedRoutes = require('./protectedRoutes');
const masterRoutes = require('./masterRoutes');

const users = require('./users');

// ใช้เส้นทางต่าง ๆ
router.use('/auth', authRoutes);
router.use('/protected', protectedRoutes);
router.use('/master', masterRoutes);

router.use('/users', users);

module.exports = router;
