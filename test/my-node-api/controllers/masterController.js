const path = require('path');
const readXlsxFile = require('read-excel-file/node');
const { Readable } = require('stream');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/UserModel');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.listUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    const filePath = path.join('uploads', 'img', req.file.filename);
    res.json({ message: 'File uploaded successfully', filePath });
};

exports.migrateData = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length < 1) {
        return next(new AppError('Please upload a file', 400));
    }

    const fileBuffer = req.files[0].buffer;
    if (!fileBuffer) {
        return next(new AppError('File buffer is empty', 400));
    }

    const stream = new Readable();
    stream.push(fileBuffer);
    stream.push(null);

    const rows = await readXlsxFile(stream);

    res.status(200).json({
        status: 'success',
        data: rows
    });
});
