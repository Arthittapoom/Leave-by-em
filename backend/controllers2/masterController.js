const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const factory = require('../helpers/handlerFactory');
const dbQuery = require('../utils/dbQuery');
const AppError = require('../utils/appError');
const moment = require('moment');

exports.getPeriodTime = catchAsync(async (req, res, next) => {
  // var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  var sql = ` SELECT * FROM PERIOD_TIME`;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getRole = catchAsync(async (req, res, next) => {
  // var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  var sql = ` SELECT * FROM MAS_ROLE`;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getEmployeeAdmin = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = ` SELECT U.* FROM [USER] U
              LEFT JOIN [ADMIN] ADM ON U.id = ADM.FK_USER_ID
              WHERE U.IS_ACTIVE = 1 
              AND (U.IS_RETIRE is null or U.IS_RETIRE != 1)
              AND ADM.FK_USER_ID is null `;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getEmployee = catchAsync(async (req, res, next) => {
  // var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  // var sql = ` SELECT * FROM [USER] WHERE IS_ACTIVE = 1 AND IS_VERIFY = 1 AND (IS_RETIRE is null or IS_RETIRE != 1) AND id != '${req.params.id}'`;
  var sql = ` SELECT * FROM [USER] WHERE IS_ACTIVE = 1 AND (IS_RETIRE is null or IS_RETIRE != 1)`;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getWorkLocation = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = ` SELECT * FROM [MAS_WORKLOCATION]`;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getOptionEmployeeType = catchAsync(async (req, res, next) => {
  // var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  var sql = ` SELECT * FROM EMPLOYEE_TYPE`;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getLeaveType = catchAsync(async (req, res, next) => {
  // var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  var sql = ` SELECT * FROM LEAVE_TYPE `;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getLeaveMaster = catchAsync(async (req, res, next) => {
  // var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  var wherequery = '';
  if (req.query.year) {
    wherequery = ` AND LTD.[YEAR] = ${req.query.year} `;
  }
  else {
    wherequery = ` AND LTD.[YEAR] = ${moment(new Date()).format('YYYY')} `;
  }
  var sql = ` SELECT LT.id
                ,LT.LEAVE_NAME
                ,ISNULL(LTD.QTY, 0) as QTY
              FROM LEAVE_TYPE LT
              LEFT JOIN LEAVE_TYPE_DETAIL LTD ON LT.id = LTD.FK_LEAVE_TYPE_ID AND LTD.FK_EMPLOYEE_TYPE_ID = ${req.query.leaveType} ${wherequery} `;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});