const express = require('express');
const authController = require('../controllers/authController');
const lineController = require('../controllers/lineController');
const router = express.Router();

router
  .route('/webhook')
  .post(
    lineController.webhook
  );

module.exports = router;
 