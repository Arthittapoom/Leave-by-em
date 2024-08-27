const express = require('express');
const authController = require('../controllers/authController');
const masterController = require('../controllers/masterController');
const router = express.Router();

router
  .route('/getEmployeeAdmin')
  .get(
    authController.protect, masterController.getEmployeeAdmin
  );

router
  .route('/getEmployee/:id')
  .get(
    authController.protect, masterController.getEmployee
  );

router
  .route('/getWorkLocation')
  .get(
    masterController.getWorkLocation
  );

router
  .route('/getPeriodTime')
  .get(
    masterController.getPeriodTime
  );

router
  .route('/getRole')
  .get(
    authController.protect, masterController.getRole
  );

router
  .route('/getOptionEmployeeType')
  .get(
    masterController.getOptionEmployeeType
  );

router
  .route('/getLeaveType')
  .get(masterController.getLeaveType);
  
router
  .route('/getLeaveMaster')
  .get(masterController.getLeaveMaster);

module.exports = router;
