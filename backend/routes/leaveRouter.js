const express = require('express');
const rateLimiter = require('../utils/apiFeatures');
const authController = require('../controllers/authController');
const leaveController = require('../controllers/leaveController');
const router = express.Router();
var multer = require('multer');
const uploadExcel = multer();
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    try {
      var fs = require('fs');
      var img = './img'
      if (!fs.existsSync(img)) {
        fs.mkdirSync(img);
      }
      var dir = './img/leave';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      callback(null, 'img/leave')
    }
    catch (err) {
      console.log(err);
    }
  },
  filename: function (req, file, callback) {
    try {
      const filename = ((new Date().getFullYear() + "") + ((new Date().getMonth() + 1) + "") + (new Date().getDate() + "") + (new Date().getHours() + "") + (new Date().getMinutes() + "")) + "-" + file.originalname.split('.')[0] + "." + file.mimetype.split('/')[1];
      console.log('file.mimetype', file.mimetype);
      callback(null, filename)
    }
    catch (err) {
      console.log(err);
    }
  },
})
const upload = multer({ storage });
const fileUpload = upload.fields([{ name: 'leave', maxCount: 1 }])
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
  windowMs: 2 * 1000, //2sec
  max: 1
})

router
  .route('/migrateData')
  .post(uploadExcel.any(), leaveController.migrateDatatest);

router
  .route('/exportDashboardData')
  .get(authController.protect, leaveController.exportDashboardData);

router
  .route('/exportLeaveData')
  .get(authController.protect, leaveController.exportLeaveData);

router
  .route('/getDataDashboard')
  .get(authController.protect, leaveController.getDataDashboard);

router
  .route('/getDashboardDataPaginate')
  .get(authController.protect, leaveController.getDashboardDataPaginate);

router
  .route('/getQTYData/:id')
  .get(authController.protect, leaveController.getQTYData);

router
  .route('/updateLeaveDay')
  .post(authController.protect, leaveController.updateLeaveDay);

router
  .route('/getDataPaginate')
  .get(authController.protect, leaveController.getDataPaginate);

router
  .route('/exportPDFLeaveOffsiteWork')
  .get(leaveController.exportPDFLeaveOffsiteWork);

router
  .route('/exportPDFLeave')
  .get(leaveController.exportPDFLeave);

router
  .route('/getDataPaginateByID/:id')
  .get(leaveController.getDataPaginateByID);

router
  .route('/getRetireData/:userid')
  .get(leaveController.getRetireData);

router
  .route('/getLeaveByID/:id')
  .get(leaveController.getLeaveByID);

router
  .route('/:id')
  .get(leaveController.getLeave)
  .post(limiter, fileUpload, leaveController.createLeave)
  .delete(leaveController.cancelLeave);

router
  .route('/createRetire/:id')
  .post(fileUpload, leaveController.createRetire);

router
  .route('/createLeaveWorkOutSide/:id')
  .post(fileUpload, leaveController.createLeaveWorkOutSide);

router
  .route('/approve/:id')
  .get(authController.protect, leaveController.approve);

router
  .route('/reject/:id/:reason')
  .get(authController.protect, leaveController.reject);

router
  .route('/approveNoAuth/:id/:approver')
  .get(leaveController.approveNoAuth);

router
  .route('/rejectNoAuth/:id/:reason/:approver')
  .get(leaveController.rejectNoAuth);

module.exports = router;
