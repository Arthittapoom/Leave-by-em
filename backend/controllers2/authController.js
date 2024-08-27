const config = require('../config');
const axios = require("axios");
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const dbQuery = require('../utils/dbQuery');
const bcrypt = require('bcryptjs');
const moment = require('moment');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user.id);

  res.cookie('unique_leave_admin_login', token, {
    expires: new Date(
      // Expires in 20 miniute!!
      Date.now() +
      // process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      20 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.getUserFromLineUserID = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = `SELECT TOP 1 *, CASE WHEN IS_RETIRE = 1 THEN CASE WHEN LAST_WORK > '${moment(new Date()).format("YYYY-MM-DD")}' THEN 'ACTIVE' ELSE 'EXPIRE' END ELSE 'ACTIVE' END as FLAG_RETIRE FROM [USER] WHERE LINE_USERID  = '${req.params.lineUserID}'`;
  const result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset
  });
});

exports.signUp = catchAsync(async (req, res, next) => {
  try {
    let pool = await new dbQuery().connect();
    var sql = "";
    var dataUser = null;
    var result = null;

    sql = `SELECT * FROM [USER] WHERE [EMP_CODE] = '${req.body.EMP_CODE}'`;
    result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {
      dataUser = result.recordset[0];
    }
    else {
      return next(new AppError("Not found employee code", 400));
    }

    let columnArr = [
      "[LINE_USERID]",
      "[EMP_CODE]",
      "[FK_EMPLOYEE_TYPE_ID]",
      "[FULLNAME]",
      "[POSITION]",
      "[DEPARTMENT]",
      "[FACTION]",
      "[WORK_LOCATION]",
      "[PHONE]",
      "[IS_VERIFY]",
      "[IS_ACTIVE]",
    ]

    let valueArr = [
      `'${req.body.LINE_USERID}'`,
      `'${req.body.EMP_CODE}'`,
      `'${req.body.FK_EMPLOYEE_TYPE_ID}'`,
      `'${req.body.FULLNAME}'`,
      `'${req.body.POSITION}'`,
      `'${req.body.DEPARTMENT}'`,
      `'${req.body.FACTION}'`,
      `'${req.body.WORK_LOCATION}'`,
      `'${req.body.PHONE}'`,
      `'${req.body.IS_VERIFY}'`,
      `'1'`,
    ]

    let updatedataUserArr = [
      `[LINE_USERID] = '${req.body.LINE_USERID}'`,
      `[FK_EMPLOYEE_TYPE_ID] = '${req.body.FK_EMPLOYEE_TYPE_ID}'`,
      `[FULLNAME] = '${req.body.FULLNAME}'`,
      `[POSITION] = '${req.body.POSITION}'`,
      `[DEPARTMENT] = '${req.body.DEPARTMENT}'`,
      `[FACTION] = '${req.body.FACTION}'`,
      `[WORK_LOCATION] = '${req.body.WORK_LOCATION}'`,
      `[PHONE] = '${req.body.PHONE}'`,
      `[IS_ACTIVE] = '1'`,
    ]

    let updatevalueArr = [
      `[LINE_USERID] = '${req.body.LINE_USERID}'`,
      `[EMP_CODE] = '${req.body.EMP_CODE}'`,
      `[FK_EMPLOYEE_TYPE_ID] = '${req.body.FK_EMPLOYEE_TYPE_ID}'`,
      `[FULLNAME] = '${req.body.FULLNAME}'`,
      `[POSITION] = '${req.body.POSITION}'`,
      `[DEPARTMENT] = '${req.body.DEPARTMENT}'`,
      `[FACTION] = '${req.body.FACTION}'`,
      `[WORK_LOCATION] = '${req.body.WORK_LOCATION}'`,
      `[PHONE] = '${req.body.PHONE}'`,
      `[IS_VERIFY] = '${req.body.IS_VERIFY}'`,
      `[IS_ACTIVE] = '1'`,
    ]

    if (dataUser) {
      sql = `UPDATE [dbo].[USER] SET ${updatedataUserArr} WHERE [id] = ${dataUser.id}`;
      result = await pool.query(sql);
    }
    else if (req.body.id) {
      sql = `UPDATE [dbo].[USER] SET ${updatevalueArr} WHERE [id] = ${req.body.id}`;
      result = await pool.query(sql);
    }
    else {
      sql = `INSERT INTO [USER] (${columnArr}) VALUES (${valueArr})`;
      result = await pool.query(sql);
    }

    res.status(201).json({
      status: 'success',
      data: result.rowsAffected[0]
    });
  }
  catch (err) {
    return next(new AppError("Error signUp: " + err, 400));
  }
});

exports.verifyUser = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(new AppError("Not found userid", 400));
  }

  let pool = await new dbQuery().connect();
  var sql = `UPDATE [dbo].[USER] SET [IS_VERIFY] = '1' WHERE [id] = ${req.params.id}`;
  var result = await pool.query(sql);

  res.status(201).json({
    status: 'success',
    data: result.rowsAffected[0]
  });
});

