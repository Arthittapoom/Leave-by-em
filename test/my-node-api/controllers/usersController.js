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