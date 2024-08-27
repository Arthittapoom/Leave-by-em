const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const excel = require('excel4node');
const moment = require('moment');
const axios = require("axios");
const PDFGenerator = require("pdfkit");
const { Base64Encode } = require('base64-stream');
const Readable = require('stream').Readable;
const readXlsxFile = require('read-excel-file/node');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const UsersModel = require('../models/users');
const LeaveTransactionModel = require('../models/leave_transaction');
const RunningNumberModel = require('../models/running_number');
const ConfigLineModel = require('../models/config_line');
const EmployeeTypeModel = require('../models/employee_type');
const LeaveTypeModel = require('../models/leave_type');
const LeaveTransactionQtyModel = require('../models/leave_transaction_qty');
const LeaveTypeDetailModel = require('../models/leave_type_detail');

exports.exportDashboardData = async (req, res, next) => {
  try {
    const toDate = moment(req.query.toDate).startOf('day').toDate();
    const endDate = moment(req.query.endDate).endOf('day').toDate();

    const activeEmployeeAmount = await UsersModel.countDocuments({
      $or: [{ IS_RETIRE: { $exists: false } }, { IS_RETIRE: { $ne: 1 } }]
    });

    const retireEmployeeAmount = await UsersModel.countDocuments({ IS_RETIRE: 1 });

    const leaveTypes = await LeaveTypeModel.find();
    const leaveData = await Promise.all(leaveTypes.map(async (leaveType) => {
      const count = await LeaveTransactionModel.countDocuments({
        leave_type: leaveType._id,
        leave_to_date: { $gte: toDate },
        leave_end_date: { $lte: endDate }
      });
      return { text: leaveType.leave_name, number: count };
    }));

    const approveAmount = await LeaveTransactionModel.countDocuments({
      status: 2,
      leave_to_date: { $gte: toDate },
      leave_end_date: { $lte: endDate }
    });

    const rejectAmount = await LeaveTransactionModel.countDocuments({
      status: 3,
      leave_to_date: { $gte: toDate },
      leave_end_date: { $lte: endDate }
    });

    const waitingAmount = await LeaveTransactionModel.countDocuments({
      status: 1,
      leave_to_date: { $gte: toDate },
      leave_end_date: { $lte: endDate }
    });

    const result = {
      activeEmployeeAmount,
      retireEmployeeAmount,
      leaveData,
      approveAmount,
      rejectAmount,
      waitingAmount
    };

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet(`รายงาน${req.query.leaveType}`);

    const headerStyle = workbook.createStyle({
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

    const bodyStyle = workbook.createStyle({
      font: {
        color: '#000000',
        size: 8,
      },
    });

    const headers = [
      'จำนวนพนักงานปัจจุบัน', 'จำนวนพนักงานที่ลาออก', 'จำนวนพนักงานที่ลาป่วย',
      'จำนวนพนักงานที่ลากิจ', 'จำนวนพนักงานที่ลากิจ(พิเศษ)', 'จำนวนพนักงานที่ลาคลอด',
      'จำนวนพนักงานที่ลาเพื่อรับราชการทหาร', 'จำนวนพนักงานที่ลาเพื่ออุปสมบท',
      'จำนวนพนักงานที่ลาหยุดพักผ่อนประจำปี', 'จำนวนพนักงานที่ลาไม่รับค่าจ้าง',
      'รายการที่อนุมัติ', 'รายการไม่อนุมัติ', 'รายการรออนุมัติ'
    ];

    headers.forEach((header, index) => {
      worksheet.cell(2, index + 1).string(header).style(headerStyle);
    });

    worksheet.cell(1, 1, 1, headers.length, true)
      .string(`รายงานภาพรวมการลาของพนักงาน ของวันที่ ${moment(req.query.toDate).format('DD/MM/YYYY')} ถึง ${moment(req.query.endDate).format('DD/MM/YYYY')}`)
      .style(headerStyle);

    let row = 3;
    let col = 1;
    worksheet.cell(row, col++).string(result.activeEmployeeAmount.toString()).style(bodyStyle);
    worksheet.cell(row, col++).string(result.retireEmployeeAmount.toString()).style(bodyStyle);

    result.leaveData.forEach(item => {
      worksheet.cell(row, col++).string(item.number.toString()).style(bodyStyle);
    });

    worksheet.cell(row, col++).string(result.approveAmount.toString()).style(bodyStyle);
    worksheet.cell(row, col++).string(result.rejectAmount.toString()).style(bodyStyle);
    worksheet.cell(row, col++).string(result.waitingAmount.toString()).style(bodyStyle);

    workbook.writeToBuffer().then((buffer) => {
      const base64data = buffer.toString('base64');

      res.attachment(moment().format("yyyyMMDDHHmm") + `-รายงาน${req.query.leaveType}.xlsx`);
      res.status(200).json({
        status: 'success',
        data: base64data,
      });

    }).catch(err => {
      next(err);
    });
  } catch (error) {
    next(error);
  }
};

exports.getDataDashboard = catchAsync(async (req, res, next) => {
  try {
    const fromDate = moment(req.query.toDate).startOf('day').toISOString();
    const toDate = moment(req.query.endDate).endOf('day').toISOString();

    // หาจำนวนพนักงานที่ใช้งาน (activeEmployeeAmount)
    const activeEmployeeAmount = await UsersModel.countDocuments({ is_retire: { $ne: 1 } });

    // หาจำนวนพนักงานที่เกษียณ (retireEmployeeAmount)
    const retireEmployeeAmount = await UsersModel.countDocuments({ is_retire: 1 });

    // หาจำนวนการลาและสถานะการอนุมัติตามประเภทการลา (leaveTransactionQty)
    const leaveTransactionQty = await LeaveTransactionModel.aggregate([
      {
        $match: {
          leave_to_date: { $gte: new Date(fromDate), $lte: new Date(toDate) },
          leave_end_date: { $gte: new Date(fromDate), $lte: new Date(toDate) }
        }
      },
      {
        $lookup: {
          from: "leave_types",
          localField: "leave_type",
          foreignField: "_id",
          as: "leaveType"
        }
      },
      {
        $unwind: "$leaveType"
      },
      {
        $group: {
          _id: "$leaveType.leave_name",
          number: { $sum: 1 }
        }
      },
      {
        $project: {
          text: "$_id",
          number: 1,
          _id: 0
        }
      },
      {
        $sort: { text: 1 }
      }
    ]);

    // หาจำนวนการอนุมัติการลา (approveAmount)
    const approveAmount = await LeaveTransactionModel.countDocuments({
      status: 2,
      leave_to_date: { $gte: new Date(fromDate), $lte: new Date(toDate) },
      leave_end_date: { $gte: new Date(fromDate), $lte: new Date(toDate) }
    });

    // หาจำนวนการปฏิเสธการลา (rejectAmount)
    const rejectAmount = await LeaveTransactionModel.countDocuments({
      status: 3,
      leave_to_date: { $gte: new Date(fromDate), $lte: new Date(toDate) },
      leave_end_date: { $gte: new Date(fromDate), $lte: new Date(toDate) }
    });

    // หาจำนวนการรอการอนุมัติการลา (waitingAmount)
    const waitingAmount = await LeaveTransactionModel.countDocuments({
      status: 1,
      leave_to_date: { $gte: new Date(fromDate), $lte: new Date(toDate) },
      leave_end_date: { $gte: new Date(fromDate), $lte: new Date(toDate) }
    });

    res.status(200).json({
      status: 'success',
      data: {
        activeEmployeeAmount,
        retireEmployeeAmount,
        leaveTransactionQty,
        approveAmount,
        rejectAmount,
        waitingAmount
      }
    });
  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.getDashboardDataPaginate = catchAsync(async (req, res, next) => {
  const searchtxt = req.query.search && req.query.search !== 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";

  const pageSize = parseInt(req.query.perPage) || 10;
  const pageNum = parseInt(req.query.nowPage) || 1;
  const skip = (pageNum - 1) * pageSize;

  let query = {
    $or: [
      { 'EMP_CODE': { $regex: searchtxt, $options: 'i' } },
      { 'fullname': { $regex: searchtxt, $options: 'i' } },
      { 'POSITION': { $regex: searchtxt, $options: 'i' } },
      { 'LEAVE_CODE': { $regex: searchtxt, $options: 'i' } }
    ]
  };

  if (req.query.reportType == 1) {
    query.$and = [{ $or: [{ 'IS_RETIRE': { $exists: false } }, { 'IS_RETIRE': { $ne: 1 } }] }];
  } else {
    query.$and = [{ 'IS_RETIRE': 1 }];
  }

  try {
    const result = await UsersModel.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "leave_transactions",
          localField: "_id",
          foreignField: "fk_user_id",
          as: "leave_transactions"
        }
      },
      {
        $lookup: {
          from: "leave_types",
          localField: "leave_transactions.leave_type",
          foreignField: "_id",
          as: "leave_types"
        }
      },
      {
        $facet: {
          data: [
            { $skip: skip },
            { $limit: pageSize },
            { $project: { EMP_CODE: 1, fullname: 1, POSITION: 1, leave_transactions: 1, leave_types: 1 } }
          ],
          count: [
            { $count: "total" }
          ]
        }
      }
    ]);

    const data = result[0].data;
    const count = result[0].count[0] ? result[0].count[0].total : 0;

    res.status(200).json({
      status: 'success',
      data: data,
      total: count
    });
  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.getDataPaginate = catchAsync(async (req, res, next) => {
  const searchtxt = req.query.search && req.query.search !== 'null' ? req.query.search : "";
  const userRole = req.user.role;
  const userId = req.user.fk_user_id;
  const type = req.query.type && req.query.type !== 'null' ? req.query.type : null;
  const toDate = req.query.toDate && req.query.toDate !== 'null' ? moment(req.query.toDate).format('YYYY-MM-DD') : null;
  const endDate = req.query.endDate && req.query.endDate !== 'null' ? moment(req.query.endDate).format('YYYY-MM-DD') : null;
  const leaveType = req.query.leaveType;
  const status = req.query.status && req.query.status !== 'ทั้งหมด' ? req.query.status : null;
  const pageSize = parseInt(req.query.perPage) || 10;
  const pageNum = parseInt(req.query.nowPage) || 1;

  let matchQuery = {
    $or: [
      { 'U.EMP_CODE': { $regex: searchtxt, $options: 'i' } },
      { 'U.fullname': { $regex: searchtxt, $options: 'i' } },
      { 'U.POSITION': { $regex: searchtxt, $options: 'i' } },
      { 'LT.LEAVE_TO_DATE': { $regex: searchtxt, $options: 'i' } },
      { 'LT.LEAVE_END_DATE': { $regex: searchtxt, $options: 'i' } },
      { 'LT.LEAVE_CODE': { $regex: searchtxt, $options: 'i' } }
    ]
  };

  if (userRole == 3) {
    matchQuery['U.ADVANCED_LEAVE_APPROVER'] = userId;
  }

  if (type) {
    if (type == '999') {
      matchQuery['LT.IS_WORK_OUTSIDE'] = '1';
    } else {
      matchQuery['LT.LEAVE_TYPE'] = type;
    }
  }

  if (toDate && endDate) {
    matchQuery.$or = [
      { 'LT.LEAVE_TO_DATE': { $lte: endDate, $gte: toDate } },
      { 'LT.LEAVE_END_DATE': { $lte: endDate, $gte: toDate } }
    ];
  }

  if (leaveType == 'พนักงานที่ลางาน') {
    matchQuery['$or'] = [{ 'LT.IS_RETIRE': { $exists: false } }, { 'LT.IS_RETIRE': { $ne: 1 } }];
  } else {
    matchQuery['LT.IS_RETIRE'] = 1;
  }

  if (status && status !== '4') {
    matchQuery['LT.is_active'] = 1;
    matchQuery['LT.STATUS'] = status;
  } else if (status == '4') {
    matchQuery['$or'] = [{ 'LT.is_active': { $exists: false } }, { 'LT.is_active': { $ne: 1 } }];
  }

  const aggregatePipeline = [
    { $match: matchQuery },
    {
      $lookup: {
        from: 'users',
        localField: 'fk_user_id',
        foreignField: '_id',
        as: 'U'
      }
    },
    { $unwind: '$U' },
    {
      $lookup: {
        from: 'leave_types',
        localField: 'LEAVE_TYPE',
        foreignField: '_id',
        as: 'LTY'
      }
    },
    { $unwind: { path: '$LTY', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        LEAVE_TO_DATE_TXT: { $dateToString: { format: "%d/%m/%Y", date: "$LT.LEAVE_TO_DATE" } },
        LEAVE_END_DATE_TXT: { $dateToString: { format: "%d/%m/%Y", date: "$LT.LEAVE_END_DATE" } }
      }
    },
    {
      $facet: {
        data: [
          { $skip: (pageNum - 1) * pageSize },
          { $limit: pageSize }
        ],
        total: [{ $count: "total" }]
      }
    }
  ];

  const result = await LeaveTransactionModel.aggregate(aggregatePipeline);
  const data = result[0].data;
  const total = result[0].total[0] ? result[0].total[0].total : 0;

  res.status(200).json({
    status: 'success',
    data,
    total
  });
});

exports.exportLeaveData = catchAsync(async (req, res, next) => {
  try {
    const searchtxt = req.query.search && req.query.search !== 'null' ? req.query.search.replace(/[()]/g, '\\$&') : "";
    const query = {
      $and: [
        {
          $or: [
            { 'user.EMP_CODE': { $regex: searchtxt, $options: 'i' } },
            { 'user.FULLNAME': { $regex: searchtxt, $options: 'i' } },
            { 'user.POSITION': { $regex: searchtxt, $options: 'i' } },
            { 'LEAVE_TO_DATE': { $regex: searchtxt, $options: 'i' } },
            { 'LEAVE_END_DATE': { $regex: searchtxt, $options: 'i' } },
            { 'LEAVE_CODE': { $regex: searchtxt, $options: 'i' } }
          ]
        }
      ]
    };

    if (req.user.role == 3) {
      query.$and.push({ 'user.ADVANCED_LEAVE_APPROVER': req.user.FK_USER_ID });
    }

    if (req.query.type && req.query.type !== 'null') {
      if (req.query.type == '999') {
        query.$and.push({ IS_WORK_OUTSIDE: '1' });
      } else {
        query.$and.push({ LEAVE_TYPE: req.query.type });
      }
    }

    if (req.query.leaveType == 'พนักงานที่ลางาน') {
      query.$and.push({ $or: [{ IS_RETIRE: null }, { IS_RETIRE: { $ne: 1 } }] });
    } else {
      query.$and.push({ IS_RETIRE: 1 });
    }

    if (req.query.toDate && req.query.toDate !== 'null' && req.query.endDate && req.query.endDate !== 'null') {
      query.$and.push({
        $or: [
          { $and: [{ LEAVE_TO_DATE: { $gte: new Date(req.query.toDate) } }, { LEAVE_END_DATE: { $lte: new Date(req.query.endDate) } }] },
          { LEAVE_TO_DATE: { $lte: new Date(req.query.toDate) } },
          { LEAVE_END_DATE: { $gte: new Date(req.query.endDate) } }
        ]
      });
    }

    if (req.query.status && req.query.status !== 'ทั้งหมด' && req.query.status != 4) {
      query.$and.push({ IS_ACTIVE: 1, STATUS: req.query.status });
    } else if (req.query.status == 4) {
      query.$and.push({ $or: [{ IS_ACTIVE: null }, { IS_ACTIVE: { $ne: 1 } }] });
    }

    console.log('Query Parameters:', req.query);
    console.log('Final Query:', JSON.stringify(query));

    const result = await LeaveTransactionModel.find(query)
      .populate('user', 'emp_code fullname position phone')
      .populate('leave_type', 'leave_name');

    console.log('Result:', result);

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet(`รายงาน${req.query.leaveType}`);

    const headerStyle = workbook.createStyle({
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

    const bodyStyle = workbook.createStyle({
      font: {
        color: '#000000',
        size: 8,
      },
    });

    const headers = [
      'ลำดับ', 'เลขคำขอ', 'ประเภทคำขอ', 'รหัสพนักงาน', 'ชื่อ-นามสกุล',
      'ตำแหน่ง', 'เบอร์โทร', 'วันที่ลาวันแรก', 'เวลาเริ่มต้น',
      'วันที่ลาวันสุดท้าย', 'เวลาสิ้นสุด', 'สถานะคำขอ'
    ];

    headers.forEach((header, index) => {
      worksheet.cell(2, index + 1).string(header).style(headerStyle);
    });

    worksheet.cell(1, 1, 1, headers.length, true)
      .string(`รายงาน${req.query.leaveType}`).style(headerStyle);

    result.forEach((item, index) => {
      let row = 3 + index;
      worksheet.cell(row, 1).number(index + 1).style(bodyStyle);
      worksheet.cell(row, 2).string(item.LEAVE_CODE || '').style(bodyStyle);
      worksheet.cell(row, 3).string(item.IS_RETIRE ? 'ลาออก' : item.IS_WORK_OUTSIDE ? 'ปฏิบัติงานนอกสถานที่' : item.leave_type?.leave_name || '').style(bodyStyle);
      worksheet.cell(row, 4).string(item.user?.EMP_CODE || '').style(bodyStyle);
      worksheet.cell(row, 5).string(item.user?.FULLNAME || '').style(bodyStyle);
      worksheet.cell(row, 6).string(item.user?.POSITION || '').style(bodyStyle);
      worksheet.cell(row, 7).string(item.user?.PHONE || '').style(bodyStyle);
      worksheet.cell(row, 8).string(item.LEAVE_TO_DATE ? moment(item.LEAVE_TO_DATE).format('DD/MM/YYYY') : '-').style(bodyStyle);
      worksheet.cell(row, 9).string(item.TIME_START ? moment(item.TIME_START).format('HH.mm') + ' น.' : '-').style(bodyStyle);
      worksheet.cell(row, 10).string(item.LEAVE_END_DATE ? moment(item.LEAVE_END_DATE).format('DD/MM/YYYY') : '-').style(bodyStyle);
      worksheet.cell(row, 11).string(item.TIME_END ? moment(item.TIME_END).format('HH.mm') + ' น.' : '-').style(bodyStyle);

      let statusText = 'ไม่อนุมัติ';
      if (!item.IS_ACTIVE) {
        statusText = 'ยกเลิก';
      } else if (item.STATUS === 1) {
        statusText = 'รออนุมัติ';
      } else if (item.STATUS === 2) {
        statusText = 'อนุมัติ';
      }

      worksheet.cell(row, 12).string(statusText).style(bodyStyle);
    });

    const buffer = await workbook.writeToBuffer();
    const base64data = buffer.toString('base64');
    res.attachment(moment().format("yyyyMMDDHHmm") + `-รายงาน${req.query.leaveType}.xlsx`);
    res.status(200).json({
      status: 'success',
      data: base64data,
    });
  } catch (error) {
    next(error);
  }
});

exports.getDataPaginateByID = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { search, perPage = 10, nowPage = 1 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid ID format', 400));
  }

  const searchTxt = search && search !== 'null' ? search : '';

  const match = {
    fk_user_id: new mongoose.Types.ObjectId(id),
    $or: [
      { 'user.EMP_CODE': new RegExp(searchTxt, 'i') },
      { 'user.fullname': new RegExp(searchTxt, 'i') },
      { 'user.POSITION': new RegExp(searchTxt, 'i') }
    ]
  };

  const aggregate = LeaveTransactionModel.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'users',
        localField: 'fk_user_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $lookup: {
        from: 'leave_types',
        localField: 'leave_type',
        foreignField: '_id',
        as: 'leave_type'
      }
    },
    { $unwind: '$leave_type' },
    {
      $facet: {
        paginatedResults: [
          { $skip: (parseInt(nowPage) - 1) * parseInt(perPage) },
          { $limit: parseInt(perPage) }
        ],
        totalCount: [
          { $count: 'count' }
        ]
      }
    }
  ]);

  const results = await aggregate.exec();
  const data = results[0].paginatedResults;
  const totalCount = results[0].totalCount[0] ? results[0].totalCount[0].count : 0;

  res.status(200).json({
    status: 'success',
    data,
    totalCount,
    nowPage: parseInt(nowPage),
    perPage: parseInt(perPage)
  });
});

