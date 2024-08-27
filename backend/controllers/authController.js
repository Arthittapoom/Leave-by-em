const config = require('../config');
const axios = require("axios");
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const AdminsModel = require('../models/admins.js');
const UsersModel = require('../models/users.js');
// moment
const moment = require('moment');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

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
  try {
    const result = await UsersModel.findOne({
      line_userid: req.params.lineUserID
    });
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }

});

exports.signUp = catchAsync(async (req, res, next) => {
  try {

    let dataUser = null;
    let result = null;

    result = await UsersModel.findOne({emp_code: req.body.emp_code});
    console.log(result)
    if (result) {
      dataUser = result;
    }

    else {
      return next(new AppError("Not found employee code", 400));
    }

      const InsertUser = {
        line_userid: req.body.line_userid,
        emp_code: req.body.emp_code,
        fk_employee_type_id: req.body.fk_employee_type_id,
        fullname: req.body.fullname,
        position: req.body.position,
        department: req.body.department,
        faction: req.body.faction,
        work_location: req.body.work_location,
        phone: req.body.phone,
        is_verify: req.body.IS_VERIFY,
        is_active: 1
      }

      const updatedataUserArr = {
        line_userid: req.body.line_userid,
        fk_employee_type_id: req.body.fk_employee_type_id,
        fullname: req.body.fullname,
        position: req.body.position,
        department: req.body.department,
        faction: req.body.faction,
        work_location: req.body.work_location,
        phone: req.body.phone,
        is_active: 1
      }

      const updatevalueArr = {
        line_userid: req.body.line_userid,
        emp_code: req.body.emp_code,
        fk_employee_type_id: req.body.fk_employee_type_id,
        fullname: req.body.fullname,
        position: req.body.position,
        department: req.body.department,
        faction: req.body.faction,
        work_location: req.body.work_location,
        phone: req.body.phone,
        is_verify: req.body.is_verify,
        is_active: 1
      }

      if (dataUser) {
        result = await UsersModel.findOneAndUpdate({ _id: dataUser._id }, { $set: updatedataUserArr }, { new: true });
      }
      else if (req.body.id) {
        result = await UsersModel.findOneAndUpdate({ _id: req.body.id }, { $set: updatevalueArr }, { new: true });
      }
      else {
        result = await UsersModel.create(InsertUser);
      }

      res.status(200).json({
        status: 'success',
        data: result
      });
  }
  catch (err) {
    return next(new AppError("Error signUp: " + err, 400));
  }
});

exports.verifyUser = catchAsync(async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new AppError("Not found userid", 400));
    }

    const result = await UsersModel.findOneAndUpdate({ _id: req.params.id }, {
      $set: {
        is_verify: 1
      }
    }, { new: true });

    res.status(201).json({
      status: 'success',
      data: result
    });
  } catch (err) {

  }
});

exports.getOTP = catchAsync(async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

exports.verifyOTP = catchAsync(async (req, res, next) => {
  try {
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
          const userId = req.body.id;
          const user = await UsersModel.findByIdAndUpdate(userId, { IS_VERIFY: '1' }, { new: true });
          res.status(200).json({
            status: 'success',
            data: user
          });
          const lineUserID = user.LINE_USERID;
          axios.post(process.env.LINE_URL, {
            "to": lineUserID,
            "messages": [
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
        } else if (result.data.result == false && result.data.isErrorCount == false && result.data.isExprCode == true) {
          return next(new AppError("OTP Expire", 400));
        } else {
          return next(new AppError("OTP not match", 400));
        }
      })
      .catch((err) => {
        return next(new AppError("ERROR " + err, 400));
      });
  } catch (err) {
    next(err);
  }
});

exports.signUpAdmin = catchAsync(async (req, res, next) => {
  try {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!req.body.username || !req.body.password || !req.body.fullname || !req.body.email || !req.body.phone || !req.body.role) {
      return next(new AppError("Please fill data", 400));
    }

    // ตรวจสอบว่ามีผู้ใช้งานชื่อนี้อยู่ในระบบหรือไม่
    let id = req.user && req.user.id ? req.user.id : 'system';

    // สร้างรหัสผ่านที่เข้ารหัส
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    // เตรียมข้อมูลที่จะใส่ใน MongoDB
    const adminData = {
      username: req.body.username,
      password: hashedPassword,
      fullname: req.body.fullname,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role,
      is_active: 1,
      CREATED_BY: id,
      CREATED_DATE: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };

    // สร้างเอกสารใหม่ใน MongoDB
    const newAdmin = await AdminsModel.create(adminData);

    // ตรวจสอบว่าการสร้างเอกสารสำเร็จหรือไม่
    if (newAdmin) {
      // ส่งผลลัพธ์กลับไปที่ client
      res.status(201).json({
        status: 'created success',
        data: {
          admin: newAdmin,
        },
      });
    } else {
      return next(new AppError("Failed to create admin", 400));
    }
  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.loginAdmin = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return next(new AppError("Please provide username and password!", 400));
  }

  const resultAdmin = await AdminsModel.findOne({
    is_active: 1,
    $or: [{ is_delete: null || 0 }, { is_delete: { $ne: 1 } }],
    username: username
  }).limit(1).lean();
  if (!resultAdmin) {
    return next(new AppError("user or password is not match.", 401));
  }

  if (await bcrypt.compare(password, resultAdmin.password)) {
    createSendToken(resultAdmin, 200, req, res);
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
  try {
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
    var result = await AdminsModel.findOne({ is_active: 1, _id: decoded.id }).limit(1).lean();
    if (!result) {
      var result = await UsersModel.findOne({ is_active: 1, _id: decoded.id }).limit(1).lean();
      if (!result) {
        return next(
          new AppError(
            'The user belonging to this token does no longer exist.',
            401
          )
        );
      }
    }

    req.user = result;
    res.locals.user = result;
    next();
  } catch (err) {
    return next(new AppError("ERROR: " + err, 401));
  }
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