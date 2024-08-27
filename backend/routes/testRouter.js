const express = require('express');
const testController = require('../controllers/testController');
const router = express.Router();
var multer = require('multer');
const uploadExcel = multer();

router
  .route('/migrateData')
  .post(uploadExcel.any(), testController.migrateData);

module.exports = router;
