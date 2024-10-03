const path = require('path');
const readXlsxFile = require('read-excel-file/node');
const { Readable } = require('stream');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/AdminModel');
const UsersdbModel = require('../models/UsersdbModel');
const Usersdb = require('../models/UsersdbModel');

// สำหรับดูข้อมูลทั้งหมด
exports.getAllUsers = async (req, res) => {
    try {
        const users = await Usersdb.find({});
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// สำหรับดูข้อมูล ด้วย ID
exports.getUser = async (req, res) => {
    try {
        const user = await Usersdb.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// สำหรับดูข้อมูล ด้วย lineId
exports.getUserByLineId = async (req, res) => {
    try {
        const user = await Usersdb.findOne({ lineId: req.params.lineId });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// สำหรับอัพเดตข้อมูล ด้วย ID
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Usersdb.findById(id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const updatedUser = await Usersdb.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// route สำหรับดึงข้อมูลผู้ใช้ ด้วย name
exports.getUserByName = async (req, res) => {
    try {
        const users = await Usersdb.find({ name: req.params.name });
        if (users.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
}