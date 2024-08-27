const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const factory = require('../helpers/handlerFactory');
const dbQuery = require('../utils/dbQuery');
const AppError = require('../utils/appError');
const excel = require('excel4node');
const moment = require('moment');
const axios = require("axios");
const PDFGenerator = require("pdfkit");
const { Base64Encode } = require('base64-stream');
const Readable = require('stream').Readable;
const readXlsxFile = require('read-excel-file/node');

exports.exportDashboardData = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = ``;
  var result = null;
  sql = ` 
        SELECT COUNT(*) AS activeEmployeeAmount FROM [USER] WHERE (IS_RETIRE is null or IS_RETIRE != 1) 

        SELECT COUNT(*) AS retireEmployeeAmount FROM [USER] WHERE IS_RETIRE = 1

        SELECT 
          COUNT(LTR.id) as number
          ,LT.LEAVE_NAME as text
        FROM [LEAVE_TYPE] LT
        LEFT JOIN [LEAVE_TRANSACTION] LTR ON LT.id = LTR.LEAVE_TYPE
        AND LTR.LEAVE_TO_DATE >= '${moment(req.query.toDate).format('YYYY-MM-DD') + ' 00:00:00'}' 
        AND LTR.LEAVE_END_DATE <= '${moment(req.query.endDate).format('YYYY-MM-DD') + ' 23:59:59'}'
        GROUP BY LT.LEAVE_NAME, LT.id
        ORDER BY LT.id asc
        
        SELECT COUNT(*) AS approveAmount FROM [LEAVE_TRANSACTION] WHERE STATUS = 2 AND LEAVE_TO_DATE >= '${moment(req.query.toDate).format('YYYY-MM-DD') + ' 00:00:00'}' 
        AND LEAVE_END_DATE <= '${moment(req.query.endDate).format('YYYY-MM-DD') + ' 23:59:59'}'
        
        SELECT COUNT(*) AS rejectAmount FROM [LEAVE_TRANSACTION] WHERE STATUS = 3 AND LEAVE_TO_DATE >= '${moment(req.query.toDate).format('YYYY-MM-DD') + ' 00:00:00'}' 
        AND LEAVE_END_DATE <= '${moment(req.query.endDate).format('YYYY-MM-DD') + ' 23:59:59'}'
        
        SELECT COUNT(*) AS waitingAmout FROM [LEAVE_TRANSACTION] WHERE STATUS = 1 AND LEAVE_TO_DATE >= '${moment(req.query.toDate).format('YYYY-MM-DD') + ' 00:00:00'}' 
        AND LEAVE_END_DATE <= '${moment(req.query.endDate).format('YYYY-MM-DD') + ' 23:59:59'}'
  `;
  result = await pool.query(sql);
  // res.status(200).json({
  //   status: 'success',
  //   data: result.recordsets,
  // });

  var workbook = new excel.Workbook();

  var worksheet = workbook.addWorksheet(`รายงาน${req.query.leaveType}`);

  var headerstyle = workbook.createStyle({
    font: {
      color: '#000000',
      size: 13,
      bold: true
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center'
    },
  });

  var bodystyle = workbook.createStyle({
    font: {
      color: '#000000',
      size: 8,
    },
  });

  var wscolheader = 1;
  worksheet.cell(2, wscolheader).string('จำนวนพนักงานปัจจุบัน').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('จำนวนพนักงานที่ลาออก').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('จำนวนพนักงานที่ลาป่วย').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('จำนวนพนักงานที่ลากิจ').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('จำนวนพนักงานที่ลากิจ(พิเศษ)').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('จำนวนพนักงานที่ลาคลอด').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('จำนวนพนักงานที่ลาเพื่อรับราชการทหาร').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('จำนวนพนักงานที่ลาเพื่ออุปสมบท').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('จำนวนพนักงานที่ลาหยุดพักผ่อนประจำปี').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('จำนวนพนักงานที่ลาไม่รับค่าจ้าง').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('รายการที่อนุมัติ').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('รายการไม่อนุมัติ').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('รายการรออนุมัติ').style(headerstyle);

  worksheet.cell(1, 1, 1, wscolheader, true).string(`รายงานภาพรวมการลาของพนักงาน ของวันที่ ${moment(req.query.toDate).format('DD/MM/YYYY')} ถึง ${moment(req.query.endDate).format('DD/MM/YYYY')}`).style(headerstyle);

  var rows = 3;
  var wscol = 1;
  worksheet.cell(rows, wscol).string(result.recordsets[0][0].activeEmployeeAmount + '').style(bodystyle);
  wscol++;
  worksheet.cell(rows, wscol).string(result.recordsets[1][0].retireEmployeeAmount + '').style(bodystyle);
  wscol++;
  for await (var item of result.recordsets[2]) {
    worksheet.cell(rows, wscol).string(item.number + '').style(bodystyle);
    wscol++;
  }
  worksheet.cell(rows, wscol).string(result.recordsets[3][0].approveAmount + '').style(bodystyle);
  wscol++;
  worksheet.cell(rows, wscol).string(result.recordsets[4][0].rejectAmount + '').style(bodystyle);
  wscol++;
  worksheet.cell(rows, wscol).string(result.recordsets[5][0].waitingAmout + '').style(bodystyle);
  wscol++;

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

exports.getDataDashboard = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = ``;
  var result = null;
  sql = ` 
        SELECT COUNT(*) AS activeEmployeeAmount FROM [USER] WHERE (IS_RETIRE is null or IS_RETIRE != 1) 

        SELECT COUNT(*) AS retireEmployeeAmount FROM [USER] WHERE IS_RETIRE = 1

        SELECT 
          COUNT(LTR.id) as number
          ,LT.LEAVE_NAME as text
        FROM [LEAVE_TYPE] LT
        LEFT JOIN [LEAVE_TRANSACTION] LTR ON LT.id = LTR.LEAVE_TYPE
        AND LTR.LEAVE_TO_DATE >= '${moment(req.query.toDate).format('YYYY-MM-DD') + ' 00:00:00'}' 
        AND LTR.LEAVE_END_DATE <= '${moment(req.query.endDate).format('YYYY-MM-DD') + ' 23:59:59'}'
        GROUP BY LT.LEAVE_NAME, LT.id
        ORDER BY LT.id asc
        
        SELECT COUNT(*) AS approveAmount FROM [LEAVE_TRANSACTION] WHERE STATUS = 2 AND LEAVE_TO_DATE >= '${moment(req.query.toDate).format('YYYY-MM-DD') + ' 00:00:00'}' 
        AND LEAVE_END_DATE <= '${moment(req.query.endDate).format('YYYY-MM-DD') + ' 23:59:59'}'
        
        SELECT COUNT(*) AS rejectAmount FROM [LEAVE_TRANSACTION] WHERE STATUS = 3 AND LEAVE_TO_DATE >= '${moment(req.query.toDate).format('YYYY-MM-DD') + ' 00:00:00'}' 
        AND LEAVE_END_DATE <= '${moment(req.query.endDate).format('YYYY-MM-DD') + ' 23:59:59'}'
        
        SELECT COUNT(*) AS waitingAmout FROM [LEAVE_TRANSACTION] WHERE STATUS = 1 AND LEAVE_TO_DATE >= '${moment(req.query.toDate).format('YYYY-MM-DD') + ' 00:00:00'}' 
        AND LEAVE_END_DATE <= '${moment(req.query.endDate).format('YYYY-MM-DD') + ' 23:59:59'}'
  `;
  result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordsets,
  });
});

