const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Readable = require('stream').Readable;
const readXlsxFile = require('read-excel-file/node');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admins');
const User = require('../models/users');
const moment = require('moment');

exports.migrateData = catchAsync(async (req, res, next) => {
  try {
    if (req.files.length < 1) {
      return next(new AppError("Please fill data", 400));
    }
    const fileBuffer = req.files[0].buffer;
    const s = new Readable();
    s.push(fileBuffer);
    s.push(null);
    const rows = await readXlsxFile(s);
    const results = [];
    for (const e of rows) {
      const body = {};
      try {
        let intcol = 0;
        body.username = (e[intcol] + '');
        body.password = await bcrypt.hash((e[intcol] + ''), 12); intcol++;
        body.fullname = (e[intcol] + '');
        body.role = 3;
        body.is_active = 1;
        const user = await User.findOne({ EMP_CODE: body.username });
        body.fk_user_id = user ? user._id : null;
        const admin = await Admin.findOne({ username: body.username });
        if (admin) {
          admin.password = body.password;
          admin.fullname = body.fullname;
          admin.role = body.role;
          admin.is_active = body.is_active;
          admin.fk_user_id = body.fk_user_id;
          await admin.save();
        } else {
          const newAdmin = new Admin({
            username: body.username,
            password: body.password,
            fullname: body.fullname,
            role: body.role,
            is_active: body.is_active,
            fk_user_id: body.fk_user_id,
          });
          await newAdmin.save();
        }
      } catch (ex) {
        console.log('ex', ex);
        results.push(body.username + ';' + "Format Error");
      }
    }
    if (results.filter(x => x ? x.match(/Duplicate.*/) : false).length > 0 || results.filter(x => x ? x.match(/Error.*/) : false).length > 0) {
      res.status(500).json({
        status: "error-file-format",
        dataDup: results.filter(x => x ? x.match(/Duplicate.*/) : false),
        dataError: results.filter(x => x ? x.match(/Error.*/) : false),
      });
    } else {
      res.status(200).json({
        status: "import success",
      });
    }
  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});