const multer = require('multer');
const path = require('path');

// การตั้งค่า storage สำหรับรูปภาพ
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/img'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// การตั้งค่า storage สำหรับไฟล์อื่นๆ
const fileStorage = multer.memoryStorage();

// ตัวกรองไฟล์
const fileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
        req.fileType = 'image'; // กำหนดประเภทของไฟล์
        cb(null, true); // อนุญาตให้ผ่านการตรวจสอบ
    } else {
        req.fileType = 'other';
        cb(null, true); // อนุญาตให้ผ่านการตรวจสอบ
    }
};

// กำหนด upload middleware สำหรับรูปภาพ
const uploadImage = multer({
    storage: imageStorage,
    fileFilter: fileFilter
}).single('image');

// กำหนด upload middleware สำหรับไฟล์อื่นๆ
const uploadOther = multer({
    storage: fileStorage,
    fileFilter: fileFilter
}).array('files'); // ใช้ .array() สำหรับไฟล์หลายไฟล์

module.exports = { uploadImage, uploadOther };
