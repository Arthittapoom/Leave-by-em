const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const router = express.Router();

router
  .route('/getEmployeeDataByEmpcode/:id')
  .get(userController.getEmployeeDataByEmpcode);

router
  .route('/getDataPaginate')
  .get(authController.protect, userController.getDataPaginate);

router
  .route('/exportUserData')
  .get(authController.protect, userController.exportUserData);

router
  .route('/exportUserDataById/:id')
  .get(userController.exportUserDataById);

router
  .route('/manage/:id')
  .get(userController.getUser)
  .patch(authController.protect, userController.updateUser)

router
  .route('/verify/:id')
  .get(
    authController.verifyUser
  );

router
  .route('/:lineUserID')
  .get(
    authController.getUserFromLineUserID
  );

router
  .route('/getOTP/:phone')
  .get(
    authController.getOTP
  );

router
  .route('/verifyOTP')
  .post(
    authController.verifyOTP
  );

router
  .route('/update')
  .post(
    authController.signUp
  );

router
  .route('/signup')
  .post(
    authController.signUp
  );

module.exports = router;
