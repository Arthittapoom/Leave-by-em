const path = require('path');
const readXlsxFile = require('read-excel-file/node');
const { Readable } = require('stream');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/AdminModel');
const UsersdbModel = require('../models/UsersdbModel');
const Leaves = require('../models/LeaveModel');

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