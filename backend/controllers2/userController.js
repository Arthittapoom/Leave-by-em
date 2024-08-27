const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const factory = require('../helpers/handlerFactory');
const dbQuery = require('../utils/dbQuery');
const AppError = require('../utils/appError');
const excel = require('excel4node');
const moment = require('moment');

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

exports.exportUserDataById = catchAsync(async (req, res, next) => {
  if (!req.params.id) {
    return next(new AppError("Please fill data", 400));
  }

  let pool = await new dbQuery().connect();
  var sql = ` SELECT U.*, HEADU.FULLNAME as ADVANCED_LEAVE_APPROVER_NAME, ET.EMPLOYEE_TYPE_NAME FROM [USER] U
              LEFT JOIN [USER] HEADU ON U.ADVANCED_LEAVE_APPROVER = HEADU.id 
              LEFT JOIN [EMPLOYEE_TYPE] ET ON U.FK_EMPLOYEE_TYPE_ID = ET.id WHERE U.id = ${req.params.id}`;
  var result = await pool.query(sql);

  // res.status(200).json({
  //   status: 'success',
  //   data: result.recordset,
  // });

  var workbook = new excel.Workbook();

  var worksheet = workbook.addWorksheet(`รายงานข้อมูลพนักงาน`);

  var topicstyle = workbook.createStyle({
    font: {
      color: '#000000',
      size: 10,
      bold: true
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center'
    },
  });

  var headerstyle = workbook.createStyle({
    font: {
      color: '#000000',
      size: 10,
      bold: true
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#99CCFF',
      fgColor: '#99CCFF',
    },
    border: {
      left: {
        style: "thin",
        color: '#000000'
      },
      right: {
        style: "thin",
        color: '#000000'
      },
      top: {
        style: "thin",
        color: '#000000'
      },
      bottom: {
        style: "thin",
        color: '#000000'
      },
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      shrinkToFit: true,
      wrapText: true,
    },
  });

  var headerstyle_green = workbook.createStyle({
    font: {
      color: '#000000',
      size: 10,
      bold: true
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#A9D08E',
      fgColor: '#A9D08E',
    },
    border: {
      left: {
        style: "thin",
        color: '#000000'
      },
      right: {
        style: "thin",
        color: '#000000'
      },
      top: {
        style: "thin",
        color: '#000000'
      },
      bottom: {
        style: "thin",
        color: '#000000'
      },
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      shrinkToFit: true,
      wrapText: true,
    },
  });

  var headerstyle_pink = workbook.createStyle({
    font: {
      color: '#000000',
      size: 10,
      bold: true
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#FF99CC',
      fgColor: '#FF99CC',
    },
    border: {
      left: {
        style: "thin",
        color: '#000000'
      },
      right: {
        style: "thin",
        color: '#000000'
      },
      top: {
        style: "thin",
        color: '#000000'
      },
      bottom: {
        style: "thin",
        color: '#000000'
      },
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      shrinkToFit: true,
      wrapText: true,
    },
  });

  var headerstyle_yellow = workbook.createStyle({
    font: {
      color: '#000000',
      size: 10,
      bold: true
    },
    border: {
      left: {
        style: "thin",
        color: '#000000'
      },
      right: {
        style: "thin",
        color: '#000000'
      },
      top: {
        style: "thin",
        color: '#000000'
      },
      bottom: {
        style: "thin",
        color: '#000000'
      },
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#FFFF00',
      fgColor: '#FFFF00',
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      shrinkToFit: true,
      wrapText: true,
    },
  });

  var bodystyle = workbook.createStyle({
    font: {
      color: '#000000',
      size: 8,
    },
    border: {
      left: {
        style: "thin",
        color: '#000000'
      },
      right: {
        style: "thin",
        color: '#000000'
      },
      top: {
        style: "thin",
        color: '#000000'
      },
      bottom: {
        style: "thin",
        color: '#000000'
      },
    },
  });

  var wscolheader = 1;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ลำดับ').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('รหัสพนักงาน').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('สังกัด').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('สังกัดจริง').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('คำนำหน้า').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ชื่อ-สกุล').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ตำแหน่ง').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ประเภทพนักงาน').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('แผนก').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ฝ่าย').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('สถานที่ปฏิบัติงาน').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('วันที่เริ่มงาน').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 2, wscolheader + 3, true).string('สิทธิ์ลาป่วย 30 วัน/ปี').style(headerstyle);
  worksheet.cell(3, wscolheader).string('ป่วย/วัน').style(headerstyle);
  worksheet.cell(3, wscolheader + 1).string('ป่วย/ชม.').style(headerstyle);
  worksheet.cell(3, wscolheader + 2).string('รวมวันลาป่วย').style(headerstyle_green);
  worksheet.cell(3, wscolheader + 3).string('สิทธิ์คงเหลือวันลาป่วย').style(headerstyle_pink);
  wscolheader += 4;
  worksheet.cell(2, wscolheader, 2, wscolheader + 3, true).string('สิทธิ์ลากิจ 8 วัน/ปี').style(headerstyle);
  worksheet.cell(3, wscolheader).string('กิจ/วัน').style(headerstyle);
  worksheet.cell(3, wscolheader + 1).string('กิจ/ชม.').style(headerstyle);
  worksheet.cell(3, wscolheader + 2).string('รวมวันลากิจ').style(headerstyle_green);
  worksheet.cell(3, wscolheader + 3).string('สิทธิ์คงเหลือวันลากิจ').style(headerstyle_pink);
  wscolheader += 4;
  worksheet.cell(2, wscolheader, 2, wscolheader + 4, true).string('สิทธิ์ลาพักร้อน 6 วัน/ปี').style(headerstyle);
  worksheet.cell(3, wscolheader).string('พักร้อน/วัน').style(headerstyle);
  worksheet.cell(3, wscolheader + 1).string('พักร้อน/ชม.').style(headerstyle);
  worksheet.cell(3, wscolheader + 2).string('รวมพักร้อน').style(headerstyle_green);
  worksheet.cell(3, wscolheader + 3).string('สิทธิ์คงเหลือวันพักร้อน').style(headerstyle_pink);
  worksheet.cell(3, wscolheader + 4).string('สิทธิ์พักร้อนที่ได้').style(headerstyle_yellow);
  wscolheader += 5;
  worksheet.cell(2, wscolheader, 2, wscolheader + 6, true).string('ลาอื่นๆ').style(headerstyle);
  worksheet.cell(3, wscolheader).string('ไม่รับค่าจ้าง/วัน').style(headerstyle);
  worksheet.cell(3, wscolheader + 1).string('ไม่รับค่าจ้าง/ชม').style(headerstyle);
  worksheet.cell(3, wscolheader + 2).string('รวมไม่รับค่าจ้าง').style(headerstyle_green);
  worksheet.cell(3, wscolheader + 3).string('ลากิจพิเศษ').style(headerstyle);
  worksheet.cell(3, wscolheader + 4).string('ลาบวช').style(headerstyle);
  worksheet.cell(3, wscolheader + 5).string('ลาคลอด').style(headerstyle);
  worksheet.cell(3, wscolheader + 6).string('ลาป่วย (เนื่องจากบาดเจ็บในงาน)/วัน').style(headerstyle_green);
  wscolheader += 7;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ผู้อนุมัติการลาขั้นต้น').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ผู้อนุมัติสูงสุด').style(headerstyle);
  wscolheader++;
  worksheet.cell(1, 1, 1, wscolheader, true).string(`รายงานข้อมูลพนักงาน วันที่ ${moment(req.query.toDate).format('DD/MM/YYYY')}`).style(topicstyle);

  var rows = 4;
  var index = 0;
  for await (var item of result.recordset) {
    var wscol = 1;
    worksheet.cell(rows, wscol).string((index + 1) + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.EMP_CODE ? item.EMP_CODE + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.AFFILIATION ? item.AFFILIATION + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.AFFILIATION_SUB ? item.AFFILIATION_SUB + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.TITLE ? item.TITLE + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.FULLNAME ? item.FULLNAME + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.POSITION ? item.POSITION + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.EMPLOYEE_TYPE_NAME ? item.EMPLOYEE_TYPE_NAME + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.DEPARTMENT ? item.DEPARTMENT + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.FACTION ? item.FACTION + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.WORK_LOCATION ? item.WORK_LOCATION + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.START_WORK ? moment(item.START_WORK).format("DD/MM/YYYY") + '' : '-').style(bodystyle); wscol++;
    sql = ` SELECT
              LTD.id
              ,LTD.FK_LEAVE_TYPE_ID
              ,ISNULL(LTQ.DAY, 0) as [DAY]
              ,ISNULL(LTQ.HOUR, 0) as [HOUR]
              ,LTD.QTY
              ,LTD.YEAR
              ,LTD.FK_EMPLOYEE_TYPE_ID
              ,LT.LEAVE_NAME
            FROM LEAVE_TYPE_DETAIL LTD
            JOIN [USER] U ON LTD.FK_EMPLOYEE_TYPE_ID = U.FK_EMPLOYEE_TYPE_ID AND U.id = ${item.id}
            LEFT JOIN LEAVE_TYPE LT ON LTD.FK_LEAVE_TYPE_ID = LT.id
            LEFT JOIN LEAVE_TRANSACTION_QTY LTQ ON LTD.FK_LEAVE_TYPE_ID = LTQ.FK_LEAVE_TYPE_ID AND LTQ.FK_USER_ID = ${item.id}
            WHERE LTD.YEAR = ${moment(new Date()).format('YYYY')}`;
    result = await pool.query(sql);

    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาป่วย").DAY + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาป่วย").HOUR + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาป่วย").DAY + 'วัน' + filterLeaveType(result.recordset, "ลาป่วย").HOUR + 'ชม.').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(formatsumleave(filterLeaveType(result.recordset, "ลาป่วย"))).style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลากิจ").DAY + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลากิจ").HOUR + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลากิจ").DAY + 'วัน' + filterLeaveType(result.recordset, "ลากิจ").HOUR + 'ชม.').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(formatsumleave(filterLeaveType(result.recordset, "ลากิจ"))).style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี").DAY + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี").HOUR + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี").DAY + 'วัน' + filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี").HOUR + 'ชม.').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(formatsumleave(filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี"))).style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี").QTY + '').style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาไม่รับค่าจ้าง").DAY + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาไม่รับค่าจ้าง").HOUR + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาไม่รับค่าจ้าง").DAY + 'วัน' + filterLeaveType(result.recordset, "ลาไม่รับค่าจ้าง").HOUR + 'ชม.').style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(Number(filterLeaveType(result.recordset, "ลากิจ(พิเศษ)").DAY + '.' + Number(filterLeaveType(result.recordset, "ลากิจ(พิเศษ)").HOUR * 10)) + '').style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(Number(filterLeaveType(result.recordset, "ลาเพื่ออุปสมบท").DAY + '.' + Number(filterLeaveType(result.recordset, "ลาเพื่ออุปสมบท").HOUR * 10)) + '').style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(Number(filterLeaveType(result.recordset, "ลาคลอด").DAY + '.' + Number(filterLeaveType(result.recordset, "ลาคลอด").HOUR * 10)) + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string('').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.ADVANCED_LEAVE_APPROVER_NAME ? item.ADVANCED_LEAVE_APPROVER_NAME + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.ADVANCED_LEAVE_APPROVER_NAME ? item.ADVANCED_LEAVE_APPROVER_NAME + '' : '-').style(bodystyle); wscol++;

    index++;
    rows++;
  }

  // worksheet.cell(rows, wscol).string(result.recordsets[3][0].approveAmount + '').style(bodystyle);
  // wscol++;
  // worksheet.cell(rows, wscol).string(result.recordsets[4][0].rejectAmount + '').style(bodystyle);
  // wscol++;
  // worksheet.cell(rows, wscol).string(result.recordsets[5][0].waitingAmout + '').style(bodystyle);
  // wscol++;

  workbook.writeToBuffer().then((buffer) => {
    const binaryBuffer = Buffer.from(buffer);
    res.attachment(moment().format("yyyyMMDDHHmm") + `-รายงานข้อมูลพนักงาน.xlsx`);
    // return res.send(binaryBuffer);
    let base64data = binaryBuffer.toString('base64');
    // console.log(`base64data` ,base64data);

    res.status(200).json({
      status: 'success',
      data: base64data,
    });
  });
});

