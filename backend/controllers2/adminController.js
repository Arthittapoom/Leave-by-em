const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const factory = require('../helpers/handlerFactory');
const dbQuery = require('../utils/dbQuery');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.setIsActive = catchAsync(async (req, res, next) => {
  try {
    if (!req.body.id || req.body.IS_ACTIVE == null) {
      return next(new AppError("Please fill data", 400));
    }

    let updatevalueArr = [
      `[IS_ACTIVE] = '${req.body.IS_ACTIVE}'`,
      `[UPDATED_BY] = '${req.user.id}'`,
      `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]

    let pool = await new dbQuery().connect();
    var sql = `UPDATE [ADMIN] SET ${updatevalueArr} WHERE id = '${req.body.id}'`;
    var result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ status: 'updated success' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.getUser = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = `SELECT TOP 1 * FROM [ADMIN] WHERE id = '${req.params.id}'`;
  var result = await pool.query(sql);

  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getDataPaginate = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var querywhere = '';
  if (req.user.role == 3) {
    querywhere += ` AND A.id = ${req.user.id} `;
  }
  else if (req.user.role == 2) {
    querywhere += ` AND A.role != 1 `;
  }
  var sql = ` DECLARE 
              @PageSize INT = ${req.query.perPage}, 
              @PageNum  INT = ${req.query.nowPage};

              WITH TempResult AS (
                SELECT A.*, MR.NAME ROLENAME FROM [ADMIN] A LEFT JOIN [MAS_ROLE] MR ON MR.id = A.role WHERE (IS_DELETE is null or IS_DELETE != 1) ${querywhere}
              ), TempCount AS (
                SELECT COUNT(*) AS MaxRows FROM [ADMIN] A LEFT JOIN [MAS_ROLE] MR ON MR.id = A.role WHERE (IS_DELETE is null or IS_DELETE != 1) ${querywhere}
              )
              SELECT *
              FROM TempResult, TempCount
              ORDER BY TempResult.id DESC
              OFFSET (@PageNum-1)* @PageSize ROWS
              FETCH NEXT @PageSize ROWS ONLY`;
  var result = await pool.query(sql);

  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.createAdmin = catchAsync(async (req, res, next) => {
  try {
    if (!req.body.USERNAME || !req.body.PASSWORD || !req.body.FULLNAME || !req.body.role) {
      return next(new AppError("Please fill data", 400));
    }

    let columnArr = [
      "[USERNAME]",
      "[PASSWORD]",
      "[FULLNAME]",
      "[EMAIL]",
      "[PHONE]",
      "[role]",
      "[FK_USER_ID]",
      "[IS_ACTIVE]",
      "[CREATED_BY]",
    ]

    let valueArr = [
      `'${req.body.USERNAME}'`,
      `'${await bcrypt.hash(req.body.PASSWORD, 12)}'`,
      `${req.body.FULLNAME ? `'` + req.body.FULLNAME + `'` : null}`,
      `${req.body.EMAIL ? `'` + req.body.EMAIL + `'` : null}`,
      `${req.body.PHONE ? `'` + req.body.PHONE + `'` : null}`,
      `${req.body.role ? `'` + req.body.role + `'` : null}`,
      `${req.body.FK_USER_ID ? `'${req.body.FK_USER_ID}'` : null}`,
      `'1'`,
      `'${req.user.id}'`,
    ]

    let pool = await new dbQuery().connect();
    var sql = `INSERT INTO [ADMIN] (${columnArr}) OUTPUT Inserted.id VALUES (${valueArr})`;
    var result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {
      res.status(201).json({ status: 'created success' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.updateAdmin = catchAsync(async (req, res, next) => {
  try {
    let updatevalueArr = [
      `[FULLNAME] = ${req.body.FULLNAME ? `'` + req.body.FULLNAME + `'` : null}`,
      `[EMAIL] = ${req.body.EMAIL ? `'` + req.body.EMAIL + `'` : null}`,
      `[PHONE] = ${req.body.PHONE ? `'` + req.body.PHONE + `'` : null}`,
      `[role] = ${req.body.role ? `'` + req.body.role + `'` : null}`,
      `[FK_USER_ID] = ${req.body.FK_USER_ID}`,
      `[UPDATED_BY] = '${req.user.id}'`,
      `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]

    if (req.body.PASSWORD) {
      updatevalueArr.push(`[PASSWORD] = '${await bcrypt.hash(req.body.PASSWORD, 12)}'`);
    }

    let pool = await new dbQuery().connect();
    var sql = `UPDATE [ADMIN] SET ${updatevalueArr} WHERE id = '${req.params.id}'`;
    console.log('sql', sql);
    var result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ status: 'updated success' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.deleteAdmin = catchAsync(async (req, res, next) => {
  try {
    let updatevalueArr = [
      `[IS_DELETE] = 1`,
      `[UPDATED_BY] = '${req.user.id}'`,
      `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]

    let pool = await new dbQuery().connect();
    var sql = `UPDATE [ADMIN] SET ${updatevalueArr} WHERE id = '${req.params.id}'`;
    var result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ status: 'updated success' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});