exports.getRetireData = catchAsync(async (req, res, next) => {
  const { userid } = req.params;

  if (!ObjectId.isValid(userid)) {
    return next(new AppError('Invalid user ID format', 400));
  }

  const objectIdUserId = new ObjectId(userid);
  console.log('UserID:', userid); // ตรวจสอบค่า userid
  console.log('UserID Type:', typeof userid); // ตรวจสอบประเภทของ userid
  console.log('ObjectId UserID:', objectIdUserId); // ตรวจสอบ ObjectId ของ userid

  // ขั้นตอนแรก: ตรวจสอบข้อมูลใน leave_transactions ที่ตรงกับ fk_user_id
  const initialMatch = await LeaveTransactionModel.find({
    fk_user_id: objectIdUserId
  });
  console.log('Initial Match Result:', initialMatch); // ตรวจสอบผลลัพธ์ของ initial match

  // หากไม่มีข้อมูลตรงกับ initialMatch, ส่งกลับ response
  if (initialMatch.length === 0) {
    return res.status(200).json({
      status: 'success',
      data: [],
    });
  }

  // ทดสอบการใช้งาน $lookup
  const aggregate = LeaveTransactionModel.aggregate([
    {
      $match: {
        fk_user_id: objectIdUserId
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'fk_user_id',
        foreignField: '_id',
        as: 'user'
      }
    }
  ]);

  const result = await aggregate.exec();
  console.log('Result after $lookup:', result); // ตรวจสอบผลลัพธ์หลังจาก lookup

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.getLeaveByID = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return next(new AppError('Invalid leave transaction ID format', 400));
  }

  // ตรวจสอบการค้นหาโดยใช้ findById
  const leaveTransaction = await LeaveTransactionModel.findById(id);
  if (!leaveTransaction) {
    return next(new AppError('No leave transaction found with that ID', 404));
  }

  console.log('Leave Transaction:', leaveTransaction); // ตรวจสอบข้อมูล leave transaction

  // ตรวจสอบข้อมูลใน users โดยใช้ fk_user_id
  const user = await UsersModel.findById(leaveTransaction.fk_user_id);
  console.log('User:', user); // ตรวจสอบข้อมูล user

  // ตรวจสอบข้อมูลใน leave_types โดยใช้ leave_type
  let leaveType = null;
  if (ObjectId.isValid(leaveTransaction.leave_type)) {
    leaveType = await LeaveTypeModel.findById(leaveTransaction.leave_type);
  }
  console.log('Leave Type:', leaveType); // ตรวจสอบข้อมูล leave type

  // ทดสอบการ lookup ข้อมูลจาก users และ leave_types
  const aggregate = LeaveTransactionModel.aggregate([
    {
      $match: {
        _id: new ObjectId(id)
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'fk_user_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $addFields: {
        leave_type: { $toObjectId: '$leave_type' }
      }
    },
    {
      $lookup: {
        from: 'leave_types',
        localField: 'leave_type',
        foreignField: '_id',
        as: 'leave_type'
      }
    },
    { $unwind: '$leave_type' }
  ]);

  const result = await aggregate.exec();
  console.log('Result after lookup from users and leave_types:', result); // ตรวจสอบผลลัพธ์หลังจาก lookup จาก users และ leave_types

  if (!result.length) {
    return next(new AppError('No leave transaction found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: result[0],
  });
});