exports.getOTP = catchAsync(async (req, res, next) => {
  if (!req.params.phone) {
    return next(new AppError("Please input mobile number", 400));
  }

  const bodyData = {
    "otcId": "aa8fa23b-194e-47d1-879c-43bbd8042de9",
    "mobile": req.params.phone
  };

  const data = {};
  await axios
    .post(`https://api-service.ants.co.th/otp/requestOTP`, bodyData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + config.otpToken.token,
      },
    })
    .then((res) => {
      // console.log('res', res);
      if (res.data.success.message == "Success") {
        data.otcId = res.data.otcId;
        data.otpId = res.data.otpId;
        data.referenceCode = res.data.referenceCode;
      }

    })
    .catch((err) => {
      return next(new AppError("ERROR " + err, 400));
    });

  res.status(200).json({
    status: 'success',
    data,
  });
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  if (!req.body.otpId || !req.body.otpCode) {
    return next(new AppError("Please input mobile number", 400));
  }

  const bodyData = {
    "otpId": req.body.otpId,
    "otpCode": req.body.otpCode
  }

  await axios
    .post(`https://api-service.ants.co.th/otp/verifyOTP`, bodyData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + config.otpToken.token,
      },
    })
    .then(async (result) => {
      if (result.data.result == true && result.data.isErrorCount == false && result.data.isExprCode == false) {
        let pool = await new dbQuery().connect();
        var sql = `UPDATE [dbo].[USER] SET [IS_VERIFY] = '1' WHERE [id] = ${req.body.id}`;
        var resultquery = await pool.query(sql);
        res.status(200).json({
          status: 'success',
          data: resultquery.rowsAffected[0]
        });
        const lineUserID = await pool.query(`SELECT LINE_USERID FROM [dbo].[USER] WHERE id = ${req.body.id}`)
        console.log('data',lineUserID?.recordset[0]?.LINE_USERID)
        axios.post(process.env.LINE_URL,{
          "to": lineUserID?.recordset[0]?.LINE_USERID,
          "messages":[
             {
                "type": "flex",
                "altText": "ลงทะเบียนเสร็จสิ้น",
                "contents": {
                  "type": "bubble",
                  "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ลงทะเบียนเสร็จสิ้น",
                        "weight": "bold",
                        "size": "lg",
                        "align": "center"
                      }
                    ]
                  },
                  "footer": {
                    "type": "box",
                    "layout": "horizontal",
                    "spacing": "sm",
                    "contents": [
                      {
                        "type": "button",
                        "style": "primary",
                        "height": "sm",
                        "action": {
                          "type": "uri",
                          "label": "ดูข้อมูลส่วนตัว",
                          "uri": "https://google.com"
                        },
                        "color": "#4CD964",
                        "adjustMode": "shrink-to-fit"
                      }
                    ]
                  }
                }
              }
          ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.LINE_TOKEN,
        }
      }
      )
      }
      else if (result.data.result == false && result.data.isErrorCount == false && result.data.isExprCode == true) {
        return next(new AppError("OTP Expire", 400));
      }
      else {
        return next(new AppError("OTP not match", 400));
      }
    })
    .catch((err) => {
      return next(new AppError("ERROR " + err, 400));
    });
});

exports.signUpAdmin = catchAsync(async (req, res, next) => {
  try {
    if (!req.body.USERNAME || !req.body.PASSWORD || !req.body.FULLNAME || !req.body.email || !req.body.PHONE || !req.body.role) {
      return next(new AppError("Please fill data", 400));
    }

    let columnArr = [
      "[USERNAME]",
      "[PASSWORD]",
      "[FULLNAME]",
      "[email]",
      "[PHONE]",
      "[role]",
      "[IS_ACTIVE]",
      "[CREATED_BY]",
      "[CREATED_DATE]",
    ]

    let valueArr = [
      `'${req.body.USERNAME}'`,
      `'${await bcrypt.hash(req.body.PASSWORD, 12)}'`,
      `'${req.body.FULLNAME}'`,
      `'${req.body.email}'`,
      `'${req.body.PHONE}'`,
      `'${req.body.role}'`,
      `'1'`,
      `'${req.user.id}'`,
      `'${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]
    let pool = await new dbQuery().connect();
    var sql = `INSERT INTO [ADMIN] (${columnArr}) OUTPUT Inserted.id VALUES (${valueArr})`;
    var result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {
      // var sql2 = `SELECT * FROM [ADMIN] WHERE id = ${result.recordset[0].id}`;
      // var result2 = await pool.query(sql2);
      // createSendToken(result2.recordset[0], 200, req, res);
      res.status(201).json({ status: 'created success' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.loginAdmin = catchAsync(async (req, res, next) => {
  const { USERNAME, PASSWORD } = req.body;
  if (!USERNAME || !PASSWORD) {
    return next(new AppError("Please provide username and password!", 400));
  }

  let pool = await new dbQuery().connect();
  var sql = `SELECT TOP 1 A.*, MR.NAME ROLENAME FROM [ADMIN] A JOIN [MAS_ROLE] MR ON MR.id = A.role WHERE IS_ACTIVE = 1 AND (IS_DELETE is null or IS_DELETE != 1) AND USERNAME = '${USERNAME}'`;
  var result = await pool.query(sql);
  if (result.rowsAffected[0] == 0) {
    return next(new AppError("user or password is not match.", 401));
  }

  if (await bcrypt.compare(PASSWORD, result.recordset[0].PASSWORD)) {
    createSendToken(result.recordset[0], 200, req, res);
  }
  else {
    return next(new AppError("user or password is not match.", 401));
  }
});

exports.logout = (req, res) => {
  res.cookie('unique_leave_admin_login', 'loggedout', {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.unique_leave_admin_login) {
    token = req.cookies.unique_leave_admin_login;
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in! Please log in to get access.',
        401
      )
    );
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  let pool = await new dbQuery().connect();
  var sql = `SELECT TOP 1 * FROM [ADMIN] WHERE IS_ACTIVE = 1 AND id = '${decoded.id}'`;
  var result = await pool.query(sql);
  if (result.rowsAffected[0] == 0) {
    sql = `SELECT TOP 1 * FROM [USER] WHERE IS_ACTIVE = 1 AND id = '${decoded.id}'`;
    result = await pool.query(sql);
    if (result.rowsAffected[0] == 0) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }
  }

  req.user = result.recordset[0];
  res.locals.user = result.recordset[0];
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action',
          403
        )
      );
    }

    next();
  };
};