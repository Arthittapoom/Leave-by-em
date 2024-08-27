const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');
const moment = require('moment');
const LeaveType = require('../models/leave_type');
const EmployeeType = require('../models/employee_type');
const Role = require('../models/mas_role');
const PeriodTime = require('../models/period_time');
const WorkLocation = require('../models/mas_worklocation');
const UsersModel = require('../models/users');
const AdminsModel = require('../models/admins.js');

exports.getPeriodTime = catchAsync(async (req, res, next) => {
  const periodTimes = await PeriodTime.find();
  res.status(200).json({
    status: 'success',
    data: periodTimes,
  });
});

exports.getRole = catchAsync(async (req, res, next) => {
  const roles = await Role.find();
  res.status(200).json({
    status: 'success',
    data: roles,
  });
});

exports.getEmployeeAdmin = catchAsync(async (req, res, next) => {
  let users = await UsersModel.find({
    is_active: true,
    $or: [{ IS_RETIRE: null }, { IS_RETIRE: { $ne: 1 } }],
  });
  let admins = await AdminsModel.find({});
  let adminUserIds = new Set(admins.map(admin => admin.fk_user_id ? admin.fk_user_id.toString() : null));
  let nonAdminUsers = users.filter(user => user._id && !adminUserIds.has(user._id.toString()));
  res.status(200).json({
    status: 'success',
    data: nonAdminUsers,
  });
});

exports.getEmployee = catchAsync(async (req, res, next) => {
  const searchtxt = req.query.search && req.query.search !== 'null' ? req.query.search.replace("(", "\\(").replace(")", "\\)") : "";

  const searchCriteria = {
    is_active: true,
    $or: [{ IS_RETIRE: null }, { IS_RETIRE: { $ne: 1 } }],
    _id: { $ne: req.params.id }
  };

  if (searchtxt) {
    searchCriteria.$text = { $search: searchtxt };
  }

  const users = await UsersModel.find(searchCriteria);

  res.status(200).json({
    status: 'success',
    data: users,
  });
});

exports.getWorkLocation = catchAsync(async (req, res, next) => {
  const workLocations = await WorkLocation.find();
  console.log(workLocations);
  res.status(200).json({
    status: 'success',
    data: workLocations,
  });
});

exports.getOptionEmployeeType = catchAsync(async (req, res, next) => {
  const employeeTypes = await EmployeeType.find();
  res.status(200).json({
    status: 'success',
    data: employeeTypes,
  });
});

exports.getLeaveType = catchAsync(async (req, res, next) => {
  const leaveTypes = await LeaveType.find();
  res.status(200).json({
    status: 'success',
    data: leaveTypes,
  });
});

exports.getLeaveMaster = catchAsync(async (req, res, next) => {
  const year = req.query.year ? req.query.year : moment(new Date()).format('YYYY');
  const leaveTypeId = req.query.leaveType;

  // console.log('Year:', year);
  // console.log('Leave Type ID:', leaveTypeId);

  const leaveTypes = await LeaveType.aggregate([
    {
      $lookup: {
        from: 'leavetypedetails',
        localField: '_id',
        foreignField: 'fk_leave_type_id',
        as: 'details'
      }
    },
    {
      $unwind: {
        path: '$details',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        $or: [
          { 'details.year': parseInt(year), 'details.fk_employee_type_id': leaveTypeId },
          { 'details': { $exists: false } }
        ]
      }
    },
    {
      $project: {
        id: '$_id',
        leave_name: '$name',
        qty: { $ifNull: ['$details.qty', 0] }
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: leaveTypes,
  });
});