exports.getQTYData = catchAsync(async (req, res, next) => {
  let userId;
  try {
    userId = new mongoose.Types.ObjectId(req.params.id);
  } catch (error) {
    return next(new AppError(error.message, 400));
  }

  const currentYear = moment(new Date()).format('YYYY');

  // Find user by ID
  const user = await UsersModel.findById(userId);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Fetch leave type details and related data
  const leaveTypeDetails = await LeaveTypeDetailModel.aggregate([
    {
      $match: {
        FK_EMPLOYEE_TYPE_ID: user.fk_employee_type_id,
        YEAR: currentYear
      }
    },
    {
      $lookup: {
        from: 'leavetypes',
        localField: 'FK_LEAVE_TYPE_ID',
        foreignField: '_id',
        as: 'leaveType'
      }
    },
    {
      $lookup: {
        from: 'leavetransactionqtys',
        let: { leaveTypeId: '$FK_LEAVE_TYPE_ID', userId: userId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$FK_LEAVE_TYPE_ID', '$$leaveTypeId'] },
                  { $eq: ['$FK_USER_ID', '$$userId'] }
                ]
              }
            }
          },
          {
            $project: {
              DAY: { $ifNull: ['$DAY', 0] },
              HOUR: { $ifNull: ['$HOUR', 0] },
              USED: {
                $concat: [
                  { $toString: { $ifNull: ['$DAY', 0] } },
                  '.',
                  { $toString: { $multiply: [{ $ifNull: ['$HOUR', 0] }, 10] } }
                ]
              }
            }
          }
        ],
        as: 'leaveTransactionQty'
      }
    },
    {
      $unwind: { path: '$leaveType', preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: '$leaveTransactionQty', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        id: '$_id',
        FK_LEAVE_TYPE_ID: 1,
        DAY: { $ifNull: ['$leaveTransactionQty.DAY', 0] },
        HOUR: { $ifNull: ['$leaveTransactionQty.HOUR', 0] },
        USED: { $ifNull: ['$leaveTransactionQty.USED', '0.0'] },
        QTY: 1,
        YEAR: 1,
        FK_EMPLOYEE_TYPE_ID: 1,
        LEAVE_NAME: { $arrayElemAt: ['$leaveType.LEAVE_NAME', 0] }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: leaveTypeDetails,
  });
});

exports.getLeave = catchAsync(async (req, res, next) => {

  // id_line_user

  // console.log("req.params.id"+req.params.id)



  try {

    if (!req.params.id) {
      return next(new AppError("User ID parameter is missing", 400));
    }

    const user = await UsersModel.findOne({ line_userid: req.params.id });

    if (!user) {
      return next(new AppError("User not found", 404));
    }


    // แปลง ObjectId ของ leave_type เป็น String
    const leaveTransactionsForMigration = await LeaveTransactionModel.find({ fk_user_id: user._id });

    for (const transaction of leaveTransactionsForMigration) {
      if (transaction.leave_type instanceof mongoose.Types.ObjectId) {
        transaction.leave_type = transaction.leave_type.toString();
        await transaction.save();
      }
    }

    // แปลง ObjectId ของ user._id เป็น String
    const userIdString = user._id.toString();
    console.log(userIdString)

    const leaveTransactions = await LeaveTransactionModel.find({ fk_user_id: userIdString })
      .populate('leave_type', 'leave_name')
      .sort({ _id: -1 });

    if (leaveTransactions.length === 0) {
      return next(new AppError("No leave transactions found for this user", 404));
    }

    res.status(200).json({
      status: 'success',
      data: leaveTransactions,
    });

  } catch (err) {

    return next(new AppError("ERROR: " + err, 400));

  }

});

