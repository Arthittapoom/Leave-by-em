const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();
connectDB();

const app = express();

// ปรับขนาดสูงสุดสำหรับ JSON และ URL-encoded payload
app.use(express.json({ limit: '10mb' })); // เปลี่ยนเป็น 10MB หรือค่าที่ต้องการ
app.use(express.urlencoded({ limit: '10mb', extended: true })); // เปลี่ยนเป็น 10MB หรือค่าที่ต้องการ

app.use(cors());

// ตั้งค่า static file สำหรับการเข้าถึงไฟล์ที่อัปโหลด
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// index
app.get('/', (req, res) => {
    res.send('version 1.0.8');
});

// นำเข้าเส้นทางทั้งหมดจาก routes/index.js
const allRoutes = require('./routes');

// ใช้เส้นทางทั้งหมด
app.use('/', allRoutes);

const port = process.env.PORT || 3002;
app.listen(port, () => console.log('Server running on port ' + port));

module.exports = app;