exports.exportUserData = catchAsync(async (req, res, next) => {
  var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  var queryWhere = ``;
  if (req.query.employeeType == 'พนักงานปัจจุบัน') {
    queryWhere += ` AND (U.IS_RETIRE is null or U.IS_RETIRE != 1) `;
  }
  else {
    queryWhere += ` AND U.IS_RETIRE = 1`;
  }
  if (req.query.status == 'เชื่อมต่อกับ LINE') {
    queryWhere += ` AND LINE_USERID is not null `;
  }
  else if (req.query.status == 'ทั้งหมด') {
    queryWhere += ` `;
  }
  else {
    queryWhere += ` AND LINE_USERID is null `;
  }
  var sql = ` SELECT U.*, HEADU.FULLNAME as ADVANCED_LEAVE_APPROVER_NAME, ET.EMPLOYEE_TYPE_NAME FROM [USER] U
              LEFT JOIN [USER] HEADU ON U.ADVANCED_LEAVE_APPROVER = HEADU.id 
              LEFT JOIN [EMPLOYEE_TYPE] ET ON U.FK_EMPLOYEE_TYPE_ID = ET.id WHERE 1 = 1 ${queryWhere} `;
  var result = await pool.query(sql);

  // res.status(200).json({
  //   status: 'success',
  //   data: result.recordset,
  // });

  var workbook = new excel.Workbook();

  var worksheet = workbook.addWorksheet(`รายงาน${req.query.leaveType}`);

  var topicstyle = workbook.createStyle({
    font: {
      color: '#000000',
      size: 10,
      bold: true
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center'
    },
  });
  var headerstyle = workbook.createStyle({
    font: {
      color: '#000000',
      size: 10,
      bold: true
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#99CCFF',
      fgColor: '#99CCFF',
    },
    border: {
      left: {
        style: "thin",
        color: '#000000'
      },
      right: {
        style: "thin",
        color: '#000000'
      },
      top: {
        style: "thin",
        color: '#000000'
      },
      bottom: {
        style: "thin",
        color: '#000000'
      },
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      shrinkToFit: true,
      wrapText: true,
    },
  });
  var headerstyle_green = workbook.createStyle({
    font: {
      color: '#000000',
      size: 10,
      bold: true
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#A9D08E',
      fgColor: '#A9D08E',
    },
    border: {
      left: {
        style: "thin",
        color: '#000000'
      },
      right: {
        style: "thin",
        color: '#000000'
      },
      top: {
        style: "thin",
        color: '#000000'
      },
      bottom: {
        style: "thin",
        color: '#000000'
      },
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      shrinkToFit: true,
      wrapText: true,
    },
  });
  var headerstyle_pink = workbook.createStyle({
    font: {
      color: '#000000',
      size: 10,
      bold: true
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#FF99CC',
      fgColor: '#FF99CC',
    },
    border: {
      left: {
        style: "thin",
        color: '#000000'
      },
      right: {
        style: "thin",
        color: '#000000'
      },
      top: {
        style: "thin",
        color: '#000000'
      },
      bottom: {
        style: "thin",
        color: '#000000'
      },
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      shrinkToFit: true,
      wrapText: true,
    },
  });
  var headerstyle_yellow = workbook.createStyle({
    font: {
      color: '#000000',
      size: 10,
      bold: true
    },
    border: {
      left: {
        style: "thin",
        color: '#000000'
      },
      right: {
        style: "thin",
        color: '#000000'
      },
      top: {
        style: "thin",
        color: '#000000'
      },
      bottom: {
        style: "thin",
        color: '#000000'
      },
    },
    fill: {
      type: 'pattern',
      patternType: 'solid',
      bgColor: '#FFFF00',
      fgColor: '#FFFF00',
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      shrinkToFit: true,
      wrapText: true,
    },
  });

  var bodystyle = workbook.createStyle({
    font: {
      color: '#000000',
      size: 8,
    },
    border: {
      left: {
        style: "thin",
        color: '#000000'
      },
      right: {
        style: "thin",
        color: '#000000'
      },
      top: {
        style: "thin",
        color: '#000000'
      },
      bottom: {
        style: "thin",
        color: '#000000'
      },
    },
  });

  var wscolheader = 1;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ลำดับ').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('รหัสพนักงาน').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('สังกัด').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('สังกัดจริง').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('คำนำหน้า').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ชื่อ-สกุล').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ตำแหน่ง').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('เบอร์โทร').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ประเภทพนักงาน').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('แผนก').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ฝ่าย').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('สถานที่ปฏิบัติงาน').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('วันที่เริ่มงาน').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 2, wscolheader + 3, true).string('สิทธิ์ลาป่วย 30 วัน/ปี').style(headerstyle);
  worksheet.cell(3, wscolheader).string('ป่วย/วัน').style(headerstyle);
  worksheet.cell(3, wscolheader + 1).string('ป่วย/ชม.').style(headerstyle);
  worksheet.cell(3, wscolheader + 2).string('รวมวันลาป่วย').style(headerstyle_green);
  worksheet.cell(3, wscolheader + 3).string('สิทธิ์คงเหลือวันลาป่วย').style(headerstyle_pink);
  wscolheader += 4;
  worksheet.cell(2, wscolheader, 2, wscolheader + 3, true).string('สิทธิ์ลากิจ 8 วัน/ปี').style(headerstyle);
  worksheet.cell(3, wscolheader).string('กิจ/วัน').style(headerstyle);
  worksheet.cell(3, wscolheader + 1).string('กิจ/ชม.').style(headerstyle);
  worksheet.cell(3, wscolheader + 2).string('รวมวันลากิจ').style(headerstyle_green);
  worksheet.cell(3, wscolheader + 3).string('สิทธิ์คงเหลือวันลากิจ').style(headerstyle_pink);
  wscolheader += 4;
  worksheet.cell(2, wscolheader, 2, wscolheader + 4, true).string('สิทธิ์ลาพักร้อน 6 วัน/ปี').style(headerstyle);
  worksheet.cell(3, wscolheader).string('พักร้อน/วัน').style(headerstyle);
  worksheet.cell(3, wscolheader + 1).string('พักร้อน/ชม.').style(headerstyle);
  worksheet.cell(3, wscolheader + 2).string('รวมพักร้อน').style(headerstyle_green);
  worksheet.cell(3, wscolheader + 3).string('สิทธิ์คงเหลือวันพักร้อน').style(headerstyle_pink);
  worksheet.cell(3, wscolheader + 4).string('สิทธิ์พักร้อนที่ได้').style(headerstyle_yellow);
  wscolheader += 5;
  worksheet.cell(2, wscolheader, 2, wscolheader + 6, true).string('ลาอื่นๆ').style(headerstyle);
  worksheet.cell(3, wscolheader).string('ไม่รับค่าจ้าง/วัน').style(headerstyle);
  worksheet.cell(3, wscolheader + 1).string('ไม่รับค่าจ้าง/ชม').style(headerstyle);
  worksheet.cell(3, wscolheader + 2).string('รวมไม่รับค่าจ้าง').style(headerstyle_green);
  worksheet.cell(3, wscolheader + 3).string('ลากิจพิเศษ').style(headerstyle);
  worksheet.cell(3, wscolheader + 4).string('ลาบวช').style(headerstyle);
  worksheet.cell(3, wscolheader + 5).string('ลาคลอด').style(headerstyle);
  worksheet.cell(3, wscolheader + 6).string('ลาป่วย (เนื่องจากบาดเจ็บในงาน)/วัน').style(headerstyle_green);
  wscolheader += 7;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ผู้อนุมัติการลาขั้นต้น').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader, 3, wscolheader, true).string('ผู้อนุมัติสูงสุด').style(headerstyle);
  wscolheader++;
  worksheet.cell(1, 1, 1, wscolheader, true).string(`รายงานข้อมูลพนักงาน วันที่ ${moment(req.query.toDate).format('DD/MM/YYYY')}`).style(topicstyle);

  var rows = 4;
  var index = 0;
  for await (var item of result.recordset) {
    var wscol = 1;
    worksheet.cell(rows, wscol).string((index + 1) + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.EMP_CODE ? item.EMP_CODE + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.AFFILIATION ? item.AFFILIATION + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.AFFILIATION_SUB ? item.AFFILIATION_SUB + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.TITLE ? item.TITLE + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.FULLNAME ? item.FULLNAME + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.POSITION ? item.POSITION + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.PHONE ? item.PHONE + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.EMPLOYEE_TYPE_NAME ? item.EMPLOYEE_TYPE_NAME + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.DEPARTMENT ? item.DEPARTMENT + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.FACTION ? item.FACTION + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.WORK_LOCATION ? item.WORK_LOCATION + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.START_WORK ? moment(item.START_WORK).format("DD/MM/YYYY") + '' : '-').style(bodystyle); wscol++;
    sql = ` SELECT
              LTD.id
              ,LTD.FK_LEAVE_TYPE_ID
              ,ISNULL(LTQ.DAY, 0) as [DAY]
              ,ISNULL(LTQ.HOUR, 0) as [HOUR]
              ,LTD.QTY
              ,LTD.YEAR
              ,LTD.FK_EMPLOYEE_TYPE_ID
              ,LT.LEAVE_NAME
            FROM LEAVE_TYPE_DETAIL LTD
            JOIN [USER] U ON LTD.FK_EMPLOYEE_TYPE_ID = U.FK_EMPLOYEE_TYPE_ID AND U.id = ${item.id}
            LEFT JOIN LEAVE_TYPE LT ON LTD.FK_LEAVE_TYPE_ID = LT.id
            LEFT JOIN LEAVE_TRANSACTION_QTY LTQ ON LTD.FK_LEAVE_TYPE_ID = LTQ.FK_LEAVE_TYPE_ID AND LTQ.FK_USER_ID = ${item.id}
            WHERE LTD.YEAR = ${moment(new Date()).format('YYYY')}`;
    result = await pool.query(sql);

    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาป่วย").DAY + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาป่วย").HOUR + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาป่วย").DAY + 'วัน' + filterLeaveType(result.recordset, "ลาป่วย").HOUR + 'ชม.').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(formatsumleave(filterLeaveType(result.recordset, "ลาป่วย"))).style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลากิจ").DAY + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลากิจ").HOUR + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลากิจ").DAY + 'วัน' + filterLeaveType(result.recordset, "ลากิจ").HOUR + 'ชม.').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(formatsumleave(filterLeaveType(result.recordset, "ลากิจ"))).style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี").DAY + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี").HOUR + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี").DAY + 'วัน' + filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี").HOUR + 'ชม.').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(formatsumleave(filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี"))).style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาหยุดพักผ่อนประจำปี").QTY + '').style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาไม่รับค่าจ้าง").DAY + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาไม่รับค่าจ้าง").HOUR + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(filterLeaveType(result.recordset, "ลาไม่รับค่าจ้าง").DAY + 'วัน' + filterLeaveType(result.recordset, "ลาไม่รับค่าจ้าง").HOUR + 'ชม.').style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(Number(filterLeaveType(result.recordset, "ลากิจ(พิเศษ)").DAY + '.' + Number(filterLeaveType(result.recordset, "ลากิจ(พิเศษ)").HOUR * 10)) + '').style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(Number(filterLeaveType(result.recordset, "ลาเพื่ออุปสมบท").DAY + '.' + Number(filterLeaveType(result.recordset, "ลาเพื่ออุปสมบท").HOUR * 10)) + '').style(bodystyle); wscol++;

    worksheet.cell(rows, wscol).string(Number(filterLeaveType(result.recordset, "ลาคลอด").DAY + '.' + Number(filterLeaveType(result.recordset, "ลาคลอด").HOUR * 10)) + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string('').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.ADVANCED_LEAVE_APPROVER_NAME ? item.ADVANCED_LEAVE_APPROVER_NAME + '' : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(item.ADVANCED_LEAVE_APPROVER_NAME ? item.ADVANCED_LEAVE_APPROVER_NAME + '' : '-').style(bodystyle); wscol++;

    index++;
    rows++;
  }

  // worksheet.cell(rows, wscol).string(result.recordsets[3][0].approveAmount + '').style(bodystyle);
  // wscol++;
  // worksheet.cell(rows, wscol).string(result.recordsets[4][0].rejectAmount + '').style(bodystyle);
  // wscol++;
  // worksheet.cell(rows, wscol).string(result.recordsets[5][0].waitingAmout + '').style(bodystyle);
  // wscol++;

  workbook.writeToBuffer().then((buffer) => {
    const binaryBuffer = Buffer.from(buffer);
    res.attachment(moment().format("yyyyMMDDHHmm") + `-รายงาน${req.query.leaveType}.xlsx`);
    // return res.send(binaryBuffer);
    let base64data = binaryBuffer.toString('base64');
    // console.log(`base64data` ,base64data);

    res.status(200).json({
      status: 'success',
      data: base64data,
    });
  });
});

