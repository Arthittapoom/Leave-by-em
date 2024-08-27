const express = require('express');
const adminRouter = require('./adminRouter');
const testRouter = require('./testRouter');
const lineRouter = require('./lineRouter');
const userRouter = require('./userRouter');
const masterRouter = require('./masterRouter');
const leaveRouter = require('./leaveRouter');
const router = express.Router();

router.use('/admin', adminRouter);
router.use('/test', testRouter);
router.use('/line', lineRouter);
router.use('/user', userRouter);
router.use('/master', masterRouter);
router.use('/leave', leaveRouter);

module.exports = router;