exports.getDashboardDataPaginate = catchAsync(async (req, res, next) => {
  var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  var queryWhere = ` AND (U.EMP_CODE like N'%${searchtxt}%' OR U.FULLNAME like N'%${searchtxt}%' OR U.POSITION like N'%${searchtxt}%' OR LT.LEAVE_CODE like N'%${searchtxt}%' ) `;

  if (req.query.reportType == 1) {
    queryWhere += ` AND (U.IS_RETIRE is null or U.IS_RETIRE != 1) `;
  }
  else {
    queryWhere += ` AND U.IS_RETIRE = 1`;
  }
  var sql = ` DECLARE 
              @PageSize INT = ${req.query.perPage}, 
              @PageNum  INT = ${req.query.nowPage};

              WITH TempResult AS (
                SELECT DISTINCT U.id, U.EMP_CODE, U.FULLNAME, U.POSITION FROM [USER] U
                LEFT JOIN [LEAVE_TRANSACTION] LT ON LT.FK_USER_ID = U.id
                LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id
                WHERE 1 = 1 ${queryWhere}
              ), TempCount AS (
                SELECT COUNT(*) AS MaxRows FROM (SELECT DISTINCT U.EMP_CODE, U.FULLNAME, U.POSITION FROM [USER] U
                  LEFT JOIN [LEAVE_TRANSACTION] LT ON LT.FK_USER_ID = U.id
                  LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id
                  WHERE 1 = 1 ${queryWhere}) a 
              )
              SELECT *
              FROM TempResult, TempCount
              ORDER BY TempResult.id
              OFFSET (@PageNum-1)* @PageSize ROWS
              FETCH NEXT @PageSize ROWS ONLY`;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getDataPaginate = catchAsync(async (req, res, next) => {
  var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  var queryWhere = ` AND (U.EMP_CODE like N'%${searchtxt}%' OR U.FULLNAME like N'%${searchtxt}%' OR U.POSITION like N'%${searchtxt}%' OR CONVERT(varchar, LT.LEAVE_TO_DATE, 103) like N'%${searchtxt}%' OR CONVERT(varchar, LT.LEAVE_END_DATE, 103) like N'%${searchtxt}%' OR LT.LEAVE_CODE like N'%${searchtxt}%' ) `;
  if (req.user.role == 3) {
    queryWhere = ` AND U.ADVANCED_LEAVE_APPROVER = '${req.user.FK_USER_ID}' `;
  }
  if (req.query.type && req.query.type != 'null') {
    if (req.query.type == '999') {
      queryWhere += ` AND LT.IS_WORK_OUTSIDE = '1' `;
    } else {
      queryWhere += ` AND LT.LEAVE_TYPE = '${req.query.type}' `;
    }
  }
  if (req.query.toDate && req.query.toDate != 'null' && req.query.endDate && req.query.endDate != 'null') {
    // queryWhere += ` AND (LT.LEAVE_TO_DATE >= '${moment(req.query.toDate).format('YYYY-MM-DD')}' AND LT.LEAVE_END_DATE <= '${moment(req.query.endDate).format('YYYY-MM-DD')}') `;
    queryWhere += ` AND (('${moment(req.query.toDate).format('YYYY-MM-DD')}' BETWEEN LT.LEAVE_TO_DATE AND LT.LEAVE_END_DATE) OR ('${moment(req.query.endDate).format('YYYY-MM-DD')}' BETWEEN LT.LEAVE_TO_DATE AND LT.LEAVE_END_DATE)) `;
  }
  if (req.query.leaveType == 'พนักงานที่ลางาน') {
    queryWhere += ` AND (LT.IS_RETIRE is null or LT.IS_RETIRE != 1) `;
  }
  else {
    queryWhere += ` AND LT.IS_RETIRE = 1`;
  }
  if (req.query.status && req.query.status != 'ทั้งหมด' && req.query.status != 4) {
    queryWhere += ` AND LT.IS_ACTIVE = 1 AND LT.STATUS = '${req.query.status}'`;
  }
  else if (req.query.status == 4) {
    queryWhere += ` AND (LT.IS_ACTIVE is null or LT.IS_ACTIVE != 1)`;
  }
  var sql = ` DECLARE 
              @PageSize INT = ${req.query.perPage}, 
              @PageNum  INT = ${req.query.nowPage};

              WITH TempResult AS (
                SELECT LT.*, LTY.LEAVE_NAME, U.EMP_CODE, U.FULLNAME, U.POSITION, CONVERT(varchar, LT.LEAVE_TO_DATE, 103) as LEAVE_TO_DATE_TXT, CONVERT(varchar, LT.LEAVE_END_DATE, 103) as LEAVE_END_DATE_TXT FROM LEAVE_TRANSACTION LT 
                JOIN [USER] U ON LT.FK_USER_ID = U.id 
                LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id 
                WHERE 1 = 1 ${queryWhere}
              ), TempCount AS (
                SELECT COUNT(*) AS MaxRows FROM LEAVE_TRANSACTION LT 
                JOIN [USER] U ON LT.FK_USER_ID = U.id 
                LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id
                WHERE 1 = 1 ${queryWhere}
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

exports.exportLeaveData = catchAsync(async (req, res, next) => {
  var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  var queryWhere = ` AND (U.EMP_CODE like N'%${searchtxt}%' OR U.FULLNAME like N'%${searchtxt}%' OR U.POSITION like N'%${searchtxt}%' OR CONVERT(varchar, LT.LEAVE_TO_DATE, 103) like N'%${searchtxt}%' OR CONVERT(varchar, LT.LEAVE_END_DATE, 103) like N'%${searchtxt}%' OR LT.LEAVE_CODE like N'%${searchtxt}%' ) `;
  if (req.user.role == 3) {
    queryWhere = ` AND U.ADVANCED_LEAVE_APPROVER = '${req.user.FK_USER_ID}' `;
  }
  if (req.query.type && req.query.type != 'null') {
    if (req.query.type == '999') {
      queryWhere += ` AND LT.IS_WORK_OUTSIDE = '1' `;
    } else {
      queryWhere += ` AND LT.LEAVE_TYPE = '${req.query.type}' `;
    }
  }
  if (req.query.leaveType == 'พนักงานที่ลางาน') {
    queryWhere += ` AND (LT.IS_RETIRE is null or LT.IS_RETIRE != 1) `;
  }
  else {
    queryWhere += ` AND LT.IS_RETIRE = 1`;
  }
  if (req.query.toDate && req.query.toDate != 'null' && req.query.endDate && req.query.endDate != 'null') {
    // queryWhere += ` AND (LT.LEAVE_TO_DATE >= '${moment(req.query.toDate).format('YYYY-MM-DD')}' AND LT.LEAVE_END_DATE <= '${moment(req.query.endDate).format('YYYY-MM-DD')}') `;
    queryWhere += ` AND (('${moment(req.query.toDate).format('YYYY-MM-DD')}' BETWEEN LT.LEAVE_TO_DATE AND LT.LEAVE_END_DATE) OR ('${moment(req.query.endDate).format('YYYY-MM-DD')}' BETWEEN LT.LEAVE_TO_DATE AND LT.LEAVE_END_DATE)) `;
  }
  if (req.query.type && req.query.type != 'null') {
    queryWhere += ` AND LT.LEAVE_TYPE = '${req.query.type}' `;
  }
  if (req.query.status && req.query.status != 'ทั้งหมด' && req.query.status != 4) {
    queryWhere += ` AND LT.IS_ACTIVE = 1 AND LT.STATUS = '${req.query.status}'`;
  }
  else if (req.query.status == 4) {
    queryWhere += ` AND (LT.IS_ACTIVE is null or LT.IS_ACTIVE != 1)`;
  }
  var sql = ` SELECT LT.*, LTY.LEAVE_NAME, U.EMP_CODE, U.FULLNAME,U.PHONE, U.POSITION FROM LEAVE_TRANSACTION LT 
              JOIN [USER] U ON LT.FK_USER_ID = U.id 
              LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id 
              WHERE 1 = 1 ${queryWhere}`;
  var result = await pool.query(sql);
  // res.status(200).json({
  //   status: 'success',
  //   data: result.recordset,
  // });

  var workbook = new excel.Workbook();

  var worksheet = workbook.addWorksheet(`รายงาน${req.query.leaveType}`);

  var headerstyle = workbook.createStyle({
    font: {
      color: '#000000',
      size: 13,
      bold: true
    },
    alignment: {
      vertical: 'center',
      horizontal: 'center'
    },
  });

  var bodystyle = workbook.createStyle({
    font: {
      color: '#000000',
      size: 8,
    },
  });

  var wscolheader = 1;
  worksheet.cell(2, wscolheader).string('ลำดับ').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('เลขคำขอ').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('ประเภทคำขอ').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('รหัสพนักงาน').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('ชื่อ-นามสกุล').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('ตำแหน่ง').style(headerstyle);
  wscolheader++;
  worksheet.cell(2,wscolheader).string('เบอร์โทร').style(headerstyle)
  wscolheader++
  worksheet.cell(2, wscolheader).string('วันที่ลาวันแรก').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('เวลาเริ่มต้น').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('วันที่ลาวันสุดท้าย').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('เวลาสิ้นสุด').style(headerstyle);
  wscolheader++;
  worksheet.cell(2, wscolheader).string('สถานะคำขอ').style(headerstyle);

  worksheet.cell(1, 1, 1, wscolheader, true).string(`รายงาน${req.query.leaveType}`).style(headerstyle);

  var rows = 3;
  var i = 0;
  for await (var item of result.recordset) {
    var wscol = 1;
    worksheet.cell(rows, wscol).string((i + 1) + '').style(bodystyle);
    wscol++;
    worksheet.cell(rows, wscol).string(item.LEAVE_CODE + '').style(bodystyle);
    wscol++;
    worksheet.cell(rows, wscol).string(item.IS_RETIRE ? 'ลาออก' : item.IS_WORK_OUTSIDE ?
    'ปฏิบัติงานนอกสถานที่' : item.LEAVE_NAME + '').style(bodystyle);
    wscol++;
    worksheet.cell(rows, wscol).string(item.EMP_CODE + '').style(bodystyle);
    wscol++;
    worksheet.cell(rows, wscol).string(item.FULLNAME + '').style(bodystyle);
    wscol++;
    worksheet.cell(rows, wscol).string(item.POSITION + '').style(bodystyle);
    wscol++;
    worksheet.cell(rows,wscol).string(item.PHONE).style(bodystyle)
    wscol++
    worksheet.cell(rows, wscol).string(item.LEAVE_TO_DATE ? moment(item.LEAVE_TO_DATE).utc().format('DD/MM/YYYY') : '-').style(bodystyle);
    wscol++;
    worksheet.cell(rows, wscol).string(item.TIME_START ? moment(item.TIME_START).utc().format('HH.mm') + ' น.' : '-').style(bodystyle);
    wscol++;
    worksheet.cell(rows, wscol).string(item.LEAVE_END_DATE ? moment(item.LEAVE_END_DATE).utc().format('DD/MM/YYYY') : '-').style(bodystyle);
    wscol++;
    worksheet.cell(rows, wscol).string(item.TIME_END ? moment(item.TIME_END).utc().format('HH.mm') + ' น.' : '-').style(bodystyle);
    wscol++;
    if (!item.IS_ACTIVE) {
      worksheet.cell(rows, wscol).string('ยกเลิก').style(bodystyle);
    }
    else if (item.STATUS == 1) {
      worksheet.cell(rows, wscol).string('รออนุมัติ').style(bodystyle);
    }
    else if (item.STATUS == 2) {
      worksheet.cell(rows, wscol).string('อนุมัติ').style(bodystyle);
    }
    else {
      worksheet.cell(rows, wscol).string('ไม่อนุมัติ').style(bodystyle);
    }
    i++;
    rows++;
  }

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

exports.getDataPaginateByID = catchAsync(async (req, res, next) => {
  var searchtxt = req.query.search && req.query.search != 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";
  let pool = await new dbQuery().connect();
  var queryWhere = ` AND (U.EMP_CODE like N'%${searchtxt}%' OR U.FULLNAME like N'%${searchtxt}%' OR U.POSITION like N'%${searchtxt}%') `;
  var sql = ` DECLARE 
              @PageSize INT = ${req.query.perPage}, 
              @PageNum  INT = ${req.query.nowPage};

              WITH TempResult AS (
                SELECT LT.*, LTY.LEAVE_NAME, U.EMP_CODE, U.FULLNAME, U.POSITION FROM LEAVE_TRANSACTION LT 
                JOIN [USER] U ON LT.FK_USER_ID = U.id 
                LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id 
                WHERE FK_USER_ID = ${req.params.id} ${queryWhere}
              ), TempCount AS (
                SELECT COUNT(*) AS MaxRows FROM LEAVE_TRANSACTION LT 
                JOIN [USER] U ON LT.FK_USER_ID = U.id 
                LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id
                WHERE FK_USER_ID = ${req.params.id} ${queryWhere}
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

exports.getRetireData = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = `SELECT TOP 1
              LT.*
              ,LTY.LEAVE_NAME 
              ,U.id AS UID
              ,U.LINE_USERID
              ,U.EMP_CODE
              ,ET.EMPLOYEE_TYPE_NAME
              ,U.FULLNAME
              ,U.PHONE
              ,U.POSITION
              ,U.DEPARTMENT
              ,U.WORK_LOCATION
              ,U.START_WORK
              ,U.FACTION
              ,U.ADVANCED_LEAVE_APPROVER
              ,U.IS_RETIRE as USER_IS_RETIRE
              ,U.LAST_WORK
              ,U.EMAIL
            FROM LEAVE_TRANSACTION LT
            JOIN [USER] U ON LT.FK_USER_ID = U.id 
            LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id 
            LEFT JOIN [EMPLOYEE_TYPE] ET ON U.FK_EMPLOYEE_TYPE_ID = ET.id 
            WHERE LT.IS_RETIRE = 1 AND LT.STATUS != 3 AND U.id = '${req.params.userid}'
            ORDER BY U.id, LT.id DESC `;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getLeaveByID = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = `SELECT 
              LT.*
              ,LTY.LEAVE_NAME 
              ,U.id AS UID
              ,U.LINE_USERID
              ,U.EMP_CODE
              ,ET.EMPLOYEE_TYPE_NAME
              ,U.FULLNAME
              ,U.PHONE
              ,U.POSITION
              ,U.DEPARTMENT
              ,U.WORK_LOCATION
              ,U.START_WORK
              ,U.FACTION
              ,U.ADVANCED_LEAVE_APPROVER
              ,U.IS_RETIRE as USER_IS_RETIRE
              ,U.LAST_WORK
              ,U.EMAIL
            FROM LEAVE_TRANSACTION LT
            JOIN [USER] U ON LT.FK_USER_ID = U.id 
            LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id 
            LEFT JOIN [EMPLOYEE_TYPE] ET ON U.FK_EMPLOYEE_TYPE_ID = ET.id 
            WHERE LT.id = '${req.params.id}'`;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getQTYData = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = ` SELECT
                LTD.id
                ,LTD.FK_LEAVE_TYPE_ID
                ,ISNULL(LTQ.DAY, 0) as [DAY]
                ,ISNULL(LTQ.HOUR, 0) as [HOUR]
                ,CAST(CAST(ISNULL(LTQ.DAY, 0) AS INT) AS VARCHAR) + '.' + CAST(CAST(ISNULL(LTQ.HOUR, 0) * 10 AS INT) AS VARCHAR) as USED
                ,LTD.QTY
                ,LTD.YEAR
                ,LTD.FK_EMPLOYEE_TYPE_ID
                ,LT.LEAVE_NAME
              FROM LEAVE_TYPE_DETAIL LTD
              JOIN [USER] U ON LTD.FK_EMPLOYEE_TYPE_ID = U.FK_EMPLOYEE_TYPE_ID AND U.id = ${req.params.id}
              LEFT JOIN LEAVE_TYPE LT ON LTD.FK_LEAVE_TYPE_ID = LT.id
              LEFT JOIN LEAVE_TRANSACTION_QTY LTQ ON LTD.FK_LEAVE_TYPE_ID = LTQ.FK_LEAVE_TYPE_ID AND LTQ.FK_USER_ID = ${req.params.id}
              WHERE LTD.YEAR = ${moment(new Date()).format('YYYY')}`;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.getLeave = catchAsync(async (req, res, next) => {
  let pool = await new dbQuery().connect();
  var sql = `SELECT LT.*, LTY.LEAVE_NAME FROM LEAVE_TRANSACTION LT 
            JOIN [USER] U ON LT.FK_USER_ID = U.id 
            LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id 
            WHERE U.LINE_USERID = '${req.params.id}' 
            ORDER BY LT.id DESC`;
  var result = await pool.query(sql);
  res.status(200).json({
    status: 'success',
    data: result.recordset,
  });
});

exports.updateLeaveDay = catchAsync(async (req, res, next) => {
  try {
    if (!req.body.year || !req.body.employeeType || !req.body.listData || req.body.listData.length == 0) {
      return next(new AppError("Please fill data", 400));
    }

    let pool = await new dbQuery().connect();
    var sql = '';
    var result = null;

    for await (var item of req.body.listData) {
      sql = ` SELECT id FROM [LEAVE_TYPE_DETAIL] WHERE FK_LEAVE_TYPE_ID = ${item.id} AND YEAR = ${req.body.year} AND FK_EMPLOYEE_TYPE_ID = ${req.body.employeeType}`;
      result = await pool.query(sql);
      if (result.rowsAffected[0] > 0) {
        let updatevalueArr = [
          `[QTY] = '${item.QTY}'`,
        ]
        sql = ` UPDATE [LEAVE_TYPE_DETAIL] SET ${updatevalueArr} WHERE id = '${item.id}' `;
        result = await pool.query(sql);
      }
      else {
        let columnArr = [
          "[FK_LEAVE_TYPE_ID]",
          "[QTY]",
          "[YEAR]",
          "[FK_EMPLOYEE_TYPE_ID]",
        ]

        let valueArr = [
          `'${item.id}'`,
          `'${item.QTY}'`,
          `'${req.body.year}'`,
          `'${req.body.employeeType}'`,
        ]
        sql = `INSERT INTO [LEAVE_TYPE_DETAIL] (${columnArr}) VALUES (${valueArr})`;
        result = await pool.query(sql);
      }
    }
    res.status(200).json({ status: 'updated success' });
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.cancelLeave = catchAsync(async (req, res, next) => {
  try {
    console.log('req.params', req.params);
    if (!req.params.id) {
      return next(new AppError("Please fill data", 400));
    }

    let updatevalueArr = [
      `[IS_ACTIVE] = '0'`,
      `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]

    let pool = await new dbQuery().connect();
    var sql = `UPDATE [LEAVE_TRANSACTION] SET ${updatevalueArr} WHERE id = '${req.params.id}'`;
    var result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {

      sql = ` SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${req.params.id} `;
      result = await pool.query(sql);
      var dataLeaveTransaction = result.recordset[0];
      if (dataLeaveTransaction.LEAVE_TYPE) {
        // sql = `SELECT * FROM [LEAVE_TRANSACTION_QTY] WHERE FK_USER_ID = ${dataLeaveTransaction.FK_USER_ID} AND FK_LEAVE_TYPE_ID = ${dataLeaveTransaction.LEAVE_TYPE} AND YEAR = '${moment(new Date()).format('YYYY')}'`;
        // result = await pool.query(sql);
        // if (result.rowsAffected[0] > 0) {
        //   // console.log('1', moment(dataLeaveTransaction.LEAVE_TO_DATE).format('YYYY-MM-DD'));
        //   // console.log('2', moment(dataLeaveTransaction.LEAVE_END_DATE).format('YYYY-MM-DD'));
        //   // console.log('3', moment(dataLeaveTransaction.TIME_START).format('HH:mm'));
        //   // console.log('4', moment(dataLeaveTransaction.TIME_END).format('HH:mm'));
        //   var now = moment(moment(dataLeaveTransaction.LEAVE_TO_DATE).format('YYYY-MM-DD') + ' ' + moment(dataLeaveTransaction.TIME_START).format('HH:mm'));
        //   var end = moment(moment(dataLeaveTransaction.LEAVE_END_DATE).format('YYYY-MM-DD') + ' ' + moment(dataLeaveTransaction.TIME_END).format('HH:mm'));
        //   var duration = moment.duration(now.diff(end));
        //   var daydecimal = (duration.asDays() * -1).toFixed(2);
        //   var daysplit = daydecimal.split('.');
        //   var day = Number(daysplit[0]);
        //   var timedecimal = ((duration.asHours() * -1)).toFixed(2);
        //   var timesplit = Number(timedecimal);

        //   if (timesplit >= 8) {
        //     day = day + 1;
        //     timesplit = 0;
        //   }
        //   result.recordset[0].HOUR -= Number(timesplit);
        //   result.recordset[0].DAY -= Number(day);

        //   if (result.recordset[0].HOUR >= 8) {
        //     result.recordset[0].DAY -= 1;
        //     result.recordset[0].HOUR = result.recordset[0].HOUR - 8;
        //   }

        //   let updatevalueArr = [
        //     `[HOUR] = '${Number(result.recordset[0].HOUR)}'`,
        //     `[DAY] = '${Number(result.recordset[0].DAY)}'`,
        //   ]

        //   pool = await new dbQuery().connect();
        //   sql = `UPDATE [LEAVE_TRANSACTION_QTY] SET ${updatevalueArr} WHERE id = '${result.recordset[0].id}'`;
        //   result = await pool.query(sql);
        // }
      }
      res.status(200).json({ status: 'updated success' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

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
      for (let e of rows.slice(2)) {
        var body = {};
        var lstLeaveData = [];
        try {
          var intcol = 1;
          body.EMP_CODE = (e[intcol] + ''); intcol++;
          body.AFFILIATION = (e[intcol] + ''); intcol++;
          body.AFFILIATION_SUB = (e[intcol] + ''); intcol++;
          body.TITLE = (e[intcol] + ''); intcol++;
          var fullname = e[intcol] + '';
          body.FULLNAME = (e[intcol] + ''); intcol++;
          body.POSITION = (e[intcol] + ''); intcol++;
          body.PHONE = (e[intcol] + ''); intcol++;
          sql = ` SELECT id FROM [EMPLOYEE_TYPE] WHERE EMPLOYEE_TYPE_NAME = '${(e[intcol] + '')}'`;
          result = await pool.query(sql);
          body.FK_EMPLOYEE_TYPE_ID = result.recordset.length > 0 ? result.recordset[0].id : null; intcol++;
          body.DEPARTMENT = (e[intcol] + ''); intcol++;
          body.FACTION = (e[intcol] + ''); intcol++;
          body.WORK_LOCATION = (e[intcol] + ''); intcol++;
          try {
            if ((e[intcol] + '').indexOf('/') > -1) {
              var startWork = (e[intcol] + '').split('/');
              body.START_WORK = moment(startWork[2] + '-' + startWork[1] + '-' + startWork[0]).format('YYYY-MM-DD'); intcol++;
            }
            else {
              body.START_WORK = ((e[intcol] + '') ? moment(e[intcol] + '').format('YYYY-MM-DD') : null); intcol++;
            }
          }
          catch (err2) {
            body.START_WORK = null;
            intcol++;
          }
          console.log('body.START_WORK', body.START_WORK);
          console.log('body', body);
          var leaveName = 'ลาป่วย';
          var leaveDAY = Number(e[intcol] + ''); intcol++;
          var leaveHOUR = Number(e[intcol] + ''); intcol++;
          lstLeaveData.push({ LEAVE_NAME: leaveName, DAY: leaveDAY, HOUR: leaveHOUR });
          intcol++;
          intcol++;
          leaveName = 'ลากิจ';
          leaveDAY = Number(e[intcol] + ''); intcol++;
          leaveHOUR = Number(e[intcol] + ''); intcol++;
          lstLeaveData.push({ LEAVE_NAME: leaveName, DAY: leaveDAY, HOUR: leaveHOUR });
          intcol++;
          intcol++;
          leaveName = 'ลาหยุดพักผ่อนประจำปี';
          leaveDAY = Number(e[intcol] + ''); intcol++;
          leaveHOUR = Number(e[intcol] + ''); intcol++;
          lstLeaveData.push({ LEAVE_NAME: leaveName, DAY: leaveDAY, HOUR: leaveHOUR });
          intcol++;
          intcol++;
          intcol++;
          leaveName = 'ลาไม่รับค่าจ้าง';
          leaveDAY = Number(e[intcol] + ''); intcol++;
          leaveHOUR = Number(e[intcol] + ''); intcol++;
          lstLeaveData.push({ LEAVE_NAME: leaveName, DAY: leaveDAY, HOUR: leaveHOUR });
          intcol++;
          leaveName = 'ลากิจ(พิเศษ)';
          leaveDAY = (e[intcol] + '').split('.').length > 0 ? Number((e[intcol] + '').split('.')[0]) : Number((e[intcol] + ''));
          leaveHOUR = (e[intcol] + '').split('.').length > 1 ? ((e[intcol] + '').split('.')[1].length > 1 ? (Number((e[intcol] + '').split('.')[1])) / 10 : (Number((e[intcol] + '').split('.')[1]))) : 0;
          lstLeaveData.push({ LEAVE_NAME: leaveName, DAY: leaveDAY, HOUR: leaveHOUR });
          intcol++;
          leaveName = 'ลาเพื่ออุปสมบท';
          leaveDAY = (e[intcol] + '').split('.').length > 0 ? Number((e[intcol] + '').split('.')[0]) : Number((e[intcol] + ''));
          leaveHOUR = (e[intcol] + '').split('.').length > 1 ? ((e[intcol] + '').split('.')[1].length > 1 ? (Number((e[intcol] + '').split('.')[1])) / 10 : (Number((e[intcol] + '').split('.')[1]))) : 0;
          lstLeaveData.push({ LEAVE_NAME: leaveName, DAY: leaveDAY, HOUR: leaveHOUR });
          intcol++;
          leaveName = 'ลาคลอด';
          leaveDAY = (e[intcol] + '').split('.').length > 0 ? Number((e[intcol] + '').split('.')[0]) : Number((e[intcol] + ''));
          leaveHOUR = (e[intcol] + '').split('.').length > 1 ? ((e[intcol] + '').split('.')[1].length > 1 ? (Number((e[intcol] + '').split('.')[1])) / 10 : (Number((e[intcol] + '').split('.')[1]))) : 0;
          lstLeaveData.push({ LEAVE_NAME: leaveName, DAY: leaveDAY, HOUR: leaveHOUR });
          intcol++;
          intcol++;
          var advancedLeaveApprover = e[intcol] + '';

          sql = ` SELECT * FROM [USER] WHERE EMP_CODE = '${body.EMP_CODE}'`;
          // console.log('sql', sql);
          result = await pool.query(sql);
          // console.log('user select result', result);
          var userID = 0;
          if (result.recordset.length > 0) {
            userID = result.recordset[0].id;
            let updatevalueArr = [
              `[EMP_CODE] = '${body.EMP_CODE}'`,
              `[AFFILIATION] = '${body.AFFILIATION}'`,
              `[AFFILIATION_SUB] = '${body.AFFILIATION_SUB}'`,
              `[FULLNAME] = '${body.FULLNAME}'`,
              `[POSITION] = '${body.POSITION}'`,
              `[PHONE] = ${body.PHONE}`,
              `[FK_EMPLOYEE_TYPE_ID] = '${body.FK_EMPLOYEE_TYPE_ID}'`,
              `[DEPARTMENT] = '${body.DEPARTMENT}'`,
              `[FACTION] = '${body.FACTION}'`,
              `[WORK_LOCATION] = '${body.WORK_LOCATION}'`,
              `[START_WORK] = ${body.START_WORK ? "'" + body.START_WORK + "'" : null}`,
              `[TITLE] = '${body.TITLE}'`,
              `[UPDATED_BY] = '999999'`,
              `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
            ]
            sql = `UPDATE [USER] SET ${updatevalueArr} WHERE id = '${userID}'`;
            // console.log('sql', sql);
            result = await pool.query(sql);
            // console.log('user update result', result);
          } else {
            let columnArr = [
              "[EMP_CODE]",
              "[AFFILIATION]",
              "[AFFILIATION_SUB]",
              "[FULLNAME]",
              "[POSITION]",
              "[PHONE]",
              "[FK_EMPLOYEE_TYPE_ID]",
              "[DEPARTMENT]",
              "[FACTION]",
              "[WORK_LOCATION]",
              "[START_WORK]",
              "[TITLE]",
              "[IS_ACTIVE]",
              "[CREATED_BY]",
              "[CREATED_DATE]",
            ]
            let valueArr = [
              `'${body.EMP_CODE}'`,
              `'${body.AFFILIATION}'`,
              `'${body.AFFILIATION_SUB}'`,
              `'${body.FULLNAME}'`,
              `'${body.POSITION}'`,
              `'${body.PHONE}'`,
              `'${body.FK_EMPLOYEE_TYPE_ID}'`,
              `'${body.DEPARTMENT}'`,
              `'${body.FACTION}'`,
              `'${body.WORK_LOCATION}'`,
              `${body.START_WORK ? "'" + body.START_WORK + "'" : null}`,
              `'${body.TITLE}'`,
              `'1'`,
              `'999999'`,
              `'${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
            ]
            sql = `INSERT INTO [USER] (${columnArr}) OUTPUT Inserted.id VALUES (${valueArr})`;
            // console.log('sql', sql);
            result = await pool.query(sql);
            // console.log('insert user result', result);
            userID = result.recordset[0].id;
          }

          if (userID > 0) {
            if (fullname == advancedLeaveApprover) {
              body.ADVANCED_LEAVE_APPROVER = userID;
            }
            else {
              sql = `SELECT * FROM [USER] WHERE FULLNAME = '${advancedLeaveApprover}' AND IS_ACTIVE = 1`;
              result = await pool.query(sql);
              body.ADVANCED_LEAVE_APPROVER = result.recordset.length > 0 ? result.recordset[0].id : null;
            }

            var updatevalue = [
              `[ADVANCED_LEAVE_APPROVER] = ${body.ADVANCED_LEAVE_APPROVER}`,
            ]
            sql = `UPDATE [USER] SET ${updatevalue} WHERE id = '${userID}'`;
            // console.log('sql', sql);
            result = await pool.query(sql);
            // console.log('user update advancedLeaveApprover result', result);

            for await (var dataLeave of lstLeaveData) {
              sql = `SELECT id FROM [LEAVE_TYPE] WHERE LEAVE_NAME = '${dataLeave.LEAVE_NAME}'`;
              // console.log('sql', sql);
              result = await pool.query(sql);
              // console.log('leavetype select result', result);
              var data = {
                FK_USER_ID: userID,
                FK_LEAVE_TYPE_ID: result.recordset[0].id,
                YEAR: moment(new Date()).format('YYYY'),
                HOUR: dataLeave.HOUR,
                DAY: dataLeave.DAY,
              };

              sql = `SELECT id FROM [LEAVE_TRANSACTION_QTY] WHERE FK_USER_ID = '${data.FK_USER_ID}' AND FK_LEAVE_TYPE_ID = '${data.FK_LEAVE_TYPE_ID}' AND YEAR = '${moment(new Date()).format('YYYY')}'`;
              // console.log('sql', sql);
              result = await pool.query(sql);
              // console.log('leavetypeqty select result', result);
              if (result.recordset.length > 0) {
                var updateLeaveTransactionQty = [
                  `[YEAR] = '${data.YEAR}'`,
                  `[HOUR] = '${data.HOUR}'`,
                  `[DAY] = '${data.DAY}'`,
                ]
                sql = `UPDATE [LEAVE_TRANSACTION_QTY] SET ${updateLeaveTransactionQty} WHERE id = '${result.recordset[0].id}'`;
                // console.log('sql', sql);
                result = await pool.query(sql);
                // console.log('update LeaveTransactionQty result', result);
              } else {
                let columnArrLeaveTransactionQty = [
                  "[FK_USER_ID]",
                  "[FK_LEAVE_TYPE_ID]",
                  "[YEAR]",
                  "[HOUR]",
                  "[DAY]",
                ]
                let valueArrLeaveTransactionQty = [
                  `'${data.FK_USER_ID}'`,
                  `'${data.FK_LEAVE_TYPE_ID}'`,
                  `'${data.YEAR}'`,
                  `'${data.HOUR}'`,
                  `'${data.DAY}'`,
                ]
                sql = `INSERT INTO [LEAVE_TRANSACTION_QTY] (${columnArrLeaveTransactionQty}) OUTPUT Inserted.id VALUES (${valueArrLeaveTransactionQty})`;
                // console.log('sql', sql);
                result = await pool.query(sql);
                // console.log('insert leavetransactionqty result', result);
              }
            }
            results.push(null);
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

exports.exportPDFLeaveOffsiteWork = catchAsync(async (req, res, next) => {
  const body = req.query;
  const {
    leaveTransactionID,
    type,
  } = body;

  if (!leaveTransactionID) {
    return next(new AppError("Not found data", 400));
  }

  let pool = await new dbQuery().connect();
  var sql = `SELECT 
              LT.*
              ,LTY.LEAVE_NAME 
              ,U.id AS UID
              ,U.LINE_USERID
              ,U.EMP_CODE
              ,ET.EMPLOYEE_TYPE_NAME
              ,U.FULLNAME
              ,U.PHONE
              ,U.POSITION
              ,U.DEPARTMENT
              ,U.FACTION
              ,U.WORK_LOCATION
              ,U.START_WORK
              ,U.ADVANCED_LEAVE_APPROVER
              ,U.IS_RETIRE as USER_IS_RETIRE
              ,U.LAST_WORK
              ,U.EMAIL
              ,UHEAD.FULLNAME as UHEADFULLNAME
            FROM LEAVE_TRANSACTION LT
            JOIN [USER] U ON LT.FK_USER_ID = U.id 
            LEFT JOIN [USER] UHEAD ON U.ADVANCED_LEAVE_APPROVER = UHEAD.id 
            LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id 
            LEFT JOIN [EMPLOYEE_TYPE] ET ON U.FK_EMPLOYEE_TYPE_ID = ET.id 
            WHERE LT.id = '${leaveTransactionID}'`;
  var result = await pool.query(sql);
  if (result.recordset.length > 0) {
    var data = result.recordset[0];
    var size = [595, 841];
    const doc = new PDFGenerator({
      size: size,
    });
    doc.fillColor('black')
    doc.font("img/template/angsa.ttf");
    doc.fontSize(16);
    // var newVAr = "img/template/ใบลาหยุดงาน.jpg";
    var newVAr = "img/template/ใบอนุญาตออกนอกสถานที่.jpg";
    doc.image(newVAr, 0, 0, {
      fit: [595, 841]
    })
    // #1
    doc.text(data.FULLNAME ? data.FULLNAME.split(' ')[0] : '', 86, 201, {
      width: 95,
      lineBreak: false,
      align: 'center',
    })
    doc.text(data.FULLNAME ? data.FULLNAME.split(' ')[1] ?? '' : '', 200, 201, {
      width: 86,
      lineBreak: false,
      align: 'center',
    })
    doc.text(data.EMP_CODE, 345, 201, {
      width: 170,
      lineBreak: false,
      align: 'center',
    })
    // #2
    doc.text(data.POSITION, 110, 223, {
      width: 175,
      lineBreak: false,
      align: 'center',
    })
    doc.text(data.DEPARTMENT, 340, 223, {
      width: 175,
      lineBreak: false,
      align: 'center',
    })
    // #3
    doc.text(data.FACTION, 100, 246, {
      width: 390,
      lineBreak: true,
      align: 'center',
    })
    // #4
    doc.text(data.CHANGE_WORK_LOCATION == 'อื่นๆ' ? data.OTHER_WORK_LOCATION : data.CHANGE_WORK_LOCATION, 70, 314, {
      width: 450,
      lineGap: 4,
      lineBreak: true,
      align: 'left',
    })

    // #5
    doc.text(data.LEAVE_TO_DATE ? moment(data.LEAVE_TO_DATE).format('DD/MM/YYYY') : '', 105, 359, {
      width: 120,
      lineBreak: true,
      align: 'center',
    })
    doc.text(data.TIME_START ? moment(data.TIME_START).utc().format('HH.mm') : '', 270, 359, {
      width: 90,
      lineBreak: true,
      align: 'center',
    })
    doc.text(data.TIME_END ? moment(data.TIME_END).utc().format('HH.mm') : '', 390, 359, {
      width: 115,
      lineBreak: true,
      align: 'center',
    })

    // #6
    doc.text(data.CAR, 135, 382, {
      width: 220,
      lineBreak: true,
      align: 'center',
    })
    doc.text(data.LICENSE_PLATE, 395, 382, {
      width: 115,
      lineBreak: true,
      align: 'center',
    })

    // #7
    doc.text('', 70, 450, {
      // width: 95,
      indent: 115,
      lineGap: 4,
      lineBreak: true,
      align: 'left',
    })

    // #8
    doc.text(data.FULLNAME, 133, 563, {
      width: 100,
      lineBreak: true,
      align: 'center',
    })
    doc.text(data.UHEADFULLNAME, 350, 563, {
      width: 100,
      lineBreak: true,
      align: 'center',
    })

    // #8
    doc.text(moment(new Date()).format('DD/MM/YYYY'), 133, 593, {
      width: 100,
      lineBreak: true,
      align: 'center',
    })
    doc.text(moment(new Date()).format('DD/MM/YYYY'), 350, 593, {
      width: 100,
      lineBreak: true,
      align: 'center',
    })
    var stream = null;
    if (type == "file") {
      doc.pipe(res)
    }
    else {
      var stream = doc.pipe(new Base64Encode());
    }
    var finalString = ''; // contains the base64 string

    doc.end()

    if (type == "file") {
      return res;
    }
    else {
      stream.on('data', function (chunk) {
        finalString += chunk;
      });

      stream.on('end', function () {
        // the stream is at its end, so push the resulting base64 string to the response
        res.json({
          status: "OK",
          data: finalString
        });
      });
    }
  }
  else {
    return next(new AppError("Not found data", 400));
  }
});

exports.exportPDFLeave = catchAsync(async (req, res, next) => {
  const body = req.query;
  const {
    leaveTransactionID,
    type,
  } = body;

  if (!leaveTransactionID) {
    return next(new AppError("Not found data", 400));
  }

  let pool = await new dbQuery().connect();
  var sql = `SELECT 
              LT.*
              ,LTY.LEAVE_NAME 
              ,U.id AS UID
              ,U.LINE_USERID
              ,U.EMP_CODE
              ,ET.EMPLOYEE_TYPE_NAME
              ,U.FULLNAME
              ,U.PHONE
              ,U.POSITION
              ,U.DEPARTMENT
              ,U.FACTION
              ,U.WORK_LOCATION
              ,U.START_WORK
              ,U.ADVANCED_LEAVE_APPROVER
              ,U.IS_RETIRE as USER_IS_RETIRE
              ,U.LAST_WORK
              ,U.EMAIL
              ,UHEAD.FULLNAME as UHEADFULLNAME
            FROM LEAVE_TRANSACTION LT
            JOIN [USER] U ON LT.FK_USER_ID = U.id 
            LEFT JOIN [USER] UHEAD ON U.ADVANCED_LEAVE_APPROVER = UHEAD.id 
            LEFT JOIN [LEAVE_TYPE] LTY ON LT.LEAVE_TYPE = LTY.id 
            LEFT JOIN [EMPLOYEE_TYPE] ET ON U.FK_EMPLOYEE_TYPE_ID = ET.id 
            WHERE LT.id = '${leaveTransactionID}'`;
  var result = await pool.query(sql);
  if (result.recordset.length > 0) {
    var data = result.recordset[0];
    var size = [595, 841];
    const doc = new PDFGenerator({
      size: size,
    });
    doc.fillColor('black')
    doc.font("img/template/angsa.ttf");
    doc.fontSize(16);
    var newVAr = "img/template/ใบลาหยุดงาน.jpg";
    // var newVAr = "img/template/ใบอนุญาตออกนอกสถานที่.jpg";
    doc.image(newVAr, 0, 0, {
      fit: [595, 841]
    })

    // #1
    doc.text(moment(new Date()).format('DD/MM/YYYY'), 380, 193, {
      width: 120,
      lineBreak: false,
      align: 'center',
    })

    // #2
    doc.text(data.UHEADFULLNAME, 130, 220, {
      width: 180,
      lineBreak: false,
      align: 'center',
    })

    // #3
    doc.text(data.FULLNAME, 135, 248, {
      width: 150,
      lineBreak: true,
      align: 'center',
    })
    doc.text(data.EMP_CODE, 350, 248, {
      width: 150,
      lineBreak: true,
      align: 'center',
    })

    // #4
    doc.text(data.POSITION, 140, 277, {
      // width: 95,
      width: 140,
      lineBreak: true,
      align: 'center',
    })
    doc.text(data.DEPARTMENT, 340, 277, {
      width: 150,
      lineBreak: true,
      align: 'center',
    })

    // #5
    doc.text(data.FACTION, 125, 306, {
      // width: 95,
      width: 165,
      lineBreak: true,
      align: 'center',
    })
    doc.text(data.WORK_LOCATION, 360, 306, {
      width: 135,
      lineBreak: true,
      align: 'center',
    })

    // #6
    doc.text(data.LEAVE_NAME, 165, 387, {
      width: 325,
      lineBreak: true,
      align: 'center',
    })

    // #7
    doc.text(data.LEAVE_REASON, 170, 415, {
      width: 320,
      lineGap: 2,
      lineBreak: true,
      align: 'left',
    })

    // #8
    doc.text(data.LEAVE_TO_DATE ? moment(data.LEAVE_TO_DATE).format('DD/MM/YYYY') : '', 155, 475, {
      width: 150,
      lineBreak: true,
      align: 'center',
    })
    doc.text(data.TIME_START ? moment(data.TIME_START).utc().format('HH.mm') : '', 330, 475, {
      width: 150,
      lineBreak: true,
      align: 'center',
    })

    // #9
    doc.text(data.LEAVE_END_DATE ? moment(data.LEAVE_END_DATE).format('DD/MM/YYYY') : '', 155, 505, {
      width: 150,
      lineBreak: true,
      align: 'center',
    })
    doc.text(data.TIME_END ? moment(data.TIME_END).utc().format('HH.mm') : '', 330, 505, {
      width: 150,
      lineBreak: true,
      align: 'center',
    })

    var useDay = 0;
    var useHour = 0;
    var now = moment(moment(data.LEAVE_TO_DATE).format('YYYY-MM-DD') + ' ' + moment(data.TIME_START).utc().format('HH:mm'));
    var end = moment(moment(data.LEAVE_END_DATE).format('YYYY-MM-DD') + ' ' + moment(data.TIME_END).utc().format('HH:mm'));
    var duration = moment.duration(end.diff(now));
    var gethours = duration.asHours();
    var day = 0;
    var timesplit = 0;
    if (gethours >= 24) {
      day = Number(((gethours / 24) + '').split('.')[0]);
      // console.log('day', day);
      timesplit = (gethours - (24 * day));
      // console.log('timesplit', timesplit);
      day = timesplit >= 8 ? Number(day) + 1 : day;
      // console.log('day2', day);
      timesplit = timesplit >= 8 ? 0 : timesplit;
      // console.log('timesplit2', timesplit);
    }
    else if (gethours >= 8) {
      day = 1;
      timesplit = 0;
    }
    else {
      timesplit = gethours;
    }
    useDay = day;
    useHour = timesplit;

    // #10
    doc.text(useDay, 155, 534, {
      width: 50,
      lineBreak: true,
      align: 'center',
    })
    doc.text(useHour, 220, 534, {
      width: 80,
      lineBreak: true,
      align: 'center',
    })

    // #11
    doc.text(data.FULLNAME, 130, 586, {
      width: 95,
      lineBreak: true,
      align: 'center',
    })
    doc.text(data.UHEADFULLNAME, 345, 586, {
      width: 95,
      lineBreak: true,
      align: 'center',
    })

    // #12
    doc.text(moment(new Date()).format('DD/MM/YYYY'), 130, 614, {
      width: 95,
      lineBreak: true,
      align: 'center',
    })
    doc.text(moment(new Date()).format('DD/MM/YYYY'), 345, 614, {
      width: 95,
      lineBreak: true,
      align: 'center',
    })

    var stream = null;
    if (type == "file") {
      doc.pipe(res)
    }
    else {
      var stream = doc.pipe(new Base64Encode());
    }
    var finalString = ''; // contains the base64 string

    doc.end()

    if (type == "file") {
      return res;
    }
    else {
      stream.on('data', function (chunk) {
        finalString += chunk;
      });

      stream.on('end', function () {
        // the stream is at its end, so push the resulting base64 string to the response
        res.json({
          status: "OK",
          data: finalString
        });
      });
    }
  }
  else {
    return next(new AppError("Not found data", 400));
  }
});

exports.createLeave = catchAsync(async (req, res, next) => {
  console.log('req.rateLimit', req.rateLimit);
  var body = JSON.parse(req.body.data);
  if (!body.FK_USER_ID || !body.LEAVE_TYPE || !body.LEAVE_REASON || !body.LEAVE_TO_DATE || !body.TIME_START || !body.LEAVE_END_DATE || !body.TIME_END) {
    return next(new AppError("Please fill data", 400));
  }

  var useDay = 0;
  var useHour = 0;
  var now = moment(moment(body.LEAVE_TO_DATE).format('YYYY-MM-DD') + ' ' + body.TIME_START);
  var end = moment(moment(body.LEAVE_END_DATE).format('YYYY-MM-DD') + ' ' + body.TIME_END);
  var duration = moment.duration(end.diff(now));
  var gethours = duration.asHours();
  var day = 0;
  var timesplit = 0;
  console.log('gethours', gethours);
  if (gethours >= 24) {
    day = Number(((gethours / 24) + '').split('.')[0]);
    console.log('day', day);
    timesplit = (gethours - (24 * day));
    console.log('timesplit', timesplit);
    day = timesplit >= 8 ? Number(day) + 1 : day;
    console.log('day2', day);
    timesplit = timesplit >= 8 ? 0 : timesplit;
    console.log('timesplit2', timesplit);
  }
  else if (gethours >= 8) {
    day = 1;
    timesplit = 0;
  }
  else {
    timesplit = gethours;
  }
  useDay = day;
  useHour = timesplit;
  // console.log('useDay', useDay);
  // console.log('useHour', useHour);

  res.status(201).json({
    status: 'insert data success',
  });
  let pool = await new dbQuery().connect();
  var sql = '';

  var leaveCode = '';
  sql = `SELECT TOP 1 * FROM [RUNNING_NUMBER] WHERE TYPE = 'LF' AND DATE = ${moment(new Date()).format('DD')} AND MONTH = ${moment(new Date()).format('MM')} AND YEAR = '${moment(new Date()).format('YYYY')}' ORDER BY id DESC`;
  result = await pool.query(sql);
  if (result.rowsAffected[0] > 0) {
    result.recordset[0].NUMBER += 1;
    leaveCode = 'LF' + result.recordset[0].DATE + result.recordset[0].MONTH + result.recordset[0].YEAR + ("00" + result.recordset[0].NUMBER).slice(-3)

    sql = `INSERT INTO [RUNNING_NUMBER] (TYPE,DATE,MONTH,YEAR,NUMBER) OUTPUT Inserted.id VALUES ('LF', '${moment(new Date()).format('DD')}', '${moment(new Date()).format('MM')}', '${moment(new Date()).format('YYYY')}', '${result.recordset[0].NUMBER}')`;
    result = await pool.query(sql);
  }
  else {
    sql = `INSERT INTO [RUNNING_NUMBER] (TYPE,DATE,MONTH,YEAR,NUMBER) OUTPUT Inserted.id VALUES ('LF', '${moment(new Date()).format('DD')}', '${moment(new Date()).format('MM')}', '${moment(new Date()).format('YYYY')}', '1')`;
    result = await pool.query(sql);
    leaveCode = 'LF' + moment(new Date()).format('DD') + moment(new Date()).format('MM') + moment(new Date()).format('YYYY') + "001";
  }

  let columnArr = [
    "[FK_USER_ID]",
    "[LEAVE_TYPE]",
    "[LEAVE_REASON]",
    "[LEAVE_TO_DATE]",
    "[TIME_START]",
    "[LEAVE_END_DATE]",
    "[TIME_END]",
    "[FILE_URL]",
    "[STATUS]",
    "[IS_ACTIVE]",
    "[CREATED_BY]",
    "[CREATED_DATE]",
    "[LEAVE_CODE]",
  ]

  let valueArr = [
    `'${body.FK_USER_ID}'`,
    `'${body.LEAVE_TYPE}'`,
    `'${body.LEAVE_REASON}'`,
    `'${body.LEAVE_TO_DATE}'`,
    `'${body.TIME_START}'`,
    `'${body.LEAVE_END_DATE}'`,
    `'${body.TIME_END}'`,
    `${req.files.leave ? `'` + req.files.leave[0].path + `'` : null}`,
    `'1'`,
    `'1'`,
    `'${body.FK_USER_ID}'`,
    `'${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    `'${leaveCode}'`,
  ]

  sql = `SELECT * FROM [USER] WHERE id = ${body.FK_USER_ID} AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
  var result = await pool.query(sql);
  var dataUser = result.recordset[0];

  if (body.LEAVE_TYPE) {
    // sql = `SELECT * FROM [LEAVE_TYPE_DETAIL] WHERE FK_EMPLOYEE_TYPE_ID = ${dataUser.FK_EMPLOYEE_TYPE_ID} AND FK_LEAVE_TYPE_ID = ${body.LEAVE_TYPE} AND YEAR = '${moment(new Date()).format('YYYY')}'`;
    // result = await pool.query(sql);
    // var dataLeaveTypeDetail = result.recordset[0];
    // sql = `SELECT * FROM [LEAVE_TRANSACTION_QTY] WHERE FK_USER_ID = ${body.FK_USER_ID} AND FK_LEAVE_TYPE_ID = ${body.LEAVE_TYPE} AND YEAR = '${moment(new Date()).format('YYYY')}'`;
    // result = await pool.query(sql);
    // if (result.rowsAffected[0] > 0) {
    //   result.recordset[0].HOUR += Number(timesplit);
    //   result.recordset[0].DAY += Number(day);

    //   if (result.recordset[0].HOUR >= 8) {
    //     result.recordset[0].DAY += 1;
    //     result.recordset[0].HOUR = result.recordset[0].HOUR - 8;
    //   }

    //   // console.log('dataLeaveTypeDetail.QTY', dataLeaveTypeDetail.QTY);
    //   // console.log('result.recordset[0].DAY', result.recordset[0].DAY);
    //   // console.log('result.recordset[0].HOUR', result.recordset[0].HOUR);
    //   // console.log('result.recordset[0].HOUR 2', result.recordset[0].HOUR / 10);
    //   // console.log('result.recordset[0].HOUR 3', (result.recordset[0].DAY + (result.recordset[0].HOUR / 10)));
    //   if (dataLeaveTypeDetail.QTY < (result.recordset[0].DAY + (result.recordset[0].HOUR / 10))) {
    //     // if (dataLeaveTypeDetail.QTY < result.recordset[0].DAY + result.recordset[0].HOUR) {
    //     return next(new AppError("Leave day not enough", 400));
    //   }

    //   let updatevalueArr = [
    //     `[HOUR] = '${Number(result.recordset[0].HOUR)}'`,
    //     `[DAY] = '${Number(result.recordset[0].DAY)}'`,
    //   ]

    //   pool = await new dbQuery().connect();
    //   sql = `UPDATE [LEAVE_TRANSACTION_QTY] SET ${updatevalueArr} WHERE id = '${result.recordset[0].id}'`;
    //   result = await pool.query(sql);
    // }
    // else {
    //   if (dataLeaveTypeDetail.QTY < day) {
    //     return next(new AppError("Leave day not enough", 400));
    //   }

    //   let columnQTYArr = [
    //     "[FK_USER_ID]",
    //     "[FK_LEAVE_TYPE_ID]",
    //     "[YEAR]",
    //     "[HOUR]",
    //     "[DAY]"
    //   ]

    //   let valueQTYArr = [
    //     `'${body.FK_USER_ID}'`,
    //     `'${body.LEAVE_TYPE}'`,
    //     `'${moment(new Date()).format('YYYY')}'`,
    //     `'${timesplit}'`,
    //     `'${day}'`,
    //   ]

    //   pool = await new dbQuery().connect();
    //   sql = `INSERT INTO [LEAVE_TRANSACTION_QTY] (${columnQTYArr}) OUTPUT Inserted.id VALUES (${valueQTYArr})`;
    //   result = await pool.query(sql);
    // }
  }

  sql = `INSERT INTO [LEAVE_TRANSACTION] (${columnArr}) OUTPUT Inserted.id VALUES (${valueArr})`;
  result = await pool.query(sql);
  if (result.rowsAffected[0] > 0) {
    var leaveTransactionID = result.recordset[0].id;

    sql = `SELECT * FROM [USER] WHERE id = ${body.ADVANCED_LEAVE_APPROVER} AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {
      var dataApprover = result.recordset[0];
      await sendToApprover(leaveTransactionID, body, dataApprover, useDay, useHour);
      res.status(201).json({
        status: 'insert data success',
      });
    }
    else {
      sql = `DELETE [LEAVE_TRANSACTION] WHERE id = ${leaveTransactionID}`;
      result = await pool.query(sql);
      return next(new AppError("ERROR: Not found data approver.", 400));
    }
  }
});

exports.createRetire = catchAsync(async (req, res, next) => {
  var body = JSON.parse(req.body.data);
  if (!body.FK_USER_ID || !body.LEAVE_TO_DATE || !body.LEAVE_END_DATE) {
    return next(new AppError("Please fill data", 400));
  }

  let pool = await new dbQuery().connect();
  var sql = '';
  var leaveCode = '';
  sql = `SELECT TOP 1 * FROM [RUNNING_NUMBER] WHERE TYPE = 'RF' AND DATE = ${moment(new Date()).format('DD')} AND MONTH = ${moment(new Date()).format('MM')} AND YEAR = '${moment(new Date()).format('YYYY')}' ORDER BY id DESC`;
  result = await pool.query(sql);
  if (result.rowsAffected[0] > 0) {
    result.recordset[0].NUMBER += 1;
    leaveCode = 'RF' + result.recordset[0].DATE + result.recordset[0].MONTH + result.recordset[0].YEAR + ("00" + result.recordset[0].NUMBER).slice(-3)

    sql = `INSERT INTO [RUNNING_NUMBER] (TYPE,DATE,MONTH,YEAR,NUMBER) OUTPUT Inserted.id VALUES ('RF', '${moment(new Date()).format('DD')}', '${moment(new Date()).format('MM')}', '${moment(new Date()).format('YYYY')}', '${result.recordset[0].NUMBER}')`;
    result = await pool.query(sql);
  }
  else {
    sql = `INSERT INTO [RUNNING_NUMBER] (TYPE,DATE,MONTH,YEAR,NUMBER) OUTPUT Inserted.id VALUES ('RF', '${moment(new Date()).format('DD')}', '${moment(new Date()).format('MM')}', '${moment(new Date()).format('YYYY')}', '1')`;
    result = await pool.query(sql);
    leaveCode = 'RF' + moment(new Date()).format('DD') + moment(new Date()).format('MM') + moment(new Date()).format('YYYY') + "001";
  }


  let columnArr = [
    "[FK_USER_ID]",
    "[LEAVE_REASON]",
    "[LEAVE_TO_DATE]",
    "[LEAVE_END_DATE]",
    "[FUND_TYPE]",
    "[FUND_NUMBER]",
    "[FLAG_CERTIFICATE]",
    "[STATUS]",
    "[IS_ACTIVE]",
    "[IS_RETIRE]",
    "[CREATED_BY]",
    "[CREATED_DATE]",
    "[LEAVE_CODE]",
  ]

  let valueArr = [
    `'${body.FK_USER_ID}'`,
    `'${body.LEAVE_REASON}'`,
    `'${body.LEAVE_TO_DATE}'`,
    `'${body.LEAVE_END_DATE}'`,
    `'${body.FUND_TYPE}'`,
    `'${body.FUND_NUMBER}'`,
    `'${body.FLAG_CERTIFICATE}'`,
    `'1'`,
    `'1'`,
    `'1'`,
    `'${body.FK_USER_ID}'`,
    `'${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    `'${leaveCode}'`,
  ]

  sql = `INSERT INTO [LEAVE_TRANSACTION] (${columnArr}) OUTPUT Inserted.id VALUES (${valueArr})`;
  var result = await pool.query(sql);
  if (result.rowsAffected[0] > 0) {
    var leaveTransactionID = result.recordset[0].id;
    sql = `SELECT * FROM [USER] WHERE id = ${body.ADVANCED_LEAVE_APPROVER} AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    result = await pool.query(sql);
    var dataApprover = result.recordset[0];
    if (result.rowsAffected[0] > 0) {
      await sendToApproverRetire(leaveTransactionID, body, dataApprover);
      res.status(201).json({
        status: 'insert data success',
      });
    }
  }
});

exports.createLeaveWorkOutSide = catchAsync(async (req, res, next) => {
  var body = JSON.parse(req.body.data);
  if (typeof req.files.leave === 'undefined' || !body.FK_USER_ID) {
    return next(new AppError("Please fill data", 400));
  }

  let pool = await new dbQuery().connect();
  var sql = '';
  var leaveCode = '';
  sql = `SELECT TOP 1 * FROM [RUNNING_NUMBER] WHERE TYPE = 'LC' AND DATE = ${moment(new Date()).format('DD')} AND MONTH = ${moment(new Date()).format('MM')} AND YEAR = '${moment(new Date()).format('YYYY')}' ORDER BY id DESC`;
  result = await pool.query(sql);
  if (result.rowsAffected[0] > 0) {
    result.recordset[0].NUMBER += 1;
    leaveCode = 'LC' + result.recordset[0].DATE + result.recordset[0].MONTH + result.recordset[0].YEAR + ("00" + result.recordset[0].NUMBER).slice(-3)

    sql = `INSERT INTO [RUNNING_NUMBER] (TYPE,DATE,MONTH,YEAR,NUMBER) OUTPUT Inserted.id VALUES ('LC', '${moment(new Date()).format('DD')}', '${moment(new Date()).format('MM')}', '${moment(new Date()).format('YYYY')}', '${result.recordset[0].NUMBER}')`;
    result = await pool.query(sql);
  }
  else {
    sql = `INSERT INTO [RUNNING_NUMBER] (TYPE,DATE,MONTH,YEAR,NUMBER) OUTPUT Inserted.id VALUES ('LC', '${moment(new Date()).format('DD')}', '${moment(new Date()).format('MM')}', '${moment(new Date()).format('YYYY')}', '1')`;
    result = await pool.query(sql);
    leaveCode = 'LC' + moment(new Date()).format('DD') + moment(new Date()).format('MM') + moment(new Date()).format('YYYY') + "001";
  }

  let columnArr = [
    "[FK_USER_ID]",
    "[LEAVE_TO_DATE]",
    "[TIME_START]",
    "[TIME_END]",
    "[CHANGE_WORK_LOCATION]",
    "[CAR]",
    "[LICENSE_PLATE]",
    "[OTHER_WORK_LOCATION]",
    "[IS_WORK_OUTSIDE]",
    "[FILE_URL]",
    "[STATUS]",
    "[IS_ACTIVE]",
    "[CREATED_BY]",
    "[CREATED_DATE]",
    "[LEAVE_CODE]",
  ]

  let valueArr = [
    `'${body.FK_USER_ID}'`,
    `'${body.LEAVE_TO_DATE}'`,
    `'${body.TIME_START}'`,
    `'${body.TIME_END}'`,
    `'${body.CHANGE_WORK_LOCATION}'`,
    `'${body.CAR}'`,
    `'${body.LICENSE_PLATE}'`,
    `'${body.OTHER_WORK_LOCATION}'`,
    `'1'`,
    `'${req.files.leave[0].path}'`,
    `'1'`,
    `'1'`,
    `'${body.FK_USER_ID}'`,
    `'${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    `'${leaveCode}'`,
  ]

  sql = `INSERT INTO [LEAVE_TRANSACTION] (${columnArr}) OUTPUT Inserted.id VALUES (${valueArr})`;
  var result = await pool.query(sql);
  if (result.rowsAffected[0] > 0) {
    var leaveTransactionID = result.recordset[0].id;
    sql = `SELECT * FROM [USER] WHERE id = ${body.ADVANCED_LEAVE_APPROVER} AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    result = await pool.query(sql);
    var dataApprover = result.recordset[0];
    if (result.rowsAffected[0] > 0) {
      await sendToApproverLeaveWorkOutSide(leaveTransactionID, body, dataApprover);
      res.status(201).json({
        status: 'insert data success',
      });
    }
    else {
      return next(new AppError("Not found data user approver", 400));
    }
  }
  else {
    return next(new AppError("ERROR Create `LEAVE_TRANSACTION`", 400));
  }
});

exports.reject = catchAsync(async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new AppError("Please fill data", 400));
    }

    let pool = await new dbQuery().connect();
    var sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${req.params.id}`;
    var result = await pool.query(sql);
    var dataLeaveTransaction = result.recordset[0];

    var sql = `SELECT * FROM [USER] WHERE id = '${dataLeaveTransaction.FK_USER_ID}' AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    var result = await pool.query(sql);
    var dataUser = result.recordset[0];

    sql = `SELECT * FROM [USER] WHERE id = '${dataUser.ADVANCED_LEAVE_APPROVER}' AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    result = await pool.query(sql);
    var dataApprover = result.recordset[0];

    let updatevalueArr = [
      `[STATUS] = '3'`,
      `[PRIMARY_APPROVE] = '0'`,
      `[PRIMARY_APPROVE_DESCRIPTION] = ${req.params.reason ? "'" + req.params.reason + "'" : '-'}`,
      `[PRIMARY_APPROVED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
      // `[UPDATED_BY] = '${req.user.id}'`,
      `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]

    var sql = `UPDATE [LEAVE_TRANSACTION] SET ${updatevalueArr} WHERE id = '${req.params.id}'`;
    var result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {
      sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${req.params.id}`;
      result = await pool.query(sql);
      dataLeaveTransaction = result.recordset[0];
      await sendRejectToEmployee(dataUser, dataApprover, dataLeaveTransaction)
      res.status(200).json({ status: 'updated success' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.approve = catchAsync(async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new AppError("Please fill data", 400));
    }

    let pool = await new dbQuery().connect();
    var sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${req.params.id}`;
    var result = await pool.query(sql);
    var dataLeaveTransaction = result.recordset[0];

    var sql = `SELECT * FROM [USER] WHERE id = '${dataLeaveTransaction.FK_USER_ID}' AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    var result = await pool.query(sql);
    var dataUser = result.recordset[0];

    sql = `SELECT * FROM [USER] WHERE id = '${dataUser.ADVANCED_LEAVE_APPROVER}' AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    result = await pool.query(sql);
    var dataApprover = result.recordset[0];

    if (dataLeaveTransaction.LEAVE_TYPE) {
      var body = dataLeaveTransaction;
      var useDay = 0;
      var useHour = 0;
      var now = moment(moment(body.LEAVE_TO_DATE).format('YYYY-MM-DD') + ' ' + moment(body.TIME_START).utc().format('HH:mm'));
      var end = moment(moment(body.LEAVE_END_DATE).format('YYYY-MM-DD') + ' ' + moment(body.TIME_END).utc().format('HH:mm'));
      var duration = moment.duration(end.diff(now));
      var gethours = duration.asHours();
      var day = 0;
      var timesplit = 0;
      // console.log('gethours',gethours);
      if (gethours >= 24) {
        day = Number(((gethours / 24) + '').split('.')[0]);
        // console.log('day', day);
        timesplit = (gethours - (24 * day));
        // console.log('timesplit', timesplit);
        day = timesplit >= 8 ? Number(day) + 1 : day;
        // console.log('day2', day);
        timesplit = timesplit >= 8 ? 0 : timesplit;
        // console.log('timesplit2', timesplit);
      }
      else if (gethours >= 8) {
        day = 1;
        timesplit = 0;
      }
      else {
        timesplit = gethours;
      }
      useDay = day;
      useHour = timesplit;
      // console.log('useDay', useDay);
      // console.log('useHour', useHour);

      sql = `SELECT * FROM [LEAVE_TYPE_DETAIL] WHERE FK_EMPLOYEE_TYPE_ID = ${dataUser.FK_EMPLOYEE_TYPE_ID} AND FK_LEAVE_TYPE_ID = ${body.LEAVE_TYPE} AND YEAR = '${moment(new Date()).format('YYYY')}'`;
      result = await pool.query(sql);
      var dataLeaveTypeDetail = result.recordset[0];
      sql = `SELECT * FROM [LEAVE_TRANSACTION_QTY] WHERE FK_USER_ID = ${body.FK_USER_ID} AND FK_LEAVE_TYPE_ID = ${body.LEAVE_TYPE} AND YEAR = '${moment(new Date()).format('YYYY')}'`;
      result = await pool.query(sql);
      if (result.rowsAffected[0] > 0) {
        result.recordset[0].HOUR += Number(timesplit);
        result.recordset[0].DAY += Number(day);

        if (result.recordset[0].HOUR >= 8) {
          result.recordset[0].DAY += 1;
          result.recordset[0].HOUR = result.recordset[0].HOUR - 8;
        }
        // console.log('dataLeaveTypeDetail.QTY', dataLeaveTypeDetail.QTY);
        // console.log('result.recordset[0].DAY', result.recordset[0].DAY);
        // console.log('result.recordset[0].HOUR', result.recordset[0].HOUR);
        // console.log('result.recordset[0].HOUR 2', result.recordset[0].HOUR / 10);
        // console.log('result.recordset[0].HOUR 3', (result.recordset[0].DAY + (result.recordset[0].HOUR / 10)));
        if (dataLeaveTypeDetail.QTY < (result.recordset[0].DAY + (result.recordset[0].HOUR / 10))) {
          // if (dataLeaveTypeDetail.QTY < result.recordset[0].DAY + result.recordset[0].HOUR) {
          return next(new AppError("Leave day not enough", 400));
        }

        let updatevalueArr = [
          `[HOUR] = '${Number(result.recordset[0].HOUR)}'`,
          `[DAY] = '${Number(result.recordset[0].DAY)}'`,
        ]

        pool = await new dbQuery().connect();
        sql = `UPDATE [LEAVE_TRANSACTION_QTY] SET ${updatevalueArr} WHERE id = '${result.recordset[0].id}'`;
        result = await pool.query(sql);
      }
      else {
        if (dataLeaveTypeDetail.QTY < day) {
          return next(new AppError("Leave day not enough", 400));
        }

        let columnQTYArr = [
          "[FK_USER_ID]",
          "[FK_LEAVE_TYPE_ID]",
          "[YEAR]",
          "[HOUR]",
          "[DAY]"
        ]

        let valueQTYArr = [
          `'${body.FK_USER_ID}'`,
          `'${body.LEAVE_TYPE}'`,
          `'${moment(new Date()).format('YYYY')}'`,
          `'${timesplit}'`,
          `'${day}'`,
        ]

        pool = await new dbQuery().connect();
        sql = `INSERT INTO [LEAVE_TRANSACTION_QTY] (${columnQTYArr}) OUTPUT Inserted.id VALUES (${valueQTYArr})`;
        result = await pool.query(sql);
      }
    }

    let updatevalueArr = [
      `[STATUS] = '2'`,
      `[PRIMARY_APPROVE] = '1'`,
      `[PRIMARY_APPROVED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
      // `[UPDATED_BY] = '${req.user.id}'`,
      `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]

    sql = `UPDATE [LEAVE_TRANSACTION] SET ${updatevalueArr} WHERE id = '${req.params.id}'`;
    result = await pool.query(sql);
    if (result.rowsAffected[0] > 0) {
      if (dataLeaveTransaction.IS_RETIRE) {
        sql = `UPDATE [USER] SET LAST_WORK = '${moment(dataLeaveTransaction.LEAVE_TO_DATE).format('YYYY-MM-DD')}' WHERE id = '${dataUser.id}'`;
        result = await pool.query(sql);
      }
      await sendApproveToEmployee(dataUser, dataApprover, dataLeaveTransaction)
      res.status(200).json({ status: 'updated success' });
    }

  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.rejectNoAuth = catchAsync(async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new AppError("Please fill data", 400));
    }

    let pool = await new dbQuery().connect();
    var sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${req.params.id}`;
    var result = await pool.query(sql);
    var dataLeaveTransaction = result.recordset[0];

    var sql = `SELECT * FROM [USER] WHERE id = '${dataLeaveTransaction.FK_USER_ID}' AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    var result = await pool.query(sql);
    var dataUser = result.recordset[0];

    sql = `SELECT * FROM [USER] WHERE LINE_USERID = '${req.params.approver}' AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    result = await pool.query(sql);
    var dataApprover = result.recordset[0];

    if (dataUser.ADVANCED_LEAVE_APPROVER == dataApprover.id) {
      let updatevalueArr = [
        `[STATUS] = '3'`,
        `[PRIMARY_APPROVE] = '0'`,
        `[PRIMARY_APPROVE_DESCRIPTION] = ${req.params.reason ? "'" + req.params.reason + "'" : '-'}`,
        `[PRIMARY_APPROVED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
        // `[UPDATED_BY] = '${req.user.id}'`,
        `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
      ]

      var sql = `UPDATE [LEAVE_TRANSACTION] SET ${updatevalueArr} WHERE id = '${req.params.id}'`;
      var result = await pool.query(sql);
      if (result.rowsAffected[0] > 0) {
        sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${req.params.id}`;
        result = await pool.query(sql);
        dataLeaveTransaction = result.recordset[0];
        await sendRejectToEmployee(dataUser, dataApprover, dataLeaveTransaction)
        res.status(200).json({ status: 'updated success' });

      }
    }
    else {
      return next(new AppError("Not match approver", 400));
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.approveNoAuth = catchAsync(async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new AppError("Please fill data", 400));
    }

    let pool = await new dbQuery().connect();
    var sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${req.params.id}`;
    var result = await pool.query(sql);
    var dataLeaveTransaction = result.recordset[0];

    var sql = `SELECT * FROM [USER] WHERE id = '${dataLeaveTransaction.FK_USER_ID}' AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    var result = await pool.query(sql);
    var dataUser = result.recordset[0];

    sql = `SELECT * FROM [USER] WHERE LINE_USERID = '${req.params.approver}' AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    result = await pool.query(sql);
    var dataApprover = result.recordset[0];

    if (dataLeaveTransaction.LEAVE_TYPE) {
      var body = dataLeaveTransaction;
      var useDay = 0;
      var useHour = 0;
      var now = moment(moment(body.LEAVE_TO_DATE).format('YYYY-MM-DD') + ' ' + moment(body.TIME_START).utc().format('HH:mm'));
      var end = moment(moment(body.LEAVE_END_DATE).format('YYYY-MM-DD') + ' ' + moment(body.TIME_END).utc().format('HH:mm'));
      var duration = moment.duration(end.diff(now));
      var gethours = duration.asHours();
      var day = 0;
      var timesplit = 0;
      // console.log('gethours',gethours);
      if (gethours >= 24) {
        day = Number(((gethours / 24) + '').split('.')[0]);
        // console.log('day', day);
        timesplit = (gethours - (24 * day));
        // console.log('timesplit', timesplit);
        day = timesplit >= 8 ? Number(day) + 1 : day;
        // console.log('day2', day);
        timesplit = timesplit >= 8 ? 0 : timesplit;
        // console.log('timesplit2', timesplit);
      }
      else if (gethours >= 8) {
        day = 1;
        timesplit = 0;
      }
      else {
        timesplit = gethours;
      }
      useDay = day;
      useHour = timesplit;
      // console.log('useDay', useDay);
      // console.log('useHour', useHour);

      sql = `SELECT * FROM [LEAVE_TYPE_DETAIL] WHERE FK_EMPLOYEE_TYPE_ID = ${dataUser.FK_EMPLOYEE_TYPE_ID} AND FK_LEAVE_TYPE_ID = ${body.LEAVE_TYPE} AND YEAR = '${moment(new Date()).format('YYYY')}'`;
      result = await pool.query(sql);
      var dataLeaveTypeDetail = result.recordset[0];
      sql = `SELECT * FROM [LEAVE_TRANSACTION_QTY] WHERE FK_USER_ID = ${body.FK_USER_ID} AND FK_LEAVE_TYPE_ID = ${body.LEAVE_TYPE} AND YEAR = '${moment(new Date()).format('YYYY')}'`;
      result = await pool.query(sql);
      if (result.rowsAffected[0] > 0) {
        result.recordset[0].HOUR += Number(timesplit);
        result.recordset[0].DAY += Number(day);

        if (result.recordset[0].HOUR >= 8) {
          result.recordset[0].DAY += 1;
          result.recordset[0].HOUR = result.recordset[0].HOUR - 8;
        }

        console.log('result.recordset[0].DAY', result.recordset[0].DAY);
        console.log('result.recordset[0].HOUR', result.recordset[0].HOUR);
        // console.log('dataLeaveTypeDetail.QTY', dataLeaveTypeDetail.QTY);
        // console.log('result.recordset[0].DAY', result.recordset[0].DAY);
        // console.log('result.recordset[0].HOUR', result.recordset[0].HOUR);
        // console.log('result.recordset[0].HOUR 2', result.recordset[0].HOUR / 10);
        // console.log('result.recordset[0].HOUR 3', (result.recordset[0].DAY + (result.recordset[0].HOUR / 10)));
        if (dataLeaveTypeDetail.QTY < (result.recordset[0].DAY + (result.recordset[0].HOUR / 10))) {
          // if (dataLeaveTypeDetail.QTY < result.recordset[0].DAY + result.recordset[0].HOUR) {
          return next(new AppError("Leave day not enough", 400));
        }

        let updatevalueArr = [
          `[HOUR] = '${Number(result.recordset[0].HOUR)}'`,
          `[DAY] = '${Number(result.recordset[0].DAY)}'`,
        ]

        pool = await new dbQuery().connect();
        sql = `UPDATE [LEAVE_TRANSACTION_QTY] SET ${updatevalueArr} WHERE id = '${result.recordset[0].id}'`;
        result = await pool.query(sql);
      }
      else {
        if (dataLeaveTypeDetail.QTY < day) {
          return next(new AppError("Leave day not enough", 400));
        }

        let columnQTYArr = [
          "[FK_USER_ID]",
          "[FK_LEAVE_TYPE_ID]",
          "[YEAR]",
          "[HOUR]",
          "[DAY]"
        ]

        let valueQTYArr = [
          `'${body.FK_USER_ID}'`,
          `'${body.LEAVE_TYPE}'`,
          `'${moment(new Date()).format('YYYY')}'`,
          `'${timesplit}'`,
          `'${day}'`,
        ]

        pool = await new dbQuery().connect();
        sql = `INSERT INTO [LEAVE_TRANSACTION_QTY] (${columnQTYArr}) OUTPUT Inserted.id VALUES (${valueQTYArr})`;
        result = await pool.query(sql);
      }
    }

    if (dataUser.ADVANCED_LEAVE_APPROVER == dataApprover.id) {
      let updatevalueArr = [
        `[STATUS] = '2'`,
        `[PRIMARY_APPROVE] = '1'`,
        `[PRIMARY_APPROVED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
        // `[UPDATED_BY] = '${req.user.id}'`,
        `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
      ]

      sql = `UPDATE [LEAVE_TRANSACTION] SET ${updatevalueArr} WHERE id = '${req.params.id}'`;
      result = await pool.query(sql);
      if (result.rowsAffected[0] > 0) {
        if (dataLeaveTransaction.IS_RETIRE) {
          sql = `UPDATE [USER] SET LAST_WORK = '${moment(dataLeaveTransaction.LEAVE_TO_DATE).format('YYYY-MM-DD')}' WHERE id = '${dataUser.id}'`;
          result = await pool.query(sql);
        }
        await sendApproveToEmployee(dataUser, dataApprover, dataLeaveTransaction)
        res.status(200).json({ status: 'updated success' });
      }
    }
    else {
      return next(new AppError("Not match approver", 400));
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

async function sendApproveToEmployee(dataUser, dataApprover, dataLeaveTransaction) {
  try {
    var data = {};
    if (dataLeaveTransaction.IS_WORK_OUTSIDE) {
      data = {
        "to": dataUser.LINE_USERID,
        "messages": [
          {
            "type": "flex",
            "altText": "this is a flex message",
            "contents": {
              "type": "bubble",
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "คำขอออกนอกสถานที่ของท่าน",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": "ได้รับการอนุมัติแล้ว",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `เลขการลา: ${dataLeaveTransaction.LEAVE_CODE}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                ]
              },
              "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "button",
                    "style": "primary",
                    "height": "sm",
                    "action": {
                      "type": "uri",
                      "label": "ดาวน์โหลดเอกสาร",
                      "uri": `${process.env.APIURL}/api/leave/exportPDFLeaveOffsiteWork?type=file&leaveTransactionID=${dataLeaveTransaction.id}`
                      // "uri": `${process.env.USERURL}/Register/` + userid
                    },
                    "color": "#4CD964",
                    "adjustMode": "shrink-to-fit"
                  },
                  {
                    "type": "text",
                    "text": `วันที่ขอออกนอกสถานที่`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `${moment(new Date()).format('DD/MM/YYYY')}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                ]
              }
            }
          }
        ]
      }
    }
    else if (dataLeaveTransaction.IS_RETIRE) {
      data = {
        "to": dataUser.LINE_USERID,
        "messages": [
          {
            "type": "flex",
            "altText": "this is a flex message",
            "contents": {
              "type": "bubble",
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "ทางบริษัท ฯ",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": "ได้รับคำขอของท่านแล้ว",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `วันที่ขอลาออก ${moment(new Date()).format('DD/MM/YYYY')}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": "กรุณารอฝ่ายบุคคลติดต่อกลับ",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                ]
              },
            }
          }
        ]
      }
    }
    else {
      data = {
        "to": dataUser.LINE_USERID,
        "messages": [
          {
            "type": "flex",
            "altText": "this is a flex message",
            "contents": {
              "type": "bubble",
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "คำขอลาหยุดของท่าน",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": "ได้รับการอนุมัติแล้ว",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `เลขการลา: ${dataLeaveTransaction.LEAVE_CODE}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  }
                ]
              },
              "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "button",
                    "style": "primary",
                    "height": "sm",
                    "action": {
                      "type": "uri",
                      "label": "ดาวน์โหลดเอกสาร",
                      "uri": `${process.env.APIURL}/api/leave/exportPDFLeave?type=file&leaveTransactionID=${dataLeaveTransaction.id}`
                      // "uri": `${process.env.USERURL}/Register/` + userid
                    },
                    "color": "#4CD964",
                    "adjustMode": "shrink-to-fit"
                  },
                  {
                    "type": "text",
                    "text": `วันที่ขอลาหยุด ${moment(new Date()).format('DD/MM/YYYY')}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  }
                ]
              }
            }
          }
        ]
      }
    }

    let pool = await new dbQuery().connect();
    var sql = `SELECT TOP 1 [TOKEN] FROM [CONFIGLINE]`;
    var result = await pool.query(sql);
    var linetoken = result.recordset[0].TOKEN;

    try {
      var data2 = {
        "to": dataApprover.LINE_USERID,
        "messages": [
          {
            "type": "text",
            "text": `คุณได้อนุมัติข้อมูลการลา\nเลขที่: ${dataLeaveTransaction.LEAVE_CODE} แล้ว`
          }
        ]
      }

      await axios
        .post(`https://api.line.me/v2/bot/message/push`, data2, {
          headers: {
            'Authorization': "Bearer " + linetoken,
          },
        })
        .then((response) => {
        })
        .catch(async (err) => {
          console.log(`err send line approver: ${err}`);
        });
    }
    catch (err) {
      console.log(`err catch send line approver: ${err}`);
    }

    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        return true;
      })
      .catch((err) => {
        console.log('err sendToEmployee', err);
        return false;
      });
    return false;
  }
  catch (err) {
    console.log('error: ', err);
    return false;
  }
}

async function sendRejectToEmployee(dataUser, dataApprover, dataLeaveTransaction) {
  try {
    var data = {
      "to": dataUser.LINE_USERID,
      "messages": [
        {
          "type": "flex",
          "altText": "this is a flex message",
          "contents": {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "คำขอของคุณได้รับการปฏิเสธ",
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
                {
                  "type": "text",
                  "text": `เลขคำขอ: ${dataLeaveTransaction.LEAVE_CODE}`,
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
                {
                  "type": "text",
                  "text": `เมื่อวันที่ ${moment(new Date()).format('DD/MM/YYYY')}`,
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
                {
                  "type": "text",
                  "text": `เนื่องจาก: ${dataLeaveTransaction.PRIMARY_APPROVE_DESCRIPTION}`,
                  "wrap": true,
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
              ]
            },
          }
        }
      ]
    }

    let pool = await new dbQuery().connect();
    var sql = `SELECT TOP 1 [TOKEN] FROM [CONFIGLINE]`;
    var result = await pool.query(sql);
    var linetoken = result.recordset[0].TOKEN;

    try {
      var data2 = {
        "to": dataApprover.LINE_USERID,
        "messages": [
          {
            "type": "text",
            "text": `คุณไม่อนุมัติข้อมูลการลา\nเลขที่: ${dataLeaveTransaction.LEAVE_CODE}`
          }
        ]
      }

      await axios
        .post(`https://api.line.me/v2/bot/message/push`, data2, {
          headers: {
            'Authorization': "Bearer " + linetoken,
          },
        })
        .then((response) => {
        })
        .catch(async (err) => {
          console.log(`err send line approver: ${err}`);
        });
    }
    catch (err) {
      console.log(`err catch send line approver: ${err}`);
    }

    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        return true;
      })
      .catch((err) => {
        console.log('err sendToEmployee', err);
        return false;
      });
    return false;
  }
  catch (err) {
    console.log('error: ', err);
    return false;
  }
}

async function sendToApproverLeaveWorkOutSide(leaveTransactionID, body, dataApprover) {
  try {
    let pool = await new dbQuery().connect();
    var sql = `SELECT * FROM [USER] WHERE id = ${body.FK_USER_ID} AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    var result = await pool.query(sql);
    var dataUser = result.recordset[0];

    sql = `SELECT TOP 1 [TOKEN] FROM [CONFIGLINE]`;
    result = await pool.query(sql);
    var linetoken = result.recordset[0].TOKEN;

    sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${leaveTransactionID}`;
    result = await pool.query(sql);
    var dataLeaveTransaction = result.recordset[0];

    var data = {
      "to": dataApprover.LINE_USERID,
      // "to": dataUser.LINE_USERID,
      "messages": [
        {
          "type": "flex",
          "altText": "this is a flex message",
          "contents": {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": `แจ้งเตือนขอทำงานนอกสถานที่`,
                  "wrap": true,
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
                {
                  "type": "text",
                  "text": `เมื่อวันที่ ${moment(new Date()).format('DD/MM/YYYY')}`,
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
                {
                  "type": "text",
                  "text": `เลขคำขอ: ${dataLeaveTransaction.LEAVE_CODE}`,
                  "wrap": true,
                  "color": "#666666",
                  "size": "md",
                  "margin": "xxl",
                  "flex": 5
                },
                {
                  "type": "text",
                  "text": `ชื่อ-นามสกุล: ${dataUser.FULLNAME}\nตำแหน่ง: ${dataUser.POSITION}\nแผนก: ${dataUser.DEPARTMENT}\nฝ่าย: ${dataUser.FACTION}`,
                  "wrap": true,
                  "color": "#666666",
                  "size": "md",
                },
                {
                  "type": "text",
                  "text": `สถานที่ปฏิบัติงาน: ${dataUser.WORK_LOCATION}\nสถานที่ที่จะไปปฏิบัติงาน: ${dataLeaveTransaction.CHANGE_WORK_LOCATION == 'อื่นๆ' ? dataLeaveTransaction.OTHER_WORK_LOCATION : dataLeaveTransaction.CHANGE_WORK_LOCATION}`,
                  "wrap": true,
                  "color": "#666666",
                  "size": "md"
                },
                {
                  "type": "text",
                  "text": `รถที่ใช้ออกไปปฏิบัติงาน: ${dataLeaveTransaction.CAR}\nทะเบียน: ${dataLeaveTransaction.LICENSE_PLATE}`,
                  "wrap": true,
                  "color": "#666666",
                  "size": "md"
                },
                {
                  "type": "text",
                  "text": `วันที่: ${moment(body.LEAVE_TO_DATE).format('DD/MM/YYYY')}\nตั้งแต่เวลา: ${body.TIME_START} น.\nถึงเวลา: ${body.TIME_END} น.`,
                  "wrap": true,
                  "color": "#666666",
                  "size": "md"
                }
              ]
            },
            "footer": {
              "type": "box",
              "layout": "vertical",
              "spacing": "sm",
              "contents": [
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "action": {
                    "type": "uri",
                    "label": "ดูข้อมูล",
                    "uri": `${process.env.ADMINURL}/LeaveApprove?id=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}`
                  },
                  "color": "#00C4B5",
                  "adjustMode": "shrink-to-fit"
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "button",
                      "height": "sm",
                      "action": {
                        "type": "postback",
                        "label": "ไม่อนุมัติ",
                        "data": `action=leavereject&leavetransactionid=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}&status=3`
                      },
                      "color": "#D94C4C",
                      "adjustMode": "shrink-to-fit",
                      "style": "primary"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "button",
                          "style": "primary",
                          "height": "sm",
                          "action": {
                            "type": "postback",
                            "label": "อนุมัติ",
                            "data": `action=leaveapprove&leavetransactionid=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}&status=2`
                          },
                          "color": "#4CD964",
                          "adjustMode": "shrink-to-fit"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }
      ]
    }

    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        return true;
      })
      .catch((err) => {
        console.log('err', err);
        return false;
      });
    return false;
  }
  catch (err) {
    console.log('error sendToApproverLeaveWorkOutSide: ', err);
    return false;
  }
}

async function sendToApprover(leaveTransactionID, body, dataApprover, useDay, useHour) {
  try {
    let pool = await new dbQuery().connect();
    var sql = `SELECT * FROM [USER] WHERE id = ${body.FK_USER_ID} AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    var result = await pool.query(sql);
    var dataUser = result.recordset[0];

    sql = `SELECT TOP 1 [TOKEN] FROM [CONFIGLINE]`;
    result = await pool.query(sql);
    var linetoken = result.recordset[0].TOKEN;

    sql = `SELECT * FROM [LEAVE_TYPE] WHERE id = ${body.LEAVE_TYPE}`;
    result = await pool.query(sql);
    var dataLeaveType = result.recordset[0];

    sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${leaveTransactionID}`;
    result = await pool.query(sql);
    var dataLeaveTransaction = result.recordset[0];

    var data = {};
    if (dataLeaveType.LEAVE_NAME == "ลาป่วย") {
      if (useDay <= 2) {
        data = {
          "to": dataApprover.LINE_USERID,
          // "to": dataUser.LINE_USERID,
          "messages": [
            {
              "type": "flex",
              "altText": "this is a flex message",
              "contents": {
                "type": "bubble",
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": `แจ้งเตือนการลางาน`,
                      "weight": "bold",
                      "size": "lg",
                      "align": "center"
                    },
                    {
                      "type": "text",
                      "text": `เมื่อวันที่ ${moment(new Date()).format('DD/MM/YYYY')}`,
                      "weight": "bold",
                      "size": "lg",
                      "align": "center"
                    },
                    {
                      "type": "text",
                      "text": `เลขคำขอ: ${dataLeaveTransaction.LEAVE_CODE}`,
                      "wrap": true,
                      "color": "#666666",
                      "size": "md",
                      "margin": "xxl",
                      "flex": 5
                    },
                    {
                      "type": "text",
                      "text": `ชื่อ-นามสกุล: ${dataUser.FULLNAME}\nตำแหน่ง: ${dataUser.POSITION}\nแผนก: ${dataUser.DEPARTMENT}\nฝ่าย: ${dataUser.FACTION}`,
                      "wrap": true,
                      "color": "#666666",
                      "size": "md",
                    },
                    {
                      "type": "text",
                      "text": `สถานที่ปฏิบัติงาน: ${dataUser.WORK_LOCATION}\nประเภทการลา: ${dataLeaveType.LEAVE_NAME}\nเหตุผลการลา: ${body.LEAVE_REASON}`,
                      "wrap": true,
                      "color": "#666666",
                      "size": "md"
                    },
                    {
                      "type": "text",
                      "text": `วันที่ลาวันแรก: ${moment(body.LEAVE_TO_DATE).format('DD/MM/YYYY')}\nเวลาเริ่มต้น: ${body.TIME_START.replace(':', '.')} น.\nวันที่ลาวันสุดท้าย: ${moment(body.LEAVE_END_DATE).format('DD/MM/YYYY')}\nเวลาสิ้นสุด: ${body.TIME_END.replace(':', '.')} น.\nระยะเวลาที่ลา: ${(useDay > 0 ? useDay + ' วัน ' : '') + (useHour > 0 ? useHour + ' ชั่วโมง' : '')}`,
                      "wrap": true,
                      "color": "#666666",
                      "size": "md"
                    }
                  ]
                },
                "footer": {
                  "type": "box",
                  "layout": "vertical",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "button",
                      "style": "primary",
                      "height": "sm",
                      "action": {
                        "type": "uri",
                        "label": "ดูข้อมูล",
                        "uri": `${process.env.ADMINURL}/LeaveApprove?id=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}`
                      },
                      "color": "#00C4B5",
                      "adjustMode": "shrink-to-fit"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "spacing": "sm",
                      "contents": [
                        // {
                        //   "type": "button",
                        //   "height": "sm",
                        //   "action": {
                        //     "type": "postback",
                        //     "label": "ไม่อนุมัติ",
                        //     "data": `action=leavereject&leavetransactionid=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}&status=3`
                        //   },
                        //   "color": "#D94C4C",
                        //   "adjustMode": "shrink-to-fit",
                        //   "style": "primary"
                        // },
                        {
                          "type": "button",
                          "style": "primary",
                          "height": "sm",
                          "action": {
                            "type": "postback",
                            "label": "รับทราบ",
                            "data": `action=leaveinform&leavetransactionid=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}&status=2`
                          },
                          "color": "#4CD964",
                          "adjustMode": "shrink-to-fit"
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      }
      else {
        data = {
          "to": dataApprover.LINE_USERID,
          // "to": dataUser.LINE_USERID,
          "messages": [
            {
              "type": "flex",
              "altText": "this is a flex message",
              "contents": {
                "type": "bubble",
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": `แจ้งเตือนการลางาน`,
                      "weight": "bold",
                      "size": "lg",
                      "align": "center"
                    },
                    {
                      "type": "text",
                      "text": `เมื่อวันที่ ${moment(new Date()).format('DD/MM/YYYY')}`,
                      "weight": "bold",
                      "size": "lg",
                      "align": "center"
                    },
                    {
                      "type": "text",
                      "text": `เลขคำขอ: ${dataLeaveTransaction.LEAVE_CODE}`,
                      "wrap": true,
                      "color": "#666666",
                      "size": "md",
                      "margin": "xxl",
                      "flex": 5
                    },
                    {
                      "type": "text",
                      "text": `ชื่อ-นามสกุล: ${dataUser.FULLNAME}\nตำแหน่ง: ${dataUser.POSITION}\nแผนก: ${dataUser.DEPARTMENT}\nฝ่าย: ${dataUser.FACTION}`,
                      "wrap": true,
                      "color": "#666666",
                      "size": "md",
                    },
                    {
                      "type": "text",
                      "text": `สถานที่ปฏิบัติงาน: ${dataUser.WORK_LOCATION}\nประเภทการลา: ${dataLeaveType.LEAVE_NAME}\nเหตุผลการลา: ${body.LEAVE_REASON}`,
                      "wrap": true,
                      "color": "#666666",
                      "size": "md"
                    },
                    {
                      "type": "text",
                      "text": `วันที่ลาวันแรก: ${moment(body.LEAVE_TO_DATE).format('DD/MM/YYYY')}\nเวลาเริ่มต้น: ${body.TIME_START.replace(':', '.')} น.\nวันที่ลาวันสุดท้าย: ${moment(body.LEAVE_END_DATE).format('DD/MM/YYYY')}\nเวลาสิ้นสุด: ${body.TIME_END.replace(':', '.')} น.\nระยะเวลาที่ลา: ${(useDay > 0 ? useDay + ' วัน ' : '') + (useHour > 0 ? useHour + ' ชั่วโมง' : '')}`,
                      "wrap": true,
                      "color": "#666666",
                      "size": "md"
                    }
                  ]
                },
                "footer": {
                  "type": "box",
                  "layout": "vertical",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "button",
                      "style": "primary",
                      "height": "sm",
                      "action": {
                        "type": "uri",
                        "label": "ดูข้อมูล",
                        "uri": `${process.env.ADMINURL}/LeaveApprove?id=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}`
                      },
                      "color": "#00C4B5",
                      "adjustMode": "shrink-to-fit"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "spacing": "sm",
                      "contents": [
                        {
                          "type": "button",
                          "height": "sm",
                          "action": {
                            "type": "postback",
                            "label": "ไม่อนุมัติ",
                            "data": `action=leavereject&leavetransactionid=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}&status=3`
                          },
                          "color": "#D94C4C",
                          "adjustMode": "shrink-to-fit",
                          "style": "primary"
                        },
                        {
                          "type": "box",
                          "layout": "vertical",
                          "spacing": "sm",
                          "contents": [
                            {
                              "type": "button",
                              "style": "primary",
                              "height": "sm",
                              "action": {
                                "type": "postback",
                                "label": "อนุมัติ",
                                "data": `action=leaveapprove&leavetransactionid=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}&status=2`
                              },
                              "color": "#4CD964",
                              "adjustMode": "shrink-to-fit"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          ]
        }
      }
    } else {
      data = {
        "to": dataApprover.LINE_USERID,
        // "to": dataUser.LINE_USERID,
        "messages": [
          {
            "type": "flex",
            "altText": "this is a flex message",
            "contents": {
              "type": "bubble",
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": `แจ้งเตือนการลางาน`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `เมื่อวันที่ ${moment(new Date()).format('DD/MM/YYYY')}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `เลขคำขอ: ${dataLeaveTransaction.LEAVE_CODE}`,
                    "wrap": true,
                    "color": "#666666",
                    "size": "md",
                    "margin": "xxl",
                    "flex": 5
                  },
                  {
                    "type": "text",
                    "text": `ชื่อ-นามสกุล: ${dataUser.FULLNAME}\nตำแหน่ง: ${dataUser.POSITION}\nแผนก: ${dataUser.DEPARTMENT}\nฝ่าย: ${dataUser.FACTION}`,
                    "wrap": true,
                    "color": "#666666",
                    "size": "md",
                  },
                  {
                    "type": "text",
                    "text": `สถานที่ปฏิบัติงาน: ${dataUser.WORK_LOCATION}\nประเภทการลา: ${dataLeaveType.LEAVE_NAME}\nเหตุผลการลา: ${body.LEAVE_REASON}`,
                    "wrap": true,
                    "color": "#666666",
                    "size": "md"
                  },
                  {
                    "type": "text",
                    "text": `วันที่ลาวันแรก: ${moment(body.LEAVE_TO_DATE).format('DD/MM/YYYY')}\nเวลาเริ่มต้น: ${body.TIME_START.replace(':', '.')} น.\nวันที่ลาวันสุดท้าย: ${moment(body.LEAVE_END_DATE).format('DD/MM/YYYY')}\nเวลาสิ้นสุด: ${body.TIME_END.replace(':', '.')} น.\nระยะเวลาที่ลา: ${(useDay > 0 ? useDay + ' วัน ' : '') + (useHour > 0 ? useHour + ' ชั่วโมง' : '')}`,
                    "wrap": true,
                    "color": "#666666",
                    "size": "md"
                  }
                ]
              },
              "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "button",
                    "style": "primary",
                    "height": "sm",
                    "action": {
                      "type": "uri",
                      "label": "ดูข้อมูล",
                      "uri": `${process.env.ADMINURL}/LeaveApprove?id=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}`
                    },
                    "color": "#00C4B5",
                    "adjustMode": "shrink-to-fit"
                  },
                  {
                    "type": "box",
                    "layout": "horizontal",
                    "spacing": "sm",
                    "contents": [
                      {
                        "type": "button",
                        "height": "sm",
                        "action": {
                          "type": "postback",
                          "label": "ไม่อนุมัติ",
                          "data": `action=leavereject&leavetransactionid=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}&status=3`
                        },
                        "color": "#D94C4C",
                        "adjustMode": "shrink-to-fit",
                        "style": "primary"
                      },
                      {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "sm",
                        "contents": [
                          {
                            "type": "button",
                            "style": "primary",
                            "height": "sm",
                            "action": {
                              "type": "postback",
                              "label": "อนุมัติ",
                              "data": `action=leaveapprove&leavetransactionid=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}&status=2`
                            },
                            "color": "#4CD964",
                            "adjustMode": "shrink-to-fit"
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]
      }
    }

    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        if (response.status == 200) {
          return true;
        }
        else {
          return false;
        }
      })
      .catch((err) => {
        console.log('err', err);
        return false;
      });
  }
  catch (err) {
    console.log('error: ', err);
    return false;
  }
}

async function sendToApproverRetire(leaveTransactionID, body, dataApprover) {
  try {
    let pool = await new dbQuery().connect();
    var sql = `SELECT * FROM [USER] WHERE id = ${body.FK_USER_ID} AND IS_ACTIVE = 1 AND IS_VERIFY = 1`;
    var result = await pool.query(sql);
    var dataUser = result.recordset[0];

    sql = `SELECT TOP 1 [TOKEN] FROM [CONFIGLINE]`;
    result = await pool.query(sql);
    var linetoken = result.recordset[0].TOKEN;

    sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${leaveTransactionID}`;
    result = await pool.query(sql);
    var dataLeaveTransaction = result.recordset[0];
    console.log(`To LINEID : ${dataApprover.LINE_USERID}`)
    var data = {
      "to": dataApprover.LINE_USERID,
      // "to": dataUser.LINE_USERID,
      "messages": [
        {
          "type": "flex",
          "altText": "this is a flex message",
          "contents": {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": `แจ้งเตือนการลาออก`,
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
                {
                  "type": "text",
                  "text": `เมื่อวันที่ ${moment(new Date()).format('DD/MM/YYYY')}`,
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
                {
                  "type": "text",
                  "text": `เลขคำขอ: ${dataLeaveTransaction.LEAVE_CODE}`,
                  "wrap": true,
                  "color": "#666666",
                  "size": "md",
                  "margin": "xxl",
                  "flex": 5
                },
                {
                  "type": "text",
                  "text": `ชื่อ-นามสกุล: ${dataUser.FULLNAME}\nตำแหน่ง: ${dataUser.POSITION}\nแผนก: ${dataUser.DEPARTMENT}\nฝ่าย: ${dataUser.FACTION}`,
                  "wrap": true,
                  "color": "#666666",
                  "size": "md",
                },
                {
                  "type": "text",
                  "text": `สถานที่ปฏิบัติงาน: ${dataUser.WORK_LOCATION}\nเหตุผลการลาออก: ${body.LEAVE_REASON}`,
                  "wrap": true,
                  "color": "#666666",
                  "size": "md"
                },
                {
                  "type": "text",
                  "text": `วันที่ทำงานวันสุดท้าย: ${moment(body.LEAVE_TO_DATE).format('DD/MM/YYYY')}\nมีผลลาออกวันที่: ${moment(body.LEAVE_END_DATE).format('DD/MM/YYYY')}\nมีกองทุนหรือไม่?: ${body.FUND_TYPE}`,
                  "wrap": true,
                  "color": "#666666",
                  "size": "md"
                },
                {
                  "type": "text",
                  "text": `ต้องการขอหนังสือรับรอง?: ${body.FLAG_CERTIFICATE}`,
                  "wrap": true,
                  "color": "#666666",
                  "size": "md"
                }
              ]
            },
            "footer": {
              "type": "box",
              "layout": "vertical",
              "spacing": "sm",
              "contents": [
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "action": {
                    "type": "uri",
                    "label": "ดูข้อมูล",
                    "uri": `${process.env.ADMINURL}/LeaveApprove?id=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}`
                  },
                  "color": "#00C4B5",
                  "adjustMode": "shrink-to-fit"
                },
                {
                  "type": "box",
                  "layout": "horizontal",
                  "spacing": "sm",
                  "contents": [
                    // {
                    //   "type": "button",
                    //   "style": "primary",
                    //   "height": "sm",
                    //   "action": {
                    //     "type": "postback",
                    //     "label": "รับทราบ",
                    //     "data": `action=leaveinform&leavetransactionid=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}&status=2`
                    //   },
                    //   "color": "#4CD964",
                    //   "adjustMode": "shrink-to-fit"
                    // },
                    {
                      "type": "button",
                      "style": "primary",
                      "height": "sm",
                      "action": {
                        "type": "postback",
                        "label": "รับทราบ",
                        "data": `action=leaveinform&leavetransactionid=${dataLeaveTransaction.id}&approver=${dataApprover.LINE_USERID}&status=2`
                      },
                      "color": "#4CD964",
                      "adjustMode": "shrink-to-fit"
                    }
                  ]
                }
              ]
            }
          }
        }
      ]
    }

    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        return true;
      })
      .catch((err) => {
        console.log('err', err);
        return false;
      });
    return false;
  }
  catch (err) {
    console.log('error: ', err);
    return false;
  }
}
