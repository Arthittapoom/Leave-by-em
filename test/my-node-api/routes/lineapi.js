const express = require('express');
const router = express.Router();
const usersController = require('../controllers/lineapiController');

// Route สำหรับจัดการ Webhook ของ LINE
router.post('/webhook', usersController.handleWebhook);

//ส่งข้อความ ไป line ด้วย idline
router.post('/sendText', usersController.sendText);

module.exports = router;