function formatsumleave(item) {
  var QTY = Number(item.QTY); //8
  // console.log('item.QTY', item.QTY);
  // console.log('QTY', QTY);
  var DAY = QTY - Number(item.DAY); //7
  // console.log('item.DAY', item.DAY);
  // console.log('DAY', DAY);
  var HOUR = (DAY - (Number(item.HOUR) / 10)).toFixed(2); //5.5
  // console.log('item.HOUR', item.HOUR);
  // console.log('HOUR', HOUR);
  var sumArr = (HOUR + '').split('.');
  // console.log('sumArr', sumArr);
  var sumtxt = (sumArr[0] ? sumArr[0] : 0) + 'วัน' + (Number(sumArr[1]) > 0 ? Number((sumArr[1] / 10) - 2).toFixed(1) : 0) + 'ชม.';
  // console.log('sumtxt', sumtxt);
  return sumtxt;
}

function filterLeaveType(item, statustext) {
  var data;
  data = item.filter(x => x.LEAVE_NAME == statustext);
  return data[0];
}

exports.getDataPaginate = catchAsync(async (req, res, next) => {
  var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  var queryWhere = ` AND (EMP_CODE like N'%${searchtxt}%' OR FULLNAME like N'%${searchtxt}%' OR POSITION like N'%${searchtxt}%' OR WORK_LOCATION like N'%${searchtxt}%')`;
  if (req.user.role == 3) {
    queryWhere = ` AND ADVANCED_LEAVE_APPROVER = '${req.user.FK_USER_ID}' `;
  }
  if (req.query.employeeType == 'พนักงานปัจจุบัน') {
    queryWhere += ` AND (IS_RETIRE is null or IS_RETIRE != 1) `;
  }
  else {
    queryWhere += ` AND IS_RETIRE = 1`;
  }
  if (req.query.status == 'เชื่อมต่อกับ LINE') {
    queryWhere += ` AND LINE_USERID is not null `;
  }
  else if (req.query.status == 'ทั้งหมด') {
    queryWhere += ` `;
  }
  else {
    queryWhere += ` AND LINE_USERID is null `;
  }
  var sql = ` DECLARE 
              @PageSize INT = ${req.query.perPage}, 
              @PageNum  INT = ${req.query.nowPage};

              WITH TempResult AS (
                SELECT * FROM [USER] WHERE 1 = 1 ${queryWhere}
              ), TempCount AS (
                SELECT COUNT(*) AS MaxRows FROM [USER] WHERE 1 = 1 ${queryWhere}
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

exports.getEmployeeDataByEmpcode = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = `SELECT TOP 1 
                U.*, ET.id AS EMPLOYEE_TYPE_ID, ET.EMPLOYEE_TYPE_NAME
              FROM [USER] U 
              LEFT JOIN [EMPLOYEE_TYPE] ET ON U.FK_EMPLOYEE_TYPE_ID = ET.id
              WHERE U.IS_ACTIVE = 1 AND U.LINE_USERID is null AND U.EMP_CODE = '${req.params.id}' 
              ORDER BY U.id DESC`;
  var result = await pool.query(sql);

  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = `SELECT TOP 1 
                U.*, ET.EMPLOYEE_TYPE_NAME, UHEAD.FULLNAME as headfullname
              FROM [USER] U 
              LEFT JOIN [EMPLOYEE_TYPE] ET ON U.FK_EMPLOYEE_TYPE_ID = ET.id
              LEFT JOIN [USER] UHEAD ON UHEAD.id = U.ADVANCED_LEAVE_APPROVER
              WHERE U.IS_ACTIVE = 1 AND U.id = '${req.params.id}' 
              ORDER BY U.id DESC`;
  var result = await pool.query(sql);

  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  try {
    if (!req.body.USERNAME || !req.body.PASSWORD || !req.body.FULLNAME || !req.body.EMAIL || !req.body.PHONE || !req.body.role) {
      return next(new AppError("Please fill data", 400));
    }

    let columnArr = [
      "[USERNAME]",
      "[PASSWORD]",
      "[FULLNAME]",
      "[EMAIL]",
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
      `'${req.body.EMAIL}'`,
      `'${req.body.PHONE}'`,
      `'${req.body.role}'`,
      `'1'`,
      `'${req.user.id}'`,
      `'${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]

    let pool = await new dbQuery().connect();
    var sql = `INSERT INTO [USER] (${columnArr}) OUTPUT Inserted.id VALUES (${valueArr})`;
    var result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {
      res.status(201).json({ status: 'created success' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.updateUser = catchAsync(async (req, res, next) => {
  try {
    let updatevalueArr = [
      `[EMP_CODE] = '${req.body.EMP_CODE}'`,
      `[POSITION] = '${req.body.POSITION}'`,
      `[FULLNAME] = ${req.body.FULLNAME ? "'" + req.body.FULLNAME + "'" : null}`,
      `[EMAIL] = ${req.body.EMAIL ? "'" + req.body.EMAIL + "'" : null}`,
      `[PHONE] = ${req.body.PHONE ? "'" + req.body.PHONE + "'" : null}`,
      `[DEPARTMENT] = ${req.body.DEPARTMENT ? "'" + req.body.DEPARTMENT + "'" : null}`,
      `[FK_EMPLOYEE_TYPE_ID] = ${req.body.FK_EMPLOYEE_TYPE_ID ? "'" + req.body.FK_EMPLOYEE_TYPE_ID + "'" : null}`,
      `[FACTION] = ${req.body.FACTION ? "'" + req.body.FACTION + "'" : null}`,
      `[WORK_LOCATION] = ${req.body.WORK_LOCATION ? "'" + req.body.WORK_LOCATION + "'" : null}`,
      `[START_WORK] = ${req.body.START_WORK ? "'" + req.body.START_WORK + "'" : null}`,
      `[LAST_WORK] = ${req.body.LAST_WORK ? "'" + req.body.LAST_WORK + "'" : null}`,
      `[IS_RETIRE] = ${req.body.IS_RETIRE ? "'" + req.body.IS_RETIRE + "'" : null}`,
      `[ADVANCED_LEAVE_APPROVER] = ${req.body.ADVANCED_LEAVE_APPROVER ? "'" + req.body.ADVANCED_LEAVE_APPROVER + "'" : null}`,
      `[UPDATED_BY] = '${req.user.id}'`,
      `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]

    if(req.body.IS_RETIRE) {
      updatevalueArr.push(`[LINE_USERID] = null`)
      updatevalueArr.push(`[IS_VERIFY] = null`)
    }

    let pool = await new dbQuery().connect();
    var sql = `UPDATE [USER] SET ${updatevalueArr} WHERE id = '${req.params.id}'`;
    var result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {
      for await (var item of req.body.LIST_QTY) {
        var used = Number(item.USED);
        var body = {
          FK_USER_ID: req.params.id,
          FK_LEAVE_TYPE_ID: item.FK_LEAVE_TYPE_ID,
          YEAR: item.YEAR,
          HOUR: 0,
          DAY: 0,
          USED: '29.50',
        }
        if (used > 0) {
          if (used % 1 == 0) {
            body.DAY = used;
            body.HOUR = 0;
          }
          else {
            body.DAY = Number(item.USED.split('.')[0]);
            body.HOUR = Number(item.USED.split('.')[1]) / 10;
          }
        }

        sql = `SELECT * FROM [LEAVE_TRANSACTION_QTY] WHERE FK_USER_ID = '${req.params.id}' AND FK_LEAVE_TYPE_ID = '${item.FK_LEAVE_TYPE_ID}' AND YEAR = '${item.YEAR}' `;
        result = await pool.query(sql);
        if (result.recordset.length > 0) {
          sql = `UPDATE [LEAVE_TRANSACTION_QTY] SET DAY = '${body.DAY}', HOUR = '${body.HOUR}' WHERE id = '${result.recordset[0].id}'`;
          result = await pool.query(sql);
        }
        else {
          sql = `INSERT INTO [LEAVE_TRANSACTION_QTY] (FK_USER_ID,FK_LEAVE_TYPE_ID,YEAR,HOUR,DAY) VALUES ('${body.FK_USER_ID}','${body.FK_LEAVE_TYPE_ID}','${body.YEAR}','${body.HOUR}','${body.DAY}')`;
          result = await pool.query(sql);
        }
      }
      res.status(200).json({ status: 'updated success' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});