exports.updateLeaveDay = catchAsync(async (req, res, next) => {
  try {
    // Check if required fields are provided
    if (!req.body.year || !req.body.employeeType || !req.body.listData || req.body.listData.length === 0) {
      return next(new AppError("Please fill data", 400));
    }

    for await (let item of req.body.listData) {
      let leaveTypeDetail = await LeaveTypeDetailModel.findOne({
        FK_LEAVE_TYPE_ID: item.id,
        YEAR: req.body.year,
        FK_EMPLOYEE_TYPE_ID: req.body.employeeType
      });

      if (leaveTypeDetail) {
        leaveTypeDetail.QTY = item.qty;
        await leaveTypeDetail.save();
      } else {
        await LeaveTypeDetailModel.create({
          FK_LEAVE_TYPE_ID: item.id,
          QTY: item.qty,
          YEAR: req.body.year,
          FK_EMPLOYEE_TYPE_ID: req.body.employeeType
        });
      }
    }

    res.status(200).json({ status: 'updated success', data: req.body });
  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.cancelLeave = catchAsync(async (req, res, next) => {
  try {
    console.log('req.params', req.params);
    if (!req.params.id) {
      return next(new AppError("Please provide a valid ID", 400));
    }

    // ตรวจสอบรูปแบบของ ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError("Invalid ID format", 400));
    }

    // แปลงค่า req.params.id ให้เป็น ObjectId
    const leaveTransactionId = mongoose.Types.ObjectId(req.params.id);

    // อัปเดตสถานะของ leave transaction
    const updatedLeaveTransaction = await LeaveTransactionModel.findByIdAndUpdate(
      leaveTransactionId,
      {
        is_active: 0,
        updated_date: moment().format('YYYY-MM-DD HH:mm:ss')
      },
      { new: true }
    );

    if (!updatedLeaveTransaction) {
      return next(new AppError("Leave transaction not found", 404));
    }

    const dataLeaveTransaction = await LeaveTransactionModel.findById(leaveTransactionId);

    if (dataLeaveTransaction && dataLeaveTransaction.leave_type) {
      // ถ้าต้องการจัดการ leave transaction quantity, เพิ่มโค้ดที่จำเป็นตรงนี้
      // เช่น การอัปเดต leave transaction quantity ของผู้ใช้
    }

    res.status(200).json({ status: 'updated success' });

  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.migrateDatatest = catchAsync(async (req, res, next) => {
  try {
    if (req.files.length < 1) {
      return next(new AppError("Please fill data", 400));
    }

    var fileBuffer = req.files[0].buffer;
    var s = new Readable();
    s.push(fileBuffer);
    s.push(null);

    var rows = await readXlsxFile(s);

    resbody = [];

    for (let e of rows.slice(2)) {
      var body = {};
      var intcol = 0;

      // ลำดับ	รหัส	สังกัด	ชื่อ-สกุล	ชื่อเล่น	ตำแหน่ง	ประเภทพนักงาน	ฝ่าย	สถานที่ปฏิบัติงาน	วันที่เริ่มงาน	วันที่ผ่านโปร	อายุงาน
										
      body.index = (e[intcol] + '').trim(); intcol++; // ลำดับ
      body.code = (e[intcol] + '').trim(); intcol++; // รหัส
      body.department = (e[intcol] + '').trim(); intcol++; // สังกัด
      body.name = (e[intcol] + '').trim(); intcol++; // ชื่อ-สกุล
      body.nickname = (e[intcol] + '').trim(); intcol++; // ชื่อเล่น
      body.position = (e[intcol] + '').trim(); intcol++; // ตำแหน่ง
      body.employeeType = (e[intcol] + '').trim(); intcol++; // ประเภทพนักงาน
      body.division = (e[intcol] + '').trim(); intcol++; // ฝ่าย
      body.workplace = (e[intcol] + '').trim(); intcol++; // สถานที่ปฏิบัติงาน
      body.startDate = (e[intcol] + '').trim(); intcol++; // วันที่เริ่มงาน
      body.passedDate = (e[intcol] + '').trim(); intcol++; // วันที่ผ่านโปร

      //ฟังก์ชั่นคำนวนอายุงาน
      var date1 = new Date(body.startDate);
      var date2 = new Date(body.passedDate);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
      body.diffDays_days = diffDays;
      body.diffDays_months = diffDays/30;
      body.diffDays_years = diffDays/365;

      resbody.push(body);
    }

    // คุณสามารถจัดการข้อมูลที่อ่านมาได้ที่นี่
    res.status(200).json({
      status: 'success',
      data: resbody
    });
  } catch (err) {
    next(err);
  }
});


exports.migrateData = catchAsync(async (req, res, next) => {
  try {
    if (req.files.length < 1) {
      return next(new AppError("Please fill data", 400));
    }

    var fileBuffer = req.files[0].buffer;
    var s = new Readable();
    s.push(fileBuffer);
    s.push(null);

    var rows = await readXlsxFile(s);

    // for (let e of rows.slice(2)) {
    //   var body = {};
    //   var intcol = 0;

    //   body.index = (e[intcol] + '').trim(); intcol++;
    //   body.EMP_CODE = (e[intcol] + '').trim(); intcol++;
    //   body.AFFILIATION = (e[intcol] + '').trim(); intcol++;
    //   body.AFFILIATION_SUB = (e[intcol] + '').trim(); intcol++;
    //   body.TITLE = (e[intcol] + '').trim(); intcol++;
    //   var fullname = (e[intcol] + '').trim();
    //   body.fullname = fullname; intcol++;
    //   body.POSITION = (e[intcol] + '').trim(); intcol++;
    //   body.phone = (e[intcol] + '').trim();
    //   console.log(body)
    // }

    var results = [];

    for (let e of rows.slice(2)) {
      var body = {};
      var lstLeaveData = [];
      try {
        var intcol = 1;
        body.EMP_CODE = (e[intcol] + '').trim(); intcol++;
        body.AFFILIATION = (e[intcol] + '').trim(); intcol++;
        body.AFFILIATION_SUB = (e[intcol] + '').trim(); intcol++;
        body.TITLE = (e[intcol] + '').trim(); intcol++;
        var fullname = (e[intcol] + '').trim();
        body.fullname = fullname; intcol++;
        body.POSITION = (e[intcol] + '').trim(); intcol++;
        body.phone = (e[intcol] + '').trim();

        let empType = await EmployeeTypeModel.findOne({ employee_type_name: e[intcol].trim() });
        body.FK_EMPLOYEE_TYPE_ID = empType ? empType._id : null; intcol++;

        body.DEPARTMENT = (e[intcol] + '').trim(); intcol++;
        body.FACTION = (e[intcol] + '').trim(); intcol++;
        body.WORK_LOCATION = (e[intcol] + '').trim(); intcol++;

        try {
          let startWork = (e[intcol] + '').trim();
          if (startWork.indexOf('/') > -1) {
            var parts = startWork.split('/');
            if (parts.length === 3) {
              body.START_WORK = moment(parts[2] + '-' + parts[1] + '-' + parts[0], 'YYYY-MM-DD').format('YYYY-MM-DD');
            } else {
              throw new Error('Invalid date format');
            }
          } else {
            body.START_WORK = moment(startWork, 'YYYY-MM-DD').isValid() ? moment(startWork, 'YYYY-MM-DD').format('YYYY-MM-DD') : null;
          }
        } catch (err2) {
          body.START_WORK = null;
        }
        intcol++;

        const processLeaveData = async (leaveName, dayIndex, hourIndex) => {
          const leaveDAY = isNaN(Number(e[dayIndex])) ? 0 : Number(e[dayIndex]);
          const leaveHOUR = isNaN(Number(e[hourIndex])) ? 0 : Number(e[hourIndex]);
          let leaveType = await LeaveTypeModel.findOne({ leave_name: leaveName });
          lstLeaveData.push({ LEAVE_NAME: leaveName, DAY: leaveDAY, HOUR: leaveHOUR, FK_LEAVE_TYPE_ID: leaveType ? leaveType._id : null });
          intcol += 2;
        };

        await processLeaveData('ลาป่วย', intcol, intcol + 1);
        await processLeaveData('ลากิจ', intcol, intcol + 1);
        await processLeaveData('ลาหยุดพักผ่อนประจำปี', intcol, intcol + 1);
        await processLeaveData('ลาไม่รับค่าจ้าง', intcol, intcol + 1);

        const processLeaveDataSpecial = async (leaveName, index) => {
          const leaveDAY = (e[index] + '').split('.').length > 0 ? Number((e[index] + '').split('.')[0]) : 0;
          const leaveHOUR = (e[index] + '').split('.').length > 1 ? Number((e[index] + '').split('.')[1]) : 0;
          let leaveType = await LeaveTypeModel.findOne({ leave_name: leaveName });
          lstLeaveData.push({ LEAVE_NAME: leaveName, DAY: leaveDAY, HOUR: leaveHOUR, FK_LEAVE_TYPE_ID: leaveType ? leaveType._id : null });
          intcol++;
        };

        await processLeaveDataSpecial('ลากิจ(พิเศษ)', intcol);
        await processLeaveDataSpecial('ลาเพื่ออุปสมบท', intcol);
        await processLeaveDataSpecial('ลาคลอด', intcol);
        intcol++;
        var advancedLeaveApprover = (e[intcol] + '').trim();

        let user = await UsersModel.findOne({ EMP_CODE: body.EMP_CODE });
        var userID = null;

        if (user) {
          userID = user._id;
          Object.assign(user, body);
          user.UPDATED_BY = '999999';
          user.UPDATED_DATE = moment().format('YYYY-MM-DD HH:mm:ss');
          await user.save();
        } else {
          body.is_active = 1;
          body.CREATED_BY = '999999';
          body.CREATED_DATE = moment().format('YYYY-MM-DD HH:mm:ss');
          user = new UsersModel(body);
          await user.save();
          userID = user._id;
        }

        if (userID) {
          if (fullname === advancedLeaveApprover) {
            body.ADVANCED_LEAVE_APPROVER = userID;
          } else {
            let approver = await UsersModel.findOne({ fullname: advancedLeaveApprover, is_active: 1 });
            body.ADVANCED_LEAVE_APPROVER = approver ? approver._id : null;
          }

          user.ADVANCED_LEAVE_APPROVER = body.ADVANCED_LEAVE_APPROVER;
          await user.save();

          for await (var dataLeave of lstLeaveData) {
            let data = {
              fk_user_id: userID,
              FK_LEAVE_TYPE_ID: dataLeave.FK_LEAVE_TYPE_ID,
              YEAR: moment().format('YYYY'),
              HOUR: dataLeave.HOUR,
              DAY: dataLeave.DAY,
            };

            let leaveTransactionQty = await LeaveTransactionQtyModel.findOne({
              fk_user_id: data.fk_user_id,
              FK_LEAVE_TYPE_ID: data.FK_LEAVE_TYPE_ID,
              YEAR: data.YEAR,
            });

            if (leaveTransactionQty) {
              leaveTransactionQty.HOUR = data.HOUR;
              leaveTransactionQty.DAY = data.DAY;
              await leaveTransactionQty.save();
            } else {
              let newLeaveTransactionQty = new LeaveTransactionQtyModel(data);
              await newLeaveTransactionQty.save();
            }
          }
          results.push(null);
        }
      } catch (ex) {
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
    } else {
      res.status(200).json({
        status: "import success",
      });
    }
  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});



exports.exportPDFLeaveOffsiteWork = catchAsync(async (req, res, next) => {
  const { leaveTransactionID, type } = req.query;

  if (!leaveTransactionID) {
    console.log('No leaveTransactionID provided');
    return next(new AppError("Not found data", 400));
  }

  console.log('leaveTransactionID:', leaveTransactionID);

  try {
    const leaveTransactionCheck = await LeaveTransactionModel.findOne({ _id: new ObjectId(leaveTransactionID) }).populate('fk_user_id');
    console.log('LeaveTransaction found:', leaveTransactionCheck);

    if (!leaveTransactionCheck) {
      console.log('LeaveTransaction not found for ID:', leaveTransactionID);
      return next(new AppError("Not found data", 400));
    }

    const user = leaveTransactionCheck.fk_user_id;
    console.log('User:', user);

    if (!user) {
      console.log('User not found for fk_user_id:', leaveTransactionCheck.fk_user_id);
      return next(new AppError("Not found user data", 400));
    }

    const record = {
      ...leaveTransactionCheck._doc,
      user: user,
      userHead: await UsersModel.findOne({ _id: user.advanced_leave_approver })
    };

    const size = [595, 841];
    const doc = new PDFGenerator({ size: size });
    doc.fillColor('black');
    doc.font("img/template/angsa.ttf");
    doc.fontSize(16);
    const templatePath = "img/template/ใบอนุญาตออกนอกสถานที่.jpg";
    doc.image(templatePath, 0, 0, { fit: [595, 841] });

    // #1
    doc.text(record.user.fullname ? record.user.fullname.split(' ')[0] : '', 86, 201, {
      width: 95,
      lineBreak: false,
      align: 'center',
    });
    doc.text(record.user.fullname ? record.user.fullname.split(' ')[1] ?? '' : '', 200, 201, {
      width: 86,
      lineBreak: false,
      align: 'center',
    });
    doc.text(record.user.emp_code, 345, 201, {
      width: 170,
      lineBreak: false,
      align: 'center',
    });

    // #2
    doc.text(record.user.position, 110, 223, {
      width: 175,
      lineBreak: false,
      align: 'center',
    });
    doc.text(record.user.department, 340, 223, {
      width: 175,
      lineBreak: false,
      align: 'center',
    });

    // #3
    doc.text(record.user.faction, 100, 246, {
      width: 390,
      lineBreak: true,
      align: 'center',
    });

    // #4
    doc.text(record.change_work_location == 'อื่นๆ' ? record.other_work_location : record.change_work_location, 70, 314, {
      width: 450,
      lineGap: 4,
      lineBreak: true,
      align: 'left',
    });

    // #5
    doc.text(record.leave_to_date ? moment(record.leave_to_date).format('DD/MM/YYYY') : '', 105, 359, {
      width: 120,
      lineBreak: true,
      align: 'center',
    });
    doc.text(record.time_start ? moment(record.time_start).utc().format('HH.mm') : '', 270, 359, {
      width: 90,
      lineBreak: true,
      align: 'center',
    });
    doc.text(record.time_end ? moment(record.time_end).utc().format('HH.mm') : '', 390, 359, {
      width: 115,
      lineBreak: true,
      align: 'center',
    });

    // #6
    doc.text(record.car, 135, 382, {
      width: 220,
      lineBreak: true,
      align: 'center',
    });
    doc.text(record.license_plate, 395, 382, {
      width: 115,
      lineBreak: true,
      align: 'center',
    });

    // #7
    doc.text('', 70, 450, {
      indent: 115,
      lineGap: 4,
      lineBreak: true,
      align: 'left',
    });

    // #8
    doc.text(record.user.fullname, 133, 563, {
      width: 100,
      lineBreak: true,
      align: 'center',
    });
    doc.text(record.userHead ? record.userHead.fullname : '', 350, 563, {
      width: 100,
      lineBreak: true,
      align: 'center',
    });

    // #9
    doc.text(moment(new Date()).format('DD/MM/YYYY'), 133, 593, {
      width: 100,
      lineBreak: true,
      align: 'center',
    });
    doc.text(moment(new Date()).format('DD/MM/YYYY'), 350, 593, {
      width: 100,
      lineBreak: true,
      align: 'center',
    });

    let stream;
    if (type === "file") {
      doc.pipe(res);
    } else {
      stream = doc.pipe(new Base64Encode());
    }
    let finalString = '';

    doc.end();

    if (type === "file") {
      return res;
    } else {
      stream.on('data', function (chunk) {
        finalString += chunk;
      });

      stream.on('end', function () {
        res.json({
          status: "OK",
          data: finalString
        });
      });
    }
  } catch (error) {
    console.error('Error during data retrieval or processing:', error);
    return next(new AppError("An error occurred while processing the request", 500));
  }
});

exports.exportPDFLeave = catchAsync(async (req, res, next) => {
  const { leaveTransactionID, type } = req.query;

  if (!leaveTransactionID || !mongoose.Types.ObjectId.isValid(leaveTransactionID)) {
    return next(new AppError("Invalid or missing leaveTransactionID", 400));
  }

  const leaveTransaction = await LeaveTransactionModel.findById(new mongoose.Types.ObjectId(leaveTransactionID))
    .populate('fk_user_id')
    .exec();

  if (!leaveTransaction) {
    return next(new AppError("Not found data", 400));
  }

  const user = leaveTransaction.fk_user_id;
  let leaveType;
  if (mongoose.Types.ObjectId.isValid(leaveTransaction.leave_type)) {
    leaveType = await LeaveTypeModel.findById(leaveTransaction.leave_type).exec();
  } else {
    leaveType = await LeaveTypeModel.findOne({ LEAVE_NAME: leaveTransaction.leave_type }).exec();
  }
  const employeeType = await EmployeeTypeModel.findById(user.FK_EMPLOYEE_TYPE_ID).exec();
  const data = {
    ...leaveTransaction.toObject(),
    LEAVE_NAME: leaveType ? leaveType.LEAVE_NAME : '',
    EMPLOYEE_TYPE_NAME: employeeType ? employeeType.EMPLOYEE_TYPE_NAME : '',
    UHEADFULLNAME: user.ADVANCED_LEAVE_APPROVER,
    fullname: user.fullname,
    EMP_CODE: user.EMP_CODE,
    POSITION: user.POSITION,
    DEPARTMENT: user.DEPARTMENT,
    FACTION: user.FACTION,
    WORK_LOCATION: user.WORK_LOCATION,
    START_WORK: user.START_WORK,
    phone: user.phone,
    email: user.email,
  };

  const doc = new PDFGenerator({ size: [595, 841] });
  doc.fillColor('black').font("img/template/angsa.ttf").fontSize(16);
  doc.image("img/template/ใบลาหยุดงาน.jpg", 0, 0, { fit: [595, 841] });

  // #1
  doc.text(moment(new Date()).format('DD/MM/YYYY'), 380, 193, {
    width: 120,
    lineBreak: false,
    align: 'center',
  });

  // #2
  doc.text(data.UHEADFULLNAME, 130, 220, {
    width: 180,
    lineBreak: false,
    align: 'center',
  });

  // #3
  doc.text(data.fullname, 135, 248, {
    width: 150,
    lineBreak: true,
    align: 'center',
  });
  doc.text(data.EMP_CODE, 350, 248, {
    width: 150,
    lineBreak: true,
    align: 'center',
  });

  // #4
  doc.text(data.POSITION, 140, 277, {
    width: 140,
    lineBreak: true,
    align: 'center',
  });
  doc.text(data.DEPARTMENT, 340, 277, {
    width: 150,
    lineBreak: true,
    align: 'center',
  });

  // #5
  doc.text(data.FACTION, 125, 306, {
    width: 165,
    lineBreak: true,
    align: 'center',
  });
  doc.text(data.WORK_LOCATION, 360, 306, {
    width: 135,
    lineBreak: true,
    align: 'center',
  });

  // #6
  doc.text(data.LEAVE_NAME, 165, 387, {
    width: 325,
    lineBreak: true,
    align: 'center',
  });

  // #7
  doc.text(data.leave_reason, 170, 415, {
    width: 320,
    lineGap: 2,
    lineBreak: true,
    align: 'left',
  });

  // #8
  doc.text(data.leave_to_date ? moment(data.leave_to_date).format('DD/MM/YYYY') : '', 155, 475, {
    width: 150,
    lineBreak: true,
    align: 'center',
  });
  doc.text(data.time_start ? moment(data.time_start, "HH:mm").utc().format('HH.mm') : '', 330, 475, {
    width: 150,
    lineBreak: true,
    align: 'center',
  });

  // #9
  doc.text(data.leave_end_date ? moment(data.leave_end_date).format('DD/MM/YYYY') : '', 155, 505, {
    width: 150,
    lineBreak: true,
    align: 'center',
  });
  doc.text(data.time_end ? moment(data.time_end, "HH:mm").utc().format('HH.mm') : '', 330, 505, {
    width: 150,
    lineBreak: true,
    align: 'center',
  });

  var useDay = 0;
  var useHour = 0;
  var now = moment(moment(data.leave_to_date).format('YYYY-MM-DD') + ' ' + moment(data.time_start, "HH:mm").utc().format('HH:mm'));
  var end = moment(moment(data.leave_end_date).format('YYYY-MM-DD') + ' ' + moment(data.time_end, "HH:mm").utc().format('HH:mm'));
  var duration = moment.duration(end.diff(now));
  var gethours = duration.asHours();
  var day = 0;
  var timesplit = 0;
  if (gethours >= 24) {
    day = Number(((gethours / 24) + '').split('.')[0]);
    timesplit = (gethours - (24 * day));
    day = timesplit >= 8 ? Number(day) + 1 : day;
    timesplit = timesplit >= 8 ? 0 : timesplit;
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
  });
  doc.text(useHour, 220, 534, {
    width: 80,
    lineBreak: true,
    align: 'center',
  });

  // #11
  doc.text(data.fullname, 130, 586, {
    width: 95,
    lineBreak: true,
    align: 'center',
  });
  doc.text(data.UHEADFULLNAME, 345, 586, {
    width: 95,
    lineBreak: true,
    align: 'center',
  });

  // #12
  doc.text(moment(new Date()).format('DD/MM/YYYY'), 130, 614, {
    width: 95,
    lineBreak: true,
    align: 'center',
  });
  doc.text(moment(new Date()).format('DD/MM/YYYY'), 345, 614, {
    width: 95,
    lineBreak: true,
    align: 'center',
  });

  var stream = null;
  if (type == "file") {
    doc.pipe(res);
  } else {
    stream = doc.pipe(new Base64Encode());
  }
  var finalString = ''; // contains the base64 string

  doc.end();

  if (type == "file") {
    return res;
  } else {
    stream.on('data', function (chunk) {
      finalString += chunk;
    });

    stream.on('end', function () {
      res.json({
        status: "OK",
        data: finalString
      });
    });
  }
});


exports.createLeave = catchAsync(async (req, res, next) => {
  // console.log('req.rateLimit', req.rateLimit);

  let body;
  try {
    body = JSON.parse(req.body.data);
  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      message: 'รูปแบบข้อมูลไม่ถูกต้อง',
    });
  }

  if (
    !body.fk_user_id ||
    !body.LEAVE_TYPE ||
    !body.LEAVE_REASON ||
    !body.LEAVE_TO_DATE ||
    !body.TIME_START ||
    !body.LEAVE_END_DATE ||
    !body.TIME_END
  ) {
    return res.status(400).json({
      status: 'fail',
      message: 'ข้อมูลที่จำเป็นไม่ครบถ้วน',
    });
  }

  var useDay = 0;
  var useHour = 0;
  var now = moment(body.LEAVE_TO_DATE + ' ' + body.TIME_START, 'YYYY-MM-DD HH:mm');
  var end = moment(body.LEAVE_END_DATE + ' ' + body.TIME_END, 'YYYY-MM-DD HH:mm');
  if (!now.isValid() || !end.isValid()) {
    return res.status(400).json({
      status: 'fail',
      message: 'ข้อมูลที่จำเป็นไม่ครบถ้วน',
    });
  } else {
    var duration = moment.duration(end.diff(now));
    var gethours = duration.asHours();
    var day = 0;
    var timesplit = 0;
    if (gethours >= 24) {
      day = Math.floor(gethours / 24);
      timesplit = gethours - (24 * day);
      day = timesplit >= 8 ? day + 1 : day;
      timesplit = timesplit >= 8 ? 0 : timesplit;
    } else if (gethours >= 8) {
      day = 1;
      timesplit = 0;
    } else {
      timesplit = gethours;
    }
    useDay = day;
    useHour = timesplit;
  }

  let leaveCode = '';
  const runningNumber = await RunningNumberModel.findOneAndUpdate(
    { 
      type: 'LF', 
      date: moment().format('DD'), 
      month: moment().format('MM'), 
      year: moment().format('YYYY') 
    },
    { 
      $inc: { number: 1 } 
    },
    { 
      new: true, 
      upsert: true 
    }
  );

  if (runningNumber) {
    leaveCode = `LF${runningNumber.date}${runningNumber.month}${runningNumber.year}${String(runningNumber.number).padStart(3, '0')}`;
  }

  leaveType = String(body.LEAVE_TYPE)
  const newLeaveTransaction = new LeaveTransactionModel({
    fk_user_id: new ObjectId(body.fk_user_id),
    leave_type: leaveType,
    leave_reason: body.LEAVE_REASON,
    leave_to_date: body.LEAVE_TO_DATE,
    time_start: body.TIME_START,
    leave_end_date: body.LEAVE_END_DATE,
    time_end: body.TIME_END,
    file_url: req.files.leave ? req.files.leave[0].path : null,
    status: 1,
    is_active: 1,
    created_by: new ObjectId(body.fk_user_id),
    created_date: new Date(),
    leave_code: leaveCode
  });

  const user = await UsersModel.findById(body.fk_user_id);
  if (!user || !user.is_active || !user.is_verify) {
    return next(new AppError("User not found or inactive", 400));
  }

  await newLeaveTransaction.save();

  // console.log('advanced_leave_approver', body.advanced_leave_approver);

  const approver = await UsersModel.findOne({ advanced_leave_approver: body.advanced_leave_approver });

  // console.log('approver', approver);

  if (!approver || !approver.is_active || !approver.is_verify) {
    await LeaveTransactionModel.findByIdAndDelete(newLeaveTransaction._id);
    return next(new AppError("ERROR: Not found data approver.", 400));
  }

  // ส่งอนุมัติ
  console.log("ส่งอนุมัติ ",'newLeaveTransaction', newLeaveTransaction._id);
  console.log('body', body);
  console.log('approver', approver);
  console.log('useDay', useDay);
  console.log('useHour', useHour);
  console.log('ส่งอนุมัติเรียบร้อย', newLeaveTransaction);
  // await sendToApprover(newLeaveTransaction._id, body, approver, useDay, useHour);

  res.status(201).json({
    status: 'insert data success',
    // data: newLeaveTransaction
  });

});

exports.createRetire = catchAsync(async (req, res, next) => {
  const body = req.body.data;

  if (!body.fk_user_id || !body.LEAVE_TO_DATE || !body.LEAVE_END_DATE) {
    return next(new AppError("Please fill data", 400));
  }

  const currentDate = moment(new Date());
  const date = currentDate.format('DD');
  const month = currentDate.format('MM');
  const year = currentDate.format('YYYY');

  let runningNumber = await RunningNumberModel.findOneAndUpdate(
    { type: 'RF', date: parseInt(date), month: parseInt(month), year: parseInt(year) },
    { $inc: { number: 1 }, updated_date: new Date() },
    { new: true, upsert: true }
  );

  const leaveCode = `RF${date}${month}${year}${String(runningNumber.number).padStart(3, '0')}`;

  const newLeaveTransaction = new LeaveTransactionModel({
    fk_user_id: body.fk_user_id,
    LEAVE_REASON: body.LEAVE_REASON,
    LEAVE_TO_DATE: body.LEAVE_TO_DATE,
    LEAVE_END_DATE: body.LEAVE_END_DATE,
    FUND_TYPE: body.FUND_TYPE,
    FUND_NUMBER: body.FUND_NUMBER,
    FLAG_CERTIFICATE: body.FLAG_CERTIFICATE,
    STATUS: 1,
    is_active: 1,
    IS_RETIRE: 1,
    CREATED_BY: body.fk_user_id,
    CREATED_DATE: currentDate.toISOString(),
    LEAVE_CODE: leaveCode,
  });

  const savedLeaveTransaction = await newLeaveTransaction.save();

  // Debug: Check if the user exists
  const user = await UsersModel.findOne({ _id: body.fk_user_id, is_active: 1, is_verify: 1 });
  if (!user) {
    return next(new AppError("User not found or not active/verified", 404));
  }

  const approver = await UsersModel.findOne({ _id: body.ADVANCED_LEAVE_APPROVER, is_active: 1, is_verify: 1 });

  // Debug: Log approver data
  console.log("Approver data:", approver);

  if (approver) {
    await sendToApproverRetire(savedLeaveTransaction._id, body, approver);
    res.status(201).json({
      status: 'insert data success',
    });
  } else {
    return next(new AppError("Approver not found", 404));
  }
});

exports.createLeaveWorkOutSide = catchAsync(async (req, res, next) => {
  const body = req.body.data;

  if (!req.files.leave || !body.fk_user_id) {
    return next(new AppError("Please fill data", 400));
  }

  const currentDate = moment(new Date());
  const date = currentDate.format('DD');
  const month = currentDate.format('MM');
  const year = currentDate.format('YYYY');

  let runningNumber = await RunningNumberModel.findOneAndUpdate(
    { type: 'LC', date: parseInt(date), month: parseInt(month), year: parseInt(year) },
    { $inc: { number: 1 }, updated_date: new Date() },
    { new: true, upsert: true }
  );

  const leaveCode = `LC${date}${month}${year}${String(runningNumber.number).padStart(3, '0')}`;

  const newLeaveTransaction = new LeaveTransactionModel({
    fk_user_id: body.fk_user_id,
    LEAVE_TO_DATE: body.LEAVE_TO_DATE,
    TIME_START: body.TIME_START,
    TIME_END: body.TIME_END,
    CHANGE_WORK_LOCATION: body.CHANGE_WORK_LOCATION,
    CAR: body.CAR,
    LICENSE_PLATE: body.LICENSE_PLATE,
    OTHER_WORK_LOCATION: body.OTHER_WORK_LOCATION,
    IS_WORK_OUTSIDE: 1,
    FILE_URL: req.files.leave[0].path,
    STATUS: 1,
    is_active: 1,
    CREATED_BY: body.fk_user_id,
    CREATED_DATE: currentDate.toISOString(),
    LEAVE_CODE: leaveCode,
  });

  const savedLeaveTransaction = await newLeaveTransaction.save();

  const approver = await UsersModel.findOne({ _id: body.ADVANCED_LEAVE_APPROVER, is_active: 1, is_verify: 1 });

  if (approver) {
    await sendToApproverLeaveWorkOutSide(savedLeaveTransaction._id, body, approver);
    res.status(201).json({
      status: 'insert data success',
    });
  } else {
    return next(new AppError("Not found data user approver", 400));
  }
});

exports.reject = catchAsync(async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new AppError("Please fill data", 400));
    }

    const leaveTransaction = await LeaveTransactionModel.findById(req.params.id);
    if (!leaveTransaction) {
      return next(new AppError("Leave transaction not found", 404));
    }

    const user = await UsersModel.findOne({ _id: leaveTransaction.fk_user_id, is_active: 1, is_verify: 1 });
    if (!user) {
      return next(new AppError("User not found or inactive", 404));
    }

    const approver = await UsersModel.findOne({ _id: user.advanced_leave_approver, is_active: 1, is_verify: 1 });
    if (!approver) {
      return next(new AppError("Approver not found or inactive", 404));
    }

    leaveTransaction.status = '3';
    leaveTransaction.primary_approve = '0';
    leaveTransaction.primary_approve_description = req.params.reason ? req.params.reason : '-';
    leaveTransaction.primary_approved_date = moment().format('YYYY-MM-DD HH:mm:ss');
    leaveTransaction.updated_date = moment().format('YYYY-MM-DD HH:mm:ss');

    await leaveTransaction.save();

    // await sendRejectToEmployee(user, approver, leaveTransaction);
    res.status(200).json({ status: 'updated success' });

  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.approve = catchAsync(async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new AppError("Please fill data", 400));
    }

    const dataLeaveTransaction = await LeaveTransactionModel.findById(req.params.id).exec();
    if (!dataLeaveTransaction) {
      return next(new AppError("Leave transaction not found", 404));
    }

    const dataUser = await UsersModel.findOne({ _id: dataLeaveTransaction.fk_user_id, is_active: 1, is_verify: 1 }).exec();
    if (!dataUser) {
      return next(new AppError("User not found or not active/verified", 404));
    }

    const dataApprover = await UsersModel.findOne({ _id: dataUser.advanced_leave_approver, is_active: 1, is_verify: 1 }).exec();
    if (!dataApprover) {
      return next(new AppError("Approver not found or not active/verified", 404));
    }

    if (dataLeaveTransaction.leave_type) {
      const body = dataLeaveTransaction;
      let useDay = 0;
      let useHour = 0;
      const now = moment(body.leave_to_date).utc();
      const end = moment(body.leave_end_date).utc();
      const duration = moment.duration(end.diff(now));
      const gethours = duration.asHours();
      let day = 0;
      let timesplit = 0;

      if (gethours >= 24) {
        day = Math.floor(gethours / 24);
        timesplit = gethours - (24 * day);
        day = timesplit >= 8 ? day + 1 : day;
        timesplit = timesplit >= 8 ? 0 : timesplit;
      } else if (gethours >= 8) {
        day = 1;
        timesplit = 0;
      } else {
        timesplit = gethours;
      }
      useDay = day;
      useHour = timesplit;

      const dataLeaveTypeDetail = await LeaveTypeDetailModel.findOne({
        fk_employee_type_id: dataUser.fk_employee_type_id,
        fk_leave_type_id: body.leave_type,
        year: moment().year()
      }).exec();

      if (!dataLeaveTypeDetail) {
        console.error(`Leave type detail not found for employee_type_id: ${dataUser.fk_employee_type_id}, leave_type_id: ${body.leave_type}, year: ${moment().year()}`);
        return next(new AppError("Leave type detail not found", 404));
      }

      let dataLeaveTransactionQty = await LeaveTransactionQtyModel.findOne({
        fk_user_id: body.fk_user_id,
        fk_leave_type_id: body.leave_type,
        year: moment().year()
      }).exec();

      if (dataLeaveTransactionQty) {
        dataLeaveTransactionQty.hour += timesplit;
        dataLeaveTransactionQty.day += day;

        if (dataLeaveTransactionQty.hour >= 8) {
          dataLeaveTransactionQty.day += 1;
          dataLeaveTransactionQty.hour -= 8;
        }

        if (dataLeaveTypeDetail.qty < (dataLeaveTransactionQty.day + (dataLeaveTransactionQty.hour / 10))) {
          return next(new AppError("Leave day not enough", 400));
        }

        await dataLeaveTransactionQty.save();
      } else {
        if (dataLeaveTypeDetail.qty < day) {
          return next(new AppError("Leave day not enough", 400));
        }

        dataLeaveTransactionQty = new LeaveTransactionQtyModel({
          fk_user_id: body.fk_user_id,
          fk_leave_type_id: body.leave_type,
          year: moment().year(),
          hour: timesplit,
          day: day
        });

        await dataLeaveTransactionQty.save();
      }
    }

    dataLeaveTransaction.status = 2;
    dataLeaveTransaction.primary_approve = 1;
    dataLeaveTransaction.primary_approved_date = moment().toDate();
    dataLeaveTransaction.updated_date = moment().toDate();

    await dataLeaveTransaction.save();

    if (dataLeaveTransaction.is_retire) {
      dataUser.last_work = dataLeaveTransaction.leave_to_date;
      await dataUser.save();
    }

    await sendApproveToEmployee(dataUser, dataApprover, dataLeaveTransaction);
    res.status(200).json({ status: 'updated success' });

  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.rejectNoAuth = catchAsync(async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new AppError("Please fill data", 400));
    }

    const leaveTransaction = await LeaveTransactionModel.findById(req.params.id);

    if (!leaveTransaction) {
      return next(new AppError("Leave transaction not found", 404));
    }


    const user = await UsersModel.findOne({
      _id: leaveTransaction.fk_user_id,
      is_active: 1,
      is_verify: 1
    });

    if (!user) {
      return next(new AppError("User not found or not active/verified", 404));
    }

    const approver = await UsersModel.findOne({
      line_userid: req.params.approver,
      is_active: 1,
      is_verify: 1
    });

    if (!approver) {
      return next(new AppError("Approver not found or not active/verified", 404));
    }

    if (user.advanced_leave_approver.toString() === approver._id.toString()) {
      leaveTransaction.status = '3';
      leaveTransaction.primary_approve = '0';
      leaveTransaction.primary_approve_description = req.params.reason || '-';
      leaveTransaction.primary_approved_date = moment().format('YYYY-MM-DD HH:mm:ss');
      leaveTransaction.updated_date = moment().format('YYYY-MM-DD HH:mm:ss');

      await leaveTransaction.save();

      await sendRejectToEmployee(user, approver, leaveTransaction);

      res.status(200).json({ status: 'updated success', leaveTransaction: leaveTransaction });
    } else {
      return next(new AppError("Not match approver", 400));
    }
  } catch (err) {
    return next(new AppError("ERROR: " + err.message, 400));
  }
});

