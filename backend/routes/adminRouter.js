const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.post('/signup', authController.signUpAdmin);
router.post('/login', authController.loginAdmin);
router.post('/logout', authController.logout);


// Protect all routes after this middleware
router.use(authController.protect);
router.get('/me', adminController.getMe, adminController.getUser);
router.post('/setIsActive', adminController.setIsActive);
router.post('/createAdmin', adminController.createAdmin);
// router.use(authController.restrictTo('superAdmin','admin','adminAccount','adminMarketing','adminDeliveryMan','deliveryMan','saleman'));

router
  .route('/getDataPaginate')
  .get(authController.protect, adminController.getDataPaginate);

router
  .route('/manage/:id')
  .get(authController.protect, adminController.getUser)
  .patch(authController.protect, adminController.updateAdmin)
  .delete(authController.protect, adminController.deleteAdmin);

module.exports = router;
