const path = require('path');
const readXlsxFile = require('read-excel-file/node');
const { Readable } = require('stream');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/AdminModel');
const UsersdbModel = require('../models/UsersdbModel');
const Leaves = require('../models/LeaveModel');

const LeaveDataModel = require('../models/LeaveDataModel'); 

// สำหรับสร้างข้อมูล
exports.createLeave = async (req, res) => {
    try {
        const newLeave = new Leaves(req.body);
        const savedLeave = await newLeave.save();
        res.json(savedLeave);
    } catch (err) {
        res.status(500).send('Server error'+err);
    }
    // res.status(200).send(req.body);
};

// สำหรับดูข้อมูลทั้งหมด
exports.getLeaves = async (req, res) => {
    try {
        const Leavesdb = await Leaves.find({});
        res.json(Leavesdb);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// สำหรับดูข้อมูล ด้วย ID
exports.getLeave = async (req, res) => {
    try {
        const leave = await Leaves.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        res.json(leave);
    } catch (err) {
        res.status(500).send('Server error');
    }
};


// สำหรับอัพเดตข้อมูล ด้วย ID
exports.updateLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await Leaves.findById(id);
        if (!leave) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        const updatedLeave = await Leaves.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json(updatedLeave);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Route สำหรับดึงข้อมูล ด้วย lineId ทั้งหมด
exports.getLeavesByLineId = async (req, res) => {
    try {
        const Leavesdb = await Leaves.find({ lineId: req.params.lineId });
        if (Leavesdb.length === 0) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        res.json(Leavesdb);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Route สำหรับดึงข้อมูล ด้วย initialLeaveApprover หรือ finalLeaveApprover
exports.getLeavesByApprover = async (req, res) => {
    try {
        const Leavesdb = await Leaves.find({ $or: [{ initialLeaveApprover: req.params.approver }, { finalLeaveApprover: req.params.approver }] });
        if (Leavesdb.length === 0) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        res.json(Leavesdb);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Route สำหรับสร้างประเภทการลา
// router.post('/createLeaveType', leaveController.createLeaveType);

exports.createLeaveType = async (req, res) => {
    try {
        const newLeaveType = new LeaveDataModel(req.body);
        const savedLeaveType = await newLeaveType.save();
        res.json(savedLeaveType);
    } catch (err) {
        res.status(500).send('Server error'+err);
    }
}


// Route สำหรับอัพเดตข้อมูลประเภทการลา ด้วย label
// router.put('/updateLeaveTypeByLabel/:label', leaveController.updateLeaveTypeByLabel);

exports.updateLeaveTypeByLabel = async (req, res) => {
    try {
        const { label } = req.params;
        const leaveType = await LeaveDataModel.findOne({ label: label });
        if (!leaveType) {
            return res.status(404).json({ msg: 'Leave type not found' });
        }
        const updatedLeaveType = await LeaveDataModel.findOneAndUpdate({ label: label }, req.body, {
            new: true
        });
        res.json(updatedLeaveType);
    } catch (err) {
        res.status(500).send('Server error');
    }
}

// Route สำหรับดึงข้อมูลประเภทการลา ด้วย label
// router.get('/getLeaveTypeByLabel/:label', leaveController.getLeaveTypeByLabel);

exports.getLeaveTypeByLabel = async (req, res) => {
    try {
        const leaveType = await LeaveDataModel.findOne({ label: req.params.label });
        if (!leaveType) {
            return res.status(404).json({ msg: 'Leave type not found' });
        }
        res.json(leaveType);
    } catch (err) {
        res.status(500).send('Server error');
    }
}