exports.approveNoAuth = catchAsync(async (req, res, next) => {
  try {
    if (!req.params.id) {
      return next(new AppError("Please fill data", 400));
    }

    const leaveTransaction = await LeaveTransactionModel.findById(req.params.id);
    if (!leaveTransaction) {
      return next(new AppError("Leave transaction not found", 404));
    }

    const user = await UsersModel.findOne({
      _id: leaveTransaction.fk_user_id,
      is_active: 1,
      is_verify: 1
    });
    if (!user) {
      return next(new AppError("User not found or inactive", 404));
    }

    const approver = await UsersModel.findOne({ line_userid: req.params.approver, is_active: 1, is_verify: 1 });
    if (!approver) {
      return next(new AppError("Approver not found or inactive", 404));
    }

    if (leaveTransaction.leave_type) {
      const body = leaveTransaction;
      const start = moment(`${moment(body.leave_to_date).format('YYYY-MM-DD')} ${moment(body.time_start).utc().format('HH:mm')}`);
      const end = moment(`${moment(body.leave_end_date).format('YYYY-MM-DD')} ${moment(body.time_end).utc().format('HH:mm')}`);
      const duration = moment.duration(end.diff(start));
      let useDay = 0;
      let useHour = 0;

      const gethours = duration.asHours();
      if (gethours >= 24) {
        useDay = Math.floor(gethours / 24);
        useHour = gethours % 24 >= 8 ? 0 : gethours % 24;
        if (gethours % 24 >= 8) useDay += 1;
      } else if (gethours >= 8) {
        useDay = 1;
        useHour = 0;
      } else {
        useHour = gethours;
      }

      const leaveTypeDetail = await LeaveTypeDetailModel.findOne({
        FK_EMPLOYEE_TYPE_ID: user.fk_employee_type_id,
        FK_LEAVE_TYPE_ID: body.leave_type,
        YEAR: moment().format('YYYY')
      });

      const leaveTransactionQty = await LeaveTransactionQtyModel.findOne({
        fk_user_id: body.fk_user_id,
        FK_LEAVE_TYPE_ID: body.leave_type,
        YEAR: moment().format('YYYY')
      });

      console.log(leaveTransactionQty);

      if (leaveTransactionQty) {
        leaveTransactionQty.hour += useHour;
        leaveTransactionQty.day += useDay;

        if (leaveTransactionQty.hour >= 8) {
          leaveTransactionQty.day += 1;
          leaveTransactionQty.hour -= 8;
        }

        if (leaveTypeDetail.QTY < (leaveTransactionQty.day + leaveTransactionQty.hour / 10)) {
          return next(new AppError("Leave day not enough", 400));
        }

        await leaveTransactionQty.save();
      } else {
        if (leaveTypeDetail.QTY < useDay) {
          return next(new AppError("Leave day not enough", 400));
        }

        const newLeaveTransactionQty = new LeaveTransactionQtyModel({
          fk_user_id: body.fk_user_id,
          FK_LEAVE_TYPE_ID: body.leave_type,
          YEAR: moment().format('YYYY'),
          HOUR: useHour,
          DAY: useDay
        });

        await newLeaveTransactionQty.save();
      }
    }

    if (user.advanced_leave_approver.toString() === approver._id.toString()) {
      leaveTransaction.status = 2;
      leaveTransaction.primary_approve = '1';
      leaveTransaction.primary_approved_date = moment().format('YYYY-MM-DD HH:mm:ss');
      leaveTransaction.updated_date = moment().format('YYYY-MM-DD HH:mm:ss');

      await leaveTransaction.save();

      if (leaveTransaction.is_retire) {
        user.last_work = moment(leaveTransaction.leave_to_date).format('YYYY-MM-DD');
        await user.save();
      }

      // await sendApproveToEmployee(user, approver, leaveTransaction);

      res.status(200).json({ status: 'updated success' });
    } else {
      return next(new AppError("Not match approver", 400));
    }
  } catch (err) {
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
                  "text": `เมื่อวันที่ ${moment().format('DD/MM/YYYY')}`,
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

    // Fetch LINE token from the database
    const configLine = await ConfigLineModel.findOne();
    if (!configLine) {
      throw new Error("LINE token not found");
    }
    const linetoken = configLine.TOKEN;

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

      await axios.post('https://api.line.me/v2/bot/message/push', data2, {
        headers: {
          'Authorization': `Bearer ${linetoken}`,
        },
      }).catch(err => {
        console.log(`Error sending LINE message to approver: ${err}`);
      });
    } catch (err) {
      console.log(`Catch error sending LINE message to approver: ${err}`);
    }

    await axios.post('https://api.line.me/v2/bot/message/push', data, {
      headers: {
        'Authorization': `Bearer ${linetoken}`,
      },
    }).then(response => {
      return true;
    }).catch(err => {
      console.log('Error sending LINE message to employee:', err);
      return false;
    });

    return false;
  } catch (err) {
    console.log('Error:', err);
    return false;
  }
}

