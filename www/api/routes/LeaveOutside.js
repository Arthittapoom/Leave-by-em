const express = require('express');
const router = express.Router();
const leaveOutsideController = require('../controllers/leaveOutsideController');

// Route สำหรับสร้างข้อมูล
router.post('/createLeaveOutside', leaveOutsideController.createLeaveOutside);

// Route สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/getLeavesOutside', leaveOutsideController.getLeavesOutside);

// Route สำหรับดึงข้อมูล ด้วย id
router.get('/getLeaveOutside/:id', leaveOutsideController.getLeaveOutside);

// Route สำหรับอัพเดตข้อมูล
router.put('/updateLeaveOutside/:id', leaveOutsideController.updateLeaveOutside);

// Route สำหรับดึงข้อมูล ด้วย lineId
router.get('/getLeavesOutsideByLineId/:lineId', leaveOutsideController.getLeaveOutsideByLineId);

// Route สำหรับดึงข้อมูล ด้วย initialLeaveApprover หรือ finalLeaveApprover
router.get('/getLeaveOutsideByApprover/:approver', leaveOutsideController.getLeaveOutsideByApprover);

module.exports = router;