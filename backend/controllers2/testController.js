const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const factory = require('../helpers/handlerFactory');
const dbQuery = require('../utils/dbQuery');
const AppError = require('../utils/appError');
const excel = require('excel4node');
const moment = require('moment');
const axios = require("axios");
const Readable = require('stream').Readable;
const readXlsxFile = require('read-excel-file/node');
const bcrypt = require('bcryptjs');

exports.migrateData = catchAsync(async (req, res, next) => {
  try {
    if (req.files.length < 1) {
      return next(new AppError("Please fill data", 400));
    }

    var fileBuffer = req.files[0].buffer;
    var s = new Readable()
    s.push(fileBuffer)
    s.push(null)

    let pool = await new dbQuery().connect();
    var sql = ``;
    var result = null;
    await readXlsxFile(s).then(async (rows) => {
          var results = [];
      for (let e of rows) {
        var body = {};
        try {
          var intcol = 0;
          body.USERNAME = (e[intcol] + '');
          body.PASSWORD = await bcrypt.hash((e[intcol] + ''), 12); intcol++;
          body.FULLNAME = (e[intcol] + '');
          body.role = 3;
          body.IS_ACTIVE = 1;
          sql = ` SELECT * FROM [USER] WHERE EMP_CODE = '${body.USERNAME}'`;
          result = await pool.query(sql);
          body.FK_USER_ID = result.recordset.length > 0 ? result.recordset[0].id : null;

          sql = ` SELECT * FROM [ADMIN] WHERE USERNAME = '${body.USERNAME}'`;
          result = await pool.query(sql);
          var adminID = 0;
          if (result.recordset.length > 0) {
            adminID = result.recordset[0].id;
            let updatevalueArr = [
              `[USERNAME] = '${body.USERNAME}'`,
              `[PASSWORD] = '${body.PASSWORD}'`,
              `[FULLNAME] = '${body.FULLNAME}'`,
              `[role] = '${body.role}'`,
              `[IS_ACTIVE] = '${body.IS_ACTIVE}'`,
              `[FK_USER_ID] = '${body.FK_USER_ID}'`,
            ]
            sql = `UPDATE [ADMIN] SET ${updatevalueArr} WHERE id = '${adminID}'`;
            result = await pool.query(sql);
          } else {
            let columnArr = [
              "[USERNAME]",
              "[PASSWORD]",
              "[FULLNAME]",
              "[role]",
              "[IS_ACTIVE]",
              "[FK_USER_ID]",
            ]
            let valueArr = [
              `'${body.USERNAME}'`,
              `'${body.PASSWORD}'`,
              `'${body.FULLNAME}'`,
              `'${body.role}'`,
              `'${body.IS_ACTIVE}'`,
              `'${body.FK_USER_ID}'`,
            ]
            sql = `INSERT INTO [ADMIN] (${columnArr}) OUTPUT Inserted.id VALUES (${valueArr})`;
            result = await pool.query(sql);
            adminID = result.recordset[0].id;
          }
        }
        catch (ex) {
          console.log('ex', ex);
          results.push(body.EMP_CODE + ';' + "Format Error");
        }
      }
      if (results.filter(x => x ? x.match(/Duplicate.*/) : false).length > 0 || results.filter(x => x ? x.match(/Error.*/) : false).length > 0) {
        res.status(500).json({
          status: "error-file-format",
          dataDup: results.filter(x => x ? x.match(/Duplicate.*/) : false),
          dataError: results.filter(x => x ? x.match(/Error.*/) : false),
        });
      }
      else {
        res.status(200).json({
          status: "import success",
        });
      }
    })
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});





