const catchAsync = require('../utils/catchAsync');
const dbQuery = require('../utils/dbQuery');
const AppError = require('../utils/appError');
const excel = require('excel4node');
const moment = require('moment');
const UsersModel = require('../models/users.js');
const LeaveTransactionQtyModel = require('../models/leave_transaction_qty.js');

exports.setIsActive = catchAsync(async (req, res, next) => {
  try {
    if (!req.body.id || req.body.is_active == null) {
      return next(new AppError("Please fill data", 400));
    }

    
    let updatevalueArr = [
      `[is_active] = '${req.body.is_active}'`,
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

  // ดึงข้อมูลจาก MongoDB
  const user = await UsersModel.findById(req.params.id).exec();

  if (!user) {
    return next(new AppError("User not found", 404));
  }

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

  var rows = 4;
  var wscol = 1;
  worksheet.cell(rows, wscol).string('1').style(bodystyle); wscol++;
  worksheet.cell(rows, wscol).string(user.emp_code ? user.emp_code.toString() : '-').style(bodystyle); wscol++;
  worksheet.cell(rows, wscol).string(user.affiliation || '-').style(bodystyle); wscol++;
  worksheet.cell(rows, wscol).string(user.fullname || '-').style(bodystyle); wscol++;
  worksheet.cell(rows, wscol).string(user.position || '-').style(bodystyle); wscol++;
  worksheet.cell(rows, wscol).string(user.fk_employee_type_id || '-').style(bodystyle); wscol++;
  worksheet.cell(rows, wscol).string(user.department || '-').style(bodystyle); wscol++;
  worksheet.cell(rows, wscol).string(user.faction || '-').style(bodystyle); wscol++;
  worksheet.cell(rows, wscol).string(user.work_location || '-').style(bodystyle); wscol++;
  worksheet.cell(rows, wscol).string(user.start_work ? moment(user.start_work).format("DD/MM/YYYY") : '-').style(bodystyle); wscol++;

  workbook.writeToBuffer().then((buffer) => {
    const binaryBuffer = Buffer.from(buffer);
    res.attachment(moment().format("yyyyMMDDHHmm") + `-รายงานข้อมูลพนักงาน.xlsx`);
    let base64data = binaryBuffer.toString('base64');

    res.status(200).json({
      status: 'success',
      data: base64data,
    });
  });
});

exports.exportUserData = catchAsync(async (req, res, next) => {
  const searchtxt = req.query.search && req.query.search !== 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let query = {};

  if (req.query.employeeType === 'พนักงานปัจจุบัน') {
    query.is_retire = { $ne: 1 };
  } else if (req.query.employeeType === 'พนักงานเกษียณ') {
    query.is_retire = 1;
  }

  if (req.query.status === 'เชื่อมต่อกับ LINE') {
    query.line_userid = { $ne: null };
  } else if (req.query.status === 'ไม่ได้เชื่อมต่อกับ LINE') {
    query.line_userid = null;
  }

  const users = await UsersModel.find(query)
    .populate('advanced_leave_approver', 'fullname')
    .populate('fk_employee_type_id', 'EMPLOYEE_TYPE_NAME');

  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet(`รายงาน${req.query.leaveType}`);

  const topicstyle = workbook.createStyle({
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

  const headerstyle = workbook.createStyle({
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
      left: { style: "thin", color: '#000000' },
      right: { style: "thin", color: '#000000' },
      top: { style: "thin", color: '#000000' },
      bottom: { style: "thin", color: '#000000' },
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center',
      shrinkToFit: true,
      wrapText: true,
    },
  });

  const headerstyle_green = workbook.createStyle({
    font: { color: '#000000', size: 10, bold: true },
    fill: { type: 'pattern', patternType: 'solid', bgColor: '#A9D08E', fgColor: '#A9D08E' },
    border: { left: { style: "thin", color: '#000000' }, right: { style: "thin", color: '#000000' }, top: { style: "thin", color: '#000000' }, bottom: { style: "thin", color: '#000000' } },
    alignment: { vertical: 'center', horizontal: 'center', shrinkToFit: true, wrapText: true },
  });

  const headerstyle_pink = workbook.createStyle({
    font: { color: '#000000', size: 10, bold: true },
    fill: { type: 'pattern', patternType: 'solid', bgColor: '#FF99CC', fgColor: '#FF99CC' },
    border: { left: { style: "thin", color: '#000000' }, right: { style: "thin", color: '#000000' }, top: { style: "thin", color: '#000000' }, bottom: { style: "thin", color: '#000000' } },
    alignment: { vertical: 'center', horizontal: 'center', shrinkToFit: true, wrapText: true },
  });

  const headerstyle_yellow = workbook.createStyle({
    font: { color: '#000000', size: 10, bold: true },
    fill: { type: 'pattern', patternType: 'solid', bgColor: '#FFFF00', fgColor: '#FFFF00' },
    border: { left: { style: "thin", color: '#000000' }, right: { style: "thin", color: '#000000' }, top: { style: "thin", color: '#000000' }, bottom: { style: "thin", color: '#000000' } },
    alignment: { vertical: 'center', horizontal: 'center', shrinkToFit: true, wrapText: true },
  });

  const bodystyle = workbook.createStyle({
    font: { color: '#000000', size: 8 },
    border: { left: { style: "thin", color: '#000000' }, right: { style: "thin", color: '#000000' }, top: { style: "thin", color: '#000000' }, bottom: { style: "thin", color: '#000000' } },
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
  for await (const user of users) {
    //  แปลง ObjectId เป็น String แล้วแปลงเป็น Number
    // const userId = parseInt(user._id.toString(), 16);
    // const leaveTransactions = await LeaveTransactionQtyModel.find({ fk_user_id: userId });
    const leaveTransactions = await LeaveTransactionQtyModel.find({ fk_user_id: user._id});
    var wscol = 1;
    worksheet.cell(rows, wscol).string((index + 1) + '').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.emp_code || '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.affiliation || '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.affiliation_sub || '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.title || '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.fullname || '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.position || '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.phone || '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.fk_employee_type_id ? user.fk_employee_type_id.EMPLOYEE_TYPE_NAME : '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.department || '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.faction || '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.work_location || '-').style(bodystyle); wscol++;
    worksheet.cell(rows, wscol).string(user.start_work ? moment(user.start_work).format("DD/MM/YYYY") + '' : '-').style(bodystyle);

    leaveTransactions.forEach((leave) => {
      worksheet.cell(rows, wscol).number(leave.DAY || 0).style(bodystyle);
      worksheet.cell(rows, wscol + 1).number(leave.HOUR || 0).style(bodystyle);
      worksheet.cell(rows, wscol + 2).string(`${leave.DAY || 0} วัน ${leave.HOUR || 0} ชม.`).style(bodystyle);
      worksheet.cell(rows, wscol + 3).number(leave.USED || 0).style(bodystyle);
      wscol += 4;
    });

    index++;
    rows++;
  }

  workbook.writeToBuffer().then((buffer) => {
    const binaryBuffer = Buffer.from(buffer);
    res.attachment(moment().format("yyyyMMDDHHmm") + `-รายงาน${req.query.leaveType}.xlsx`);
    let base64data = binaryBuffer.toString('base64');
        res.status(200).json({
                status: 'success',
                data: base64data,
              });
  }).catch(err => {
    next(new AppError("ERROR: " + err, 400));
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
  const searchtxt = req.query.search && req.query.search !== 'null' ? req.query.search : "";
  const role = req.user.role;
  const fk_user_id = req.user.fk_user_id;
  const employeeType = req.query.employeeType;
  const status = req.query.status;
  const perPage = parseInt(req.query.perPage) || 10;
  const nowPage = parseInt(req.query.nowPage) || 1;

  let query = {};

  if (searchtxt) {
    query.$or = [
      { EMP_CODE: { $regex: searchtxt, $options: 'i' } },
      { fullname: { $regex: searchtxt, $options: 'i' } },
      { POSITION: { $regex: searchtxt, $options: 'i' } },
      { WORK_LOCATION: { $regex: searchtxt, $options: 'i' } },
    ];
  }

  if (role === 3) {
    query.ADVANCED_LEAVE_APPROVER = fk_user_id;
  }

  if (employeeType === 'พนักงานปัจจุบัน') {
    query.IS_RETIRE = { $ne: 1 };
  } else if (employeeType === 'พนักงานเกษียณ') {
    query.IS_RETIRE = 1;
  }

  if (status === 'เชื่อมต่อกับ LINE') {
    query.LINE_USERID = { $ne: null };
  } else if (status === 'ไม่ได้เชื่อมต่อกับ LINE') {
    query.LINE_USERID = null;
  }

  const users = await UsersModel.find(query)
    .skip((nowPage - 1) * perPage)
    .limit(perPage)
    .sort({ _id: -1 });

  const totalCount = await UsersModel.countDocuments(query);

  res.status(200).json({
    status: 'success',
    data: users,
    total: totalCount,
    pages: Math.ceil(totalCount / perPage),
  });
});

exports.getEmployeeDataByEmpcode = catchAsync(async (req, res, next) => {
  
  const empCode = req.params.id;

const user = await UsersModel.findOne({ emp_code: empCode, is_active: 1, line_userid: 'NULL' })
    .populate('fk_employee_type_id', 'id EMPLOYEE_TYPE_NAME')
    .sort({ _id: -1 });

  if (!user) {
    return next(new AppError('Employee not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  try {
    const response = await UsersModel.findOne({ _id: req.params.id, is_active: 1 })
    .populate('fk_employee_type_id', 'EMPLOYEE_TYPE_NAME')
    .populate('advanced_leave_approver', 'fullname')
    .sort({ _id: -1 })
    .limit(1);
  
    res.status(200).json({
      status: 'success',
      data: response,
    });
  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.createUser = catchAsync(async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.password || !req.body.fullname || !req.body.email || !req.body.phone || !req.body.role) {
      return next(new AppError("Bad Request", 400));
    }

    const password = await bcrypt.hash(req.body.password);
    const body = {
      username: req.body.username,
      password: password,
      fullname: req.body.fullname,
      email: req.body.email,
      role: req.body.role,
      is_active: '1',
      created_by: req.body.id,
      created_date: new Date().toISOString()
    };

    const result = await User.findOne(body);
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
    let updateFields = {
      emp_code: req.body.emp_code,
      position: req.body.position,
      fullname: req.body.fullname || null,
      email: req.body.email || null,
      phone: req.body.phone || null,
      department: req.body.department || null,
      fk_employee_type_id: req.body.fk_employee_type_id || null,
      faction: req.body.faction || null,
      work_location: req.body.work_location || null,
      start_work: req.body.start_work || null,
      last_work: req.body.last_work || null,
      is_retire: req.body.is_retire || null,
      advanced_leave_approver: req.body.advanced_leave_approver || null,
      updated_by: req.user.id,
      updated_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
    };

    if (req.body.is_retire) {
      updateFields.line_userid = null;
      updateFields.is_verify = null;
    }

    const user = await UsersModel.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (user) {
      for (const item of req.body.list_qty) {
        const used = Number(item.USED);
        const body = {
          fk_user_id: Number(req.params.id) || null,
          fk_employee_type_id: item.fk_employee_type_id,
          year: item.YEAR,
          hour: 0,
          day: 0,
          used: '29.50'
        };

        if (used > 0) {
          if (used % 1 === 0) {
            body.day = used;
            body.hour = 0;
          } else {
            body.day = Math.floor(used);
            body.hour = (used % 1) * 10;
          }
        }

        const leaveTransaction = await LeaveTransactionQtyModel.findOne({
          fk_user_id: Number(req.params.id) || null,
          fk_employee_type_id: item.fk_employee_type_id,
          year: item.year
        });

        if (leaveTransaction) {
          await LeaveTransactionQtyModel.findByIdAndUpdate(leaveTransaction._id, {
            day: body.day,
            hour: body.hour
          });
        } else {
          await LeaveTransactionQtyModel.create(body);
        }
      }
      res.status(200).json({ status: 'updated success' });
    } else {
      return next(new AppError("User not found", 404));
    }
  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});