async function sendToApproverLeaveWorkOutSide(leaveTransactionID, body, dataApprover) {
  try {
    // Fetch the leave transaction data
    const dataLeaveTransaction = await LeaveTransactionModel.findById(leaveTransactionID);
    if (!dataLeaveTransaction) {
      throw new Error('Leave transaction not found');
    }

    // Fetch the Line token
    const configLine = await ConfigLineModel.findOne();
    if (!configLine) {
      throw new Error('Config Line not found');
    }
    const linetoken = configLine.token;

    console.log(`To LINEID : ${dataApprover.line_userid}`);

    const data = {
      to: dataApprover.line_userid,
      messages: [
        {
          type: 'flex',
          altText: 'this is a flex message',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'แจ้งเตือนการทำงานนอกสถานที่',
                  weight: 'bold',
                  size: 'lg',
                  align: 'center',
                },
                {
                  type: 'text',
                  text: `เมื่อวันที่ ${moment(new Date()).format('DD/MM/YYYY')}`,
                  weight: 'bold',
                  size: 'lg',
                  align: 'center',
                },
                {
                  type: 'text',
                  text: `เลขคำขอ: ${dataLeaveTransaction.LEAVE_CODE}`,
                  wrap: true,
                  color: '#666666',
                  size: 'md',
                  margin: 'xxl',
                  flex: 5,
                },
                {
                  type: 'text',
                  text: `สถานที่ทำงาน: ${dataLeaveTransaction.OTHER_WORK_LOCATION}\nเหตุผล: ${body.LEAVE_REASON}`,
                  wrap: true,
                  color: '#666666',
                  size: 'md',
                }
              ],
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  height: 'sm',
                  action: {
                    type: 'uri',
                    label: 'ดูข้อมูล',
                    uri: `${process.env.ADMINURL}/LeaveApprove?id=${dataLeaveTransaction._id}&approver=${dataApprover.line_userid}`,
                  },
                  color: '#00C4B5',
                  adjustMode: 'shrink-to-fit',
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'button',
                      style: 'primary',
                      height: 'sm',
                      action: {
                        type: 'postback',
                        label: 'รับทราบ',
                        data: `action=leaveinform&leavetransactionid=${dataLeaveTransaction._id}&approver=${dataApprover.line_userid}&status=2`,
                      },
                      color: '#4CD964',
                      adjustMode: 'shrink-to-fit',
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    };

    await axios.post('https://api.line.me/v2/bot/message/push', data, {
      headers: {
        Authorization: `Bearer ${linetoken}`,
      },
    });

    return true;
  } catch (err) {
    console.log('error: ', err);
    return false;
  }
}

async function sendToApprover(leaveTransactionID, body, dataApprover, useDay, useHour) {
  try {
    let pool = await new dbQuery().connect();
    var sql = `SELECT * FROM [USER] WHERE id = ${body.fk_user_id} AND is_active = 1 AND IS_VERIFY = 1`;
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
                      "text": `ชื่อ-นามสกุล: ${dataUser.fullname}\nตำแหน่ง: ${dataUser.POSITION}\nแผนก: ${dataUser.DEPARTMENT}\nฝ่าย: ${dataUser.FACTION}`,
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
                      "text": `ชื่อ-นามสกุล: ${dataUser.fullname}\nตำแหน่ง: ${dataUser.POSITION}\nแผนก: ${dataUser.DEPARTMENT}\nฝ่าย: ${dataUser.FACTION}`,
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
                    "text": `ชื่อ-นามสกุล: ${dataUser.fullname}\nตำแหน่ง: ${dataUser.POSITION}\nแผนก: ${dataUser.DEPARTMENT}\nฝ่าย: ${dataUser.FACTION}`,
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
    // Fetch the user data
    const dataUser = await UsersModel.findOne({ _id: body.fk_user_id, is_active: 1, is_verify: 1 });
    if (!dataUser) {
      throw new Error('User not found or not active/verified');
    }

    // Fetch the Line token
    const configLine = await ConfigLineModel.findOne();
    if (!configLine) {
      throw new Error('Config Line not found');
    }
    const linetoken = configLine.token;

    // Fetch the leave transaction data
    const dataLeaveTransaction = await LeaveTransactionModel.findById(leaveTransactionID);
    if (!dataLeaveTransaction) {
      throw new Error('Leave transaction not found');
    }

    console.log(`To LINEID : ${dataApprover.line_userid}`);

    const data = {
      to: dataApprover.line_userid,
      messages: [
        {
          type: 'flex',
          altText: 'this is a flex message',
          contents: {
            type: 'bubble',
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'text',
                  text: 'แจ้งเตือนการลาออก',
                  weight: 'bold',
                  size: 'lg',
                  align: 'center',
                },
                {
                  type: 'text',
                  text: `เมื่อวันที่ ${moment(new Date()).format('DD/MM/YYYY')}`,
                  weight: 'bold',
                  size: 'lg',
                  align: 'center',
                },
                {
                  type: 'text',
                  text: `เลขคำขอ: ${dataLeaveTransaction.leave_code}`,
                  wrap: true,
                  color: '#666666',
                  size: 'md',
                  margin: 'xxl',
                  flex: 5,
                },
                {
                  type: 'text',
                  text: `ชื่อ-นามสกุล: ${dataUser.fullname}\nตำแหน่ง: ${dataUser.position}\nแผนก: ${dataUser.department}\nฝ่าย: ${dataUser.faction}`,
                  wrap: true,
                  color: '#666666',
                  size: 'md',
                },
                {
                  type: 'text',
                  text: `สถานที่ปฏิบัติงาน: ${dataUser.work_location}\nเหตุผลการลาออก: ${body.leave_reason}`,
                  wrap: true,
                  color: '#666666',
                  size: 'md',
                },
                {
                  type: 'text',
                  text: `วันที่ทำงานวันสุดท้าย: ${moment(body.leave_to_date).format('DD/MM/YYYY')}\nมีผลลาออกวันที่: ${moment(body.leave_end_date).format('DD/MM/YYYY')}\nมีกองทุนหรือไม่?: ${body.fund_type}`,
                  wrap: true,
                  color: '#666666',
                  size: 'md',
                },
                {
                  type: 'text',
                  text: `ต้องการขอหนังสือรับรอง?: ${body.flag_certificate}`,
                  wrap: true,
                  color: '#666666',
                  size: 'md',
                },
              ],
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  height: 'sm',
                  action: {
                    type: 'uri',
                    label: 'ดูข้อมูล',
                    uri: `${process.env.ADMINURL}/LeaveApprove?id=${dataLeaveTransaction._id}&approver=${dataApprover.line_userid}`,
                  },
                  color: '#00C4B5',
                  adjustMode: 'shrink-to-fit',
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'button',
                      style: 'primary',
                      height: 'sm',
                      action: {
                        type: 'postback',
                        label: 'รับทราบ',
                        data: `action=leaveinform&leavetransactionid=${dataLeaveTransaction._id}&approver=${dataApprover.line_userid}&status=2`,
                      },
                      color: '#4CD964',
                      adjustMode: 'shrink-to-fit',
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    };

    await axios.post('https://api.line.me/v2/bot/message/push', data, {
      headers: {
        Authorization: `Bearer ${linetoken}`,
      },
    });

    return true;
  } catch (err) {
    console.log('error: ', err);
    return false;
  }
}