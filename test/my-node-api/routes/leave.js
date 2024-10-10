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

// Route สำหรับดึงข้อมูล ด้วย lineId
router.get('/getLeavesByLineId/:lineId', leaveController.getLeavesByLineId);

// Route สำหรับดึงข้อมูล ด้วย initialLeaveApprover หรือ finalLeaveApprover
router.get('/getLeavesByApprover/:approver', leaveController.getLeavesByApprover);

// Route สำหรับสร้างประเภทการลา
router.post('/createLeaveType', leaveController.createLeaveType);

// Route สำหรับอัพเดตข้อมูลประเภทการลา ด้วย label
router.put('/updateLeaveTypeByLabel/:label', leaveController.updateLeaveTypeByLabel);

// Route สำหรับดึงข้อมูลประเภทการลา ด้วย label
router.get('/getLeaveTypeByLabel/:label', leaveController.getLeaveTypeByLabel);

module.exports = router;