const path = require('path');
const readXlsxFile = require('read-excel-file/node');
const { Readable } = require('stream');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const AdminUser = require('../models/AdminModel');
const UsersdbModel = require('../models/UsersdbModel');
exports.getAllUsers = async (req, res) => {
    try {
        const users = await AdminUser.find({});
        res.json(users);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.listUsers = async (req, res) => {
    try {
        const users = await AdminUser.find({});
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

    resbody = [];

    for (let e of rows.slice(2)) { // Assuming the first 2 rows are headers
        var body = {};
        var intcol = 0;

        body.index = (e[intcol] + '').trim(); intcol++; // ลำดับ
        body.code = (e[intcol] + '').trim(); intcol++; // รหัส
        body.department = (e[intcol] + '').trim(); intcol++; // สังกัด
        body.name = (e[intcol] + '').trim(); intcol++; // ชื่อ-สกุล
        body.nickname = (e[intcol] + '').trim(); intcol++; // ชื่อเล่น
        body.position = (e[intcol] + '').trim(); intcol++; // ตำแหน่ง
        body.employeeType = (e[intcol] + '').trim(); intcol++; // ประเภทพนักงาน
        body.division = (e[intcol] + '').trim(); intcol++; // ฝ่าย
        body.workplace = (e[intcol] + '').trim(); intcol++; // สถานที่ปฏิบัติงาน
        body.startDate = (new Date(e[intcol]).toISOString()); intcol++; // วันที่เริ่มงาน
        body.passedDate = (new Date(e[intcol]).toISOString()); intcol++; // วันที่ผ่านโปร

        // คำนวณอายุงาน (จำนวนวันทำงาน)
        const startDate = new Date(body.startDate);
        const passedDate = new Date(body.passedDate);
        const timeDiff = Math.abs(passedDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        body.diffDays_days = diffDays.toString(); // จำนวนวันทำงาน (เก็บเป็น string)
        body.diffDays_months = (diffDays / 30).toFixed(2).toString(); // จำนวนเดือนทำงาน (เก็บเป็น string)
        body.diffDays_years = (diffDays / 365).toFixed(2).toString(); // จำนวนปีทำงาน (เก็บเป็น string)

        body.diffDays_days_exl = (e[intcol] + '').trim(); intcol++; // จำนวนวันทำงาน จาก Excel

        body.sickLeave_days = (e[intcol] + '').trim(); intcol++; // ป่วย/วัน
        body.sickLeave_hours = (e[intcol] + '').trim(); intcol++; // ป่วย/ชม.
        body.totalSickLeave = (e[intcol] + '').trim(); intcol++; // รวมวันลาป่วย
        body.remainingSickLeave = (e[intcol] + '').trim(); intcol++; // สิทธิ์คงเหลือวันลาป่วย
        body.personalLeave_days = (e[intcol] + '').trim(); intcol++; // กิจ/วัน
        body.personalLeave_hours = (e[intcol] + '').trim(); intcol++; // กิจ/ชม.
        body.totalPersonalLeave = (e[intcol] + '').trim(); intcol++; // รวมวันลากิจ
        body.remainingPersonalLeave = (e[intcol] + '').trim(); intcol++; // สิทธิ์คงเหลือวันลากิจ
        body.vacationLeave_days = (e[intcol] + '').trim(); intcol++; // พักร้อน/วัน
        body.vacationLeave_hours = (e[intcol] + '').trim(); intcol++; // พักร้อน/ชม.
        body.totalVacationLeave = (e[intcol] + '').trim(); intcol++; // รวมพักร้อน
        body.remainingVacationLeave = (e[intcol] + '').trim(); intcol++; // สิทธิ์คงเหลือวันพักร้อน
        body.grantedVacationLeave = (e[intcol] + '').trim(); intcol++; // สิทธิ์พักร้อนที่ได้
        body.unpaidLeave_days = (e[intcol] + '').trim(); intcol++; // ไม่รับค่าจ้าง/วัน
        body.unpaidLeave_hours = (e[intcol] + '').trim(); intcol++; // ไม่รับค่าจ้าง/ชม.
        body.totalUnpaidLeave = (e[intcol] + '').trim(); intcol++; // รวมไม่รับค่าจ้าง
        body.specialPersonalLeave = (e[intcol] + '').trim(); intcol++; // ลากิจพิเศษ
        body.ordinationLeave = (e[intcol] + '').trim(); intcol++; // ลาเพื่ออุปสมบท
        body.maternityLeave = (e[intcol] + '').trim(); intcol++; // ลาคลอด
        body.workInjuryLeave_days = (e[intcol] + '').trim(); intcol++; // ลาป่วย (เนื่องจากบาดเจ็บในงาน)/วัน
        
        // ผู้อนุมัติการลาขั้นต้นและผู้อนุมัติสูงสุด
        body.initialLeaveApprover = (e[intcol] + '').trim(); intcol++; // ผู้อนุมัติการลาขั้นต้น
        body.finalLeaveApprover = (e[intcol] + '').trim(); intcol++; // ผู้อนุมัติสูงสุด

        // ตรวจสอบว่ามีข้อมูลในฐานข้อมูลอยู่แล้วหรือไม่โดยใช้ 'code' เป็นตัวระบุ
        const existingUser = await UsersdbModel.findOne({ code: body.code });

        if (existingUser) {
            // ถ้ามีข้อมูลอยู่แล้วให้ทำการอัปเดตข้อมูล
            await UsersdbModel.updateOne({ code: body.code }, body);
        } else {
            // ถ้าไม่มีข้อมูลให้ทำการเพิ่มใหม่
            await UsersdbModel.create(body);
        }

        resbody.push(body);
    }

    res.status(200).json({
        status: 'success',
        data: resbody
    });
});

// Route สำหรับอัปโหลดรูปภาพ แบบ Base64
