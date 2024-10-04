const express = require('express');
const router = express.Router();
const LeaveResignController = require('../controllers/LeaveResignController');

// Route สำหรับสร้างข้อมูล
router.post('/createLeaveResign', LeaveResignController.createLeaveResign);

// Route สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/getLeavesResign', LeaveResignController.getLeavesResign);

// Route สำหรับดึงข้อมูล ด้วย id
router.get('/getLeaveResign/:id', LeaveResignController.getLeaveResign);

// Route สำหรับอัพเดตข้อมูล
router.put('/updateLeaveResign/:id', LeaveResignController.updateLeaveResign);

// Route สำหรับดึงข้อมูล ด้วย lineId
router.get('/getLeavesResignByLineId/:lineId', LeaveResignController.getLeaveResignByLineId);

// Route สำหรับดึงข้อมูล ด้วย initialLeaveApprover หรือ finalLeaveApprover
router.get('/getLeaveResignByApprover/:approver', LeaveResignController.getLeaveResignByApprover);

module.exports = router;