const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// Route สำหรับสร้างข้อมูล
router.post('/createLeave', leaveController.createLeave);

// Route สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/getLeaves', leaveController.getLeaves);

// Route สำหรับดึงข้อมูล ด้วย id
router.get('/getLeave/:id', leaveController.getLeave);

// Route สำหรับอัพเดตข้อมูล
router.put('/updateLeave/:id', leaveController.updateLeave);

module.exports = router;