const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const { uploadImage, uploadOther } = require('../middleware/upload');
// const { getAllUsers, listUsers, uploadImage: uploadImageController, migrateData } = require('../controllers/masterController');

const usersController = require('../controllers/usersController');

// Route สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/getUsers', usersController.getAllUsers);

// route สำหรับดึงข้อมูลผู้ใช้ ด้วย id
router.get('/getUser/:id', usersController.getUser);

// Route สำหรับดึงข้อมูล ด้วย lineId
router.get('/getUserByLineId/:lineId', usersController.getUserByLineId);

// route สำหรับดึงข้อมูลผู้ใช้ ด้วย name
router.get('/getUserByName/:name', usersController.getUserByName);

// Route สำหรับ update ข้อมูลผู้ใช้
router.put('/updateUser/:id', usersController.updateUser);

// Route สำหรับ update ด้วย lineId
router.put('/updateUserByLineId/:lineId', usersController.updateUserByLineId);



// Route สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
// router.get('/users', authenticateToken, getAllUsers);

// Route สำหรับดึงข้อมูลผู้ใช้ในรูปแบบรายการ
// router.get('/listusers', listUsers);

// Route สำหรับอัปโหลดรูปภาพ
// router.post('/upimg', uploadImage, uploadImageController);

// Route สำหรับอัปโหลดไฟล์อื่น ๆ และทำการย้ายข้อมูล
// router.post('/migrate-data', uploadOther, migrateData);





module.exports